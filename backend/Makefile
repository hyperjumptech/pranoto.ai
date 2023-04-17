# hyper-wallet makefile

CURRENT_PATH ?= $(shell pwd)
IMAGE_NAME ?= video-go-img

.PHONY: all test clean build docker

build: lint
	#go build -a -o $(IMAGE_NAME) main.go
	GO_ENABLED=0 go build -a -ldflags '-extldflags "-static"' -o $(IMAGE_NAME) main.go

clean:
	go clean
	rm -f $(IMAGE_NAME)

lint: 
	go fmt ./...
	staticcheck ./...

test-short: lint
	go test ./... -v -covermode=count -coverprofile=coverage.out -short

test: lint
	go test ./... -v -race -covermode=atomic -coverprofile=coverage.out

run: build
	go run main.go

test-coverage: test
	go tool cover -html=coverage.out

docker:
	docker build -t $(IMAGE_NAME) -f ./Dockerfile .

docker-run:
	docker run -p 3000:3000 -d $(IMAGE_NAME)
