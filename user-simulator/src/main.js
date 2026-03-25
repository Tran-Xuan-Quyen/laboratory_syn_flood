const DEFAULT_DURATION = 600;
const DEFAULT_INTERVAL = 0.5;
const DEFAULT_TIMEOUT = 5;
const DEFAULT_WARMUP = 60;

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
    return { success: false, timeout: isTimeout, elapsed, error: err.code || err.message };
  }
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
  const opts = {
    victim1: 'http://127.0.0.1:3001/projects/',
    victim2: 'http://127.0.0.1:3002/projects/',
    duration: DEFAULT_DURATION,
    interval: DEFAULT_INTERVAL,
    timeout: DEFAULT_TIMEOUT,
    warmup: DEFAULT_WARMUP,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--victim1' && args[i + 1]) opts.victim1 = args[++i];
    else if (args[i] === '--victim2' && args[i + 1]) opts.victim2 = args[++i];
    else if (args[i] === '--duration' && args[i + 1]) opts.duration = parseInt(args[++i], 10);
    else if (args[i] === '--interval' && args[i + 1]) opts.interval = parseFloat(args[++i]);
    else if (args[i] === '--timeout' && args[i + 1]) opts.timeout = parseFloat(args[++i]);
    else if (args[i] === '--warmup' && args[i + 1]) opts.warmup = parseInt(args[++i], 10);
  }
  return opts;
}

async function runSimulator({ victim1, victim2, duration, interval, timeout, warmup }) {
  const stats1 = { success: 0, timeout: 0, fail: 0, times: [] };
  const stats2 = { success: 0, timeout: 0, fail: 0, times: [] };
  const endTime = Date.now() + warmup * 1000 + duration * 1000;
  let nextReq = Date.now() + warmup * 1000;
  let lastLog = Date.now();
  const logInterval = 30;

  if (warmup > 0) {
    console.log(`Warmup ${warmup}s (attacker fills backlog, no requests yet)...`);
    await new Promise((r) => setTimeout(r, warmup * 1000));
    console.log('Warmup done, starting requests');
  }

  console.log(`Running for ${duration}s, interval ${interval}s, timeout ${timeout}s`);
  console.log(`Victim 1 (limited):  ${victim1}`);
  console.log(`Victim 2 (unlimited): ${victim2}`);
  console.log(`Progress log every ${logInterval}s`);
  console.log('-'.repeat(60));

  while (Date.now() < endTime) {
    if (Date.now() >= nextReq) {
      const [r1, r2] = await Promise.all([
        measureRequest(victim1, timeout),
        measureRequest(victim2, timeout),
      ]);

      if (r1.success) {
        stats1.success++;
        stats1.times.push(r1.elapsed);
      } else {
        if (r1.timeout) stats1.timeout++;
        else {
          stats1.fail++;
          if (stats1.fail <= 3) console.log(`V1 fail: ${r1.status || r1.error}`);
        }
      }

      if (r2.success) {
        stats2.success++;
        stats2.times.push(r2.elapsed);
      } else {
        if (r2.timeout) stats2.timeout++;
        else {
          stats2.fail++;
          if (stats2.fail <= 3) console.log(`V2 fail: ${r2.status || r2.error}`);
        }
      }

      nextReq += interval * 1000;

      if (Date.now() - lastLog >= logInterval * 1000) {
        const t1 = stats1.success + stats1.timeout + stats1.fail;
        const t2 = stats2.success + stats2.timeout + stats2.fail;
        const elapsed = Math.round((Date.now() - (endTime - duration * 1000)) / 1000);
        console.log(`[${elapsed}s] V1: ${stats1.success}/${t1} ok, ${stats1.timeout} timeout | V2: ${stats2.success}/${t2} ok, ${stats2.timeout} timeout`);
        lastLog = Date.now();
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  const total1 = stats1.success + stats1.timeout + stats1.fail;
  const total2 = stats2.success + stats2.timeout + stats2.fail;

  const timeoutRate1 = total1 ? (stats1.timeout / total1) * 100 : 0;
  const timeoutRate2 = total2 ? (stats2.timeout / total2) * 100 : 0;

  console.log('\n' + '='.repeat(60));
  console.log('COMPARISON REPORT (during SYN flood attack)');
  console.log('='.repeat(60));
  console.log(`\n${'Metric'.padEnd(30)} ${'Victim 1 (limited)'.padEnd(20)} ${'Victim 2 (unlimited)'.padEnd(20)}`);
  console.log('-'.repeat(70));
  console.log(`${'Total requests'.padEnd(30)} ${String(total1).padEnd(20)} ${String(total2).padEnd(20)}`);
  console.log(`${'Success'.padEnd(30)} ${String(stats1.success).padEnd(20)} ${String(stats2.success).padEnd(20)}`);
  console.log(`${'Timeout'.padEnd(30)} ${String(stats1.timeout).padEnd(20)} ${String(stats2.timeout).padEnd(20)}`);
  console.log(`${'Other fail'.padEnd(30)} ${String(stats1.fail).padEnd(20)} ${String(stats2.fail).padEnd(20)}`);
  console.log(`${'Timeout rate %'.padEnd(30)} ${timeoutRate1.toFixed(2).padEnd(20)} ${timeoutRate2.toFixed(2).padEnd(20)}`);
  console.log(`${'Avg response time (ms)'.padEnd(30)} ${avg(stats1.times).toFixed(2).padEnd(20)} ${avg(stats2.times).toFixed(2).padEnd(20)}`);
  console.log(`${'P95 response time (ms)'.padEnd(30)} ${p95(stats1.times).toFixed(2).padEnd(20)} ${p95(stats2.times).toFixed(2).padEnd(20)}`);
  console.log('='.repeat(60));
}

const opts = parseArgs();
runSimulator(opts).catch(console.error);
