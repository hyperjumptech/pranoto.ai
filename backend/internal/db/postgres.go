// interfaces to the postgres db
package db

import (
	"backend/config"
	"context"
	"time"

	"github.com/jmoiron/sqlx"

	//Anonymous import for postgress initialiation
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
)

var (
	//Db instance
	db *sqlx.DB
)

func NewDBService(sqlxLog *log.Entry) (*sqlx.DB, error) {
	logf := sqlxLog.WithField("fn", "InitializeDBInstance")

	psqlConnectStr := config.Get("database.url")
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	db, err := sqlx.ConnectContext(ctx, "postgres", psqlConnectStr)
	if err != nil {
		logf.Error("Connection to database error: ", err)
		return nil, err
	}
	logf.Info("db connection and ping successful...wohooo!")

	return db, nil
}

// CloseDB close db connection
func CloseDB() error {
	if db != nil {
		return db.Close()
	}
	return nil
}
