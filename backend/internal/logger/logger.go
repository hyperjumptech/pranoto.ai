package logger

import (
	"backend/config"
	"os"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
)

// initLogger setups log formatting etc
func InitLogger() (*logrus.Logger, error) {

	lLevel := config.Get("server.log.level")

	var log = &logrus.Logger{
		Out:       os.Stderr,
		Formatter: new(logrus.JSONFormatter),
		Hooks:     make(logrus.LevelHooks),
		Level:     logrus.DebugLevel,
	}

	log.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: time.RFC3339,
		PrettyPrint:     false, // ugh, prettyprint be so ugly
	})
	log.Info("Setting log level to: ", lLevel)

	switch strings.ToUpper(lLevel) {
	default:
		log.Info("Unknown level [", lLevel, "]. Log level set to ERROR")
		log.SetLevel(logrus.ErrorLevel)
	case "TRACE":
		log.SetLevel(logrus.TraceLevel)
	case "DEBUG":
		log.SetLevel(logrus.DebugLevel)
	case "INFO":
		log.SetLevel(logrus.InfoLevel)
	case "WARN":
		log.SetLevel(logrus.WarnLevel)
	case "ERROR":
		log.SetLevel(logrus.ErrorLevel)
	case "FATAL":
		log.SetLevel(logrus.FatalLevel)
	}

	return log, nil
}
