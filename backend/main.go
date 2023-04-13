package main

import (
	"backend/internal"
	"fmt"
)

const (
	splashScreen = `backend service up`
)

func main() {
	fmt.Println(splashScreen)
	internal.ServerStart()
}
