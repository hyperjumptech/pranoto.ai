package internal

import (
	"backend/config"
	"backend/internal/db"
	"backend/internal/logger"
	"backend/internal/video"
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

var (
	logs *logrus.Logger

	// StartUpTime records first ime up
	startUpTime time.Time
	// ServerVersion is a semver versioning
	serverVersion string
	address       string

	// HTTPServer object
	HTTPServer *http.Server

	router       *chi.Mux
	routeHandler http.Handler

	videoSvc *video.Service
)

// InitializeServer sets up all server configs and connections
func initializeServer() error {

	// load system / env configs
	config.LoadConfig()
	logs, _ = logger.InitLogger()
	logf := logs.WithField("fn", "InitializeServer")
	logf.Info("initializing...")

	startUpTime = time.Now()
	serverVersion = config.Get("app.version")
	address = fmt.Sprintf("%s:%s", config.Get("server.host"), config.Get("server.port"))

	router = chi.NewRouter()
	routeHandler = InitRouting(router, logs.WithFields(logrus.Fields{"module": "routing"}))

	dbRepo, err := db.NewDBService(logs.WithFields(logrus.Fields{"module": "sqlx"}))
	if err != nil {
		logf.Warn("Couldn't connect to DB, got err:", err)
	}

	videoSvc = video.NewService(logs.WithFields(logrus.Fields{"module": "video"}), dbRepo)

	routeHandler, _ = videoSvc.NewVideoRoutes(router)

	address = fmt.Sprintf("%s:%s", config.Get("server.host"), config.Get("server.port"))
	HTTPServer = &http.Server{
		Addr:         address,
		WriteTimeout: time.Second * 15, // Good practice to set timeouts to avoid Slowloris attacks.
		ReadTimeout:  time.Second * 15,
		IdleTimeout:  time.Second * 60,
		Handler:      routeHandler, // Pass our instance of gorilla/mux in.
	}

	return nil
}

func ServerStart() {
	initializeServer()
	srvLog := logs.WithField("fn", "ServerStart")
	// Server run context
	serverCtx, serverStopCtx := context.WithCancel(context.Background())

	// Listen for syscall signals for process to interrupt/quit
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
	go func() {
		<-sig

		// Shutdown signal with grace period of 30 seconds
		shutdownCtx, cancelCtx := context.WithTimeout(serverCtx, 30*time.Second)
		defer cancelCtx()

		defer func() {
			if err := db.CloseDB(); err != nil {
				srvLog.Errorf("DB Close err : %v", err)
			}
		}()

		go func() {
			<-shutdownCtx.Done()
			if shutdownCtx.Err() == context.DeadlineExceeded {
				srvLog.Fatal("graceful shutdown timed out.. forcing exit.")
			}
		}()

		// Trigger graceful shutdown
		err := HTTPServer.Shutdown(shutdownCtx)
		if err != nil {
			srvLog.Fatal(err)
		}
		serverStopCtx()
	}()

	// START ALL SERVER COMPONENT HERE
	srvLog.Info("App version: ", serverVersion, ", listening at: ", address)

	//ctx := context.Background()
	defer func() {
		// TERMINATE ALL SERVER COMPONENT HERE, EG. DB
		// if err := db.Close(ctx); err != nil {
		//	serverLog.Error("DB Close err : ", err)
		// }
	}()

	// Run the server
	err := HTTPServer.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		srvLog.Fatal(err)
	}

	t := time.Now()
	upTime := t.Sub(startUpTime)
	fmt.Println("server was up for : ", upTime.String(), " *******")

	// Wait for server context to be stopped
	<-serverCtx.Done()
}
