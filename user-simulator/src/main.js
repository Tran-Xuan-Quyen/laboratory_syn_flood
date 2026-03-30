const DEFAULT_DURATION = 600;
const DEFAULT_INTERVAL = 0.5;
const DEFAULT_TIMEOUT = 5;
const DEFAULT_WARMUP = 60;

function formatFetchError(err) {
  const parts = [err.name, err.message];
  if (err.cause) {
    const c = err.cause;
    parts.push(c.code || c.errno || c.syscall || '', c.message || String(c));
  }
  return parts.filter(Boolean).join(' | ');
}

async function measureRequest(url, timeoutMs) {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs * 1000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Connection: 'close',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
    clearTimeout(timeoutId);
    const elapsed = (performance.now() - start) / 1000;
    return { success: res.ok, timeout: false, elapsed, status: res.status };
  } catch (err) {
    clearTimeout(timeoutId);
    const elapsed = (performance.now() - start) / 1000;
    const isTimeout = err.name === 'AbortError';
    return { success: false, timeout: isTimeout, elapsed, error: formatFetchError(err) };
  }
}

async function probeUrl(label, url, timeoutMs) {
  const r = await measureRequest(url, timeoutMs);
  if (r.success) {
    console.log(`${label} OK (${r.elapsed.toFixed(3)}s) ${url}`);
    return true;
  }
  console.error(`${label} FAIL: ${r.error || r.status} ${url}`);
  return false;
}

function p95(times) {
  if (times.length === 0) return 0;
  const sorted = [...times].sort((a, b) => a - b);
  const idx = Math.ceil(times.length * 0.95) - 1;
  return sorted[Math.max(0, idx)] * 1000;
}

function avg(times) {
  if (times.length === 0) return 0;
  return (times.reduce((a, b) => a + b, 0) / times.length) * 1000;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const victimUrls = [];
  let namesStr = '';
  const opts = {
    duration: DEFAULT_DURATION,
    interval: DEFAULT_INTERVAL,
    timeout: DEFAULT_TIMEOUT,
    warmup: DEFAULT_WARMUP,
    victim1: 'http://127.0.0.1:3001/projects/',
    victim2: 'http://127.0.0.1:3002/projects/',
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--victim' && args[i + 1]) victimUrls.push(args[++i]);
    else if (args[i] === '--names' && args[i + 1]) namesStr = args[++i];
    else if (args[i] === '--victim1' && args[i + 1]) opts.victim1 = args[++i];
    else if (args[i] === '--victim2' && args[i + 1]) opts.victim2 = args[++i];
    else if (args[i] === '--duration' && args[i + 1]) opts.duration = parseInt(args[++i], 10);
    else if (args[i] === '--interval' && args[i + 1]) opts.interval = parseFloat(args[++i]);
    else if (args[i] === '--timeout' && args[i + 1]) opts.timeout = parseFloat(args[++i]);
    else if (args[i] === '--warmup' && args[i + 1]) opts.warmup = parseInt(args[++i], 10);
  }
  const names = namesStr
    ? namesStr.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  let victims;
  if (victimUrls.length > 0) {
    victims = victimUrls.map((url, i) => ({
      url,
      name: names[i] || `V${i + 1}`,
    }));
  } else {
    victims = [
      { url: opts.victim1, name: names[0] || 'limited' },
      { url: opts.victim2, name: names[1] || 'unlimited' },
    ];
  }
  return { ...opts, victims };
}

async function probeWithRetries(victims, timeout, attempts = 5, delayMs = 3000) {
  for (let i = 1; i <= attempts; i++) {
    let allOk = true;
    for (const v of victims) {
      const ok = await probeUrl(v.name, v.url, timeout);
      if (!ok) allOk = false;
    }
    if (allOk) return true;
    if (i < attempts) {
      console.log(`Retry ${i}/${attempts - 1} in ${delayMs / 1000}s...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

async function runSimulator({ victims, duration, interval, timeout, warmup }) {
  const stats = victims.map(() => ({
    success: 0,
    timeout: 0,
    fail: 0,
    times: [],
  }));
  const endTime = Date.now() + warmup * 1000 + duration * 1000;
  let nextReq = Date.now() + warmup * 1000;
  let lastLog = Date.now();
  const logInterval = 30;

  console.log('Connectivity check (victims must be up):');
  const ok = await probeWithRetries(victims, timeout);
  if (!ok) {
    console.error('');
    console.error('Use --victim URL (repeat) or --victim1 / --victim2 (legacy).');
    console.error('Docker lab: 172.20.0.10–14:3000 on lab_net.');
    process.exit(1);
  }
  console.log('');

  if (warmup > 0) {
    console.log(`Warmup ${warmup}s (attacker fills backlog, no requests yet)...`);
    await new Promise((r) => setTimeout(r, warmup * 1000));
    console.log('Warmup done, starting requests');
  }

  console.log(`Running for ${duration}s, interval ${interval}s, timeout ${timeout}s`);
  victims.forEach((v) => console.log(`  ${v.name}: ${v.url}`));
  console.log(`Progress log every ${logInterval}s`);
  console.log('-'.repeat(60));

  const failLogged = victims.map(() => 0);

  while (Date.now() < endTime) {
    if (Date.now() >= nextReq) {
      const results = await Promise.all(victims.map((v) => measureRequest(v.url, timeout)));

      results.forEach((r, idx) => {
        const s = stats[idx];
        if (r.success) {
          s.success++;
          s.times.push(r.elapsed);
        } else if (r.timeout) {
          s.timeout++;
        } else {
          s.fail++;
          if (failLogged[idx] < 5) {
            console.log(`${victims[idx].name} fail: ${r.status || r.error}`);
            failLogged[idx]++;
          }
        }
      });

      nextReq += interval * 1000;

      if (Date.now() - lastLog >= logInterval * 1000) {
        const elapsed = Math.round((Date.now() - (endTime - duration * 1000)) / 1000);
        const parts = victims.map((v, i) => {
          const s = stats[i];
          const t = s.success + s.timeout + s.fail;
          return `${v.name}: ${s.success}/${t} ok, ${s.timeout} to`;
        });
        console.log(`[${elapsed}s] ${parts.join(' | ')}`);
        lastLog = Date.now();
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('COMPARISON REPORT (during SYN flood attack)');
  console.log('='.repeat(60));

  victims.forEach((v, i) => {
    const s = stats[i];
    const total = s.success + s.timeout + s.fail;
    const timeoutRate = total ? (s.timeout / total) * 100 : 0;
    console.log('');
    console.log(`--- ${v.name} ---`);
    console.log(`  Total requests: ${total}`);
    console.log(`  Success: ${s.success}`);
    console.log(`  Timeout: ${s.timeout}`);
    console.log(`  Other fail: ${s.fail}`);
    console.log(`  Timeout rate %: ${timeoutRate.toFixed(2)}`);
    console.log(`  Avg response time (ms): ${avg(s.times).toFixed(2)}`);
    console.log(`  P95 response time (ms): ${p95(s.times).toFixed(2)}`);
  });

  console.log('\n' + '='.repeat(60));
}

const opts = parseArgs();
runSimulator(opts).catch(console.error);
