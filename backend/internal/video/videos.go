package video

import (
	"github.com/jmoiron/sqlx"
	log "github.com/sirupsen/logrus"
)

type Service struct {
	tLog *log.Entry
	db   *sqlx.DB
}

// NewService creates a new video service instance
func NewService(logger *log.Entry, db *sqlx.DB) *Service {
	logger.Info("initializing ticket service...")
	return &Service{
		tLog: logger,
		db:   db,
	}
}
