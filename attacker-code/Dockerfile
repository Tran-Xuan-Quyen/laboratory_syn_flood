FROM golang:1.21-alpine

# Cài đặt thư viện libpcap-dev để Go có thể can thiệp vào network
RUN apk add --no-cache libpcap-dev gcc libc-dev tcpdump

WORKDIR /app
COPY . .
RUN go mod tidy
RUN go build -o /usr/local/bin/attacker-code main.go

# Chạy với quyền cao nhất để có quyền gửi raw packet
CMD ["attacker-code", "-target-ip=172.20.0.10,172.20.0.11", "-target-port=3000", "-workers=500"]