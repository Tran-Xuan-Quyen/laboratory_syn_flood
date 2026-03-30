FROM golang:1.21-alpine

RUN apk add --no-cache libpcap-dev gcc libc-dev tcpdump

WORKDIR /app

ENV GOTOOLCHAIN=local
ENV GOPROXY=https://proxy.golang.org,https://goproxy.io,direct
ENV GOSUMDB=sum.golang.org

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o /usr/local/bin/attacker-code .

CMD ["attacker-code", "-target-ip=172.20.0.10,172.20.0.11", "-target-port=3000", "-workers=500"]