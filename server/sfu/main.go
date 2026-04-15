package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/vivek/mingale-sfu/internal/config"
)

func main() {
	log.Println("Starting Mingale Go SFU...")

	// 1. Load config (INTERNAL_SECRET, etc)
	cfg := config.Load()
	log.Println("Config loaded successfully.")

	// 2. Setup router
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// TODO: POST /offer endpoint

	// 3. Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("SFU Server listening on %s (UDP allocated dynamically)\n", addr)

	if err := http.ListenAndServe(addr, enableCORS(mux)); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

// enableCORS is a simple middleware to allow cross-origin requests from the browser
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// In production, restrict this to specific origins
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
