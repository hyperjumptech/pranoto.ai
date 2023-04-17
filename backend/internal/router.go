package internal

import (
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	log "github.com/sirupsen/logrus"
)

// InitRouting sets up middlewares and server routing
func InitRouting(r *chi.Mux, log *log.Entry) http.Handler {
	rLog := log.WithField("fn", "InitRoutes")
	rLog.Info("initializing routes")

	r.Use(middleware.AllowContentType("application/json", "text/xml", "application/xml"))
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.NoCache)
	r.Use(middleware.Compress(5))

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(middleware.Heartbeat("/health"))

	// swagger UI at /backend/docs
	// FileServer(r, "/backend", http.FS(statics.Docs))

	// ENDPOINTS GOES HERE
	r.Get("/helloworld", HelloWorld)

	return r
}

func HelloWorld(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("<h1>Hello World</h1>"))
}

// FileServer conveniently sets up a http.FileServer handler to serve
// static files from a http.FileSystem.
func FileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", http.StatusMovedPermanently).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}
