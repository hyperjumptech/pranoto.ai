package video

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func (s *Service) NewVideoRoutes(r *chi.Mux) (http.Handler, error) {
	s.tLog.WithField("fn", "NewVideoRoutes").Info("Initializing video routes")
	// ticketing routes
	r.Post("/v1/upload", s.NotImplemented)
	r.Get("/v1/search", s.NotImplemented)

	return r, nil
}

func (s *Service) NotImplemented(w http.ResponseWriter, r *http.Request) {

}
