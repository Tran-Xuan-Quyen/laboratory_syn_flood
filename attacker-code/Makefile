.PHONY: run build clean test

run:
	go run main.go

build:
	go build -o bin/attacker-code main.go

clean:
	rm -rf bin/

test:
	go test ./...

tidy:
	go mod tidy

