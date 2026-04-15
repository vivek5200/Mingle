package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	InternalSecret string
	Port           string
}

func Load() *Config {
	// Try loading ../.env because the SFU runs from server/sfu
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println("Config: No ../.env file found (this is fine if env vars are set externally)")
	}

	secret := os.Getenv("INTERNAL_SECRET")
	if secret == "" {
		log.Fatal("FATAL: INTERNAL_SECRET is required to boot the SFU")
	}

	port := os.Getenv("SFU_PORT")
	if port == "" {
		// As defined in ARCHITECTURE.md
		port = "8080"
	}

	return &Config{
		InternalSecret: secret,
		Port:           port,
	}
}
