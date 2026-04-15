package signal

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/pion/webrtc/v4"
	"github.com/vivek/mingale-sfu/internal/config"
	"github.com/vivek/mingale-sfu/internal/room"
	webrtcEngine "github.com/vivek/mingale-sfu/internal/webrtc"
)

type Handler struct {
	config *config.Config
	rooms  *room.Manager
	api    *webrtc.API
}

func NewHandler(cfg *config.Config, rooms *room.Manager, api *webrtc.API) *Handler {
	return &Handler{
		config: cfg,
		rooms:  rooms,
		api:    api,
	}
}

type OfferRequest struct {
	SDP    string `json:"sdp"`
	Ticket string `json:"ticket"`
}

type TicketPayload struct {
	UserID string `json:"userId"`
	RoomID string `json:"roomId"`
	Exp    int64  `json:"exp"`
}

func (h *Handler) verifyTicket(ticket string) (*TicketPayload, error) {
	parts := strings.SplitN(ticket, ".", 2)
	if len(parts) != 2 {
		return nil, fmt.Errorf("malformed ticket")
	}
	payloadB64, sig := parts[0], parts[1]

	// 1. Verify HMAC signature
	mac := hmac.New(sha256.New, []byte(h.config.InternalSecret))
	mac.Write([]byte(payloadB64))
	expectedSig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expectedSig), []byte(sig)) {
		return nil, fmt.Errorf("invalid signature")
	}

	// 2. Decode payload
	payloadBytes, err := base64.RawURLEncoding.DecodeString(payloadB64)
	if err != nil {
		return nil, fmt.Errorf("decode error: %v", err)
	}

	var payload TicketPayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return nil, fmt.Errorf("unmarshal error: %v", err)
	}

	// 3. Check expiry
	if time.Now().Unix() > payload.Exp {
		return nil, fmt.Errorf("ticket expired")
	}

	return &payload, nil
}

func (h *Handler) HandleOffer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req OfferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	// Verify the ticket BEFORE doing ANY WebRTC stuff
	payload, err := h.verifyTicket(req.Ticket)
	if err != nil {
		log.Printf("Unauthorized offer rejected: %v", err)
		http.Error(w, "unauthorized: "+err.Error(), http.StatusUnauthorized)
		return
	}

	log.Printf("Valid ticket: User %s joining Room %s", payload.UserID, payload.RoomID)

	// Create PeerConnection
	pc, err := h.api.NewPeerConnection(webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{URLs: []string{"stun:stun.l.google.com:19302"}},
		},
	})
	if err != nil {
		http.Error(w, "Failed to create PC", http.StatusInternalServerError)
		return
	}

	// Register Peer to Room
	peer := room.NewPeer(payload.UserID, pc)
	rm := h.rooms.GetRoom(payload.RoomID)
	rm.AddPeer(peer)

	// Context for preventing goroutine leaks
	ctx, cancel := context.WithCancel(context.Background())

	pc.OnConnectionStateChange(func(state webrtc.PeerConnectionState) {
		log.Printf("Peer %s state: %s", payload.UserID, state.String())
		if state == webrtc.PeerConnectionStateClosed || state == webrtc.PeerConnectionStateFailed {
			cancel()
			rm.RemovePeer(payload.UserID)

			// Fire webhook back to Node.js
			go func() {
				webhookPayload := fmt.Sprintf(`{"userId":"%s", "roomId":"%s"}`, payload.UserID, payload.RoomID)
				payloadB64 := base64.RawURLEncoding.EncodeToString([]byte(webhookPayload))
				
				mac := hmac.New(sha256.New, []byte(cfg.InternalSecret))
				mac.Write([]byte(payloadB64))
				sig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
				
				token := fmt.Sprintf("%s.%s", payloadB64, sig)

				req, err := http.NewRequest("POST", "http://localhost:3001/api/internal/voice-disconnect", strings.NewReader(webhookPayload))
				if err == nil {
					req.Header.Set("Content-Type", "application/json")
					req.Header.Set("Authorization", "Bearer "+token)
					res, err := http.DefaultClient.Do(req)
					if err != nil {
						log.Printf("Failed to notify Node.js of disconnect: %v", err)
					} else {
						res.Body.Close()
					}
				}
			}()
		}
	})

	pc.OnTrack(func(trackRemote *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
		log.Printf("Track received from %s: %s", payload.UserID, trackRemote.Kind().String())
		
		others := rm.GetPeers()
		otherPCs := make([]*webrtc.PeerConnection, 0)
		for _, p := range others {
			if p.ID != payload.UserID {
				otherPCs = append(otherPCs, p.Connection)
			}
		}

		webrtcEngine.ForwardTrack(ctx, trackRemote, receiver, payload.UserID, otherPCs)
	})

	offer := webrtc.SessionDescription{
		Type: webrtc.SDPTypeOffer,
		SDP:  req.SDP,
	}

	if err := pc.SetRemoteDescription(offer); err != nil {
		http.Error(w, "SetRemoteDescription failed", http.StatusInternalServerError)
		return
	}

	answer, err := pc.CreateAnswer(nil)
	if err != nil {
		http.Error(w, "CreateAnswer failed", http.StatusInternalServerError)
		return
	}

	gatherComplete := webrtc.GatheringCompletePromise(pc)
	if err := pc.SetLocalDescription(answer); err != nil {
		http.Error(w, "SetLocalDescription failed", http.StatusInternalServerError)
		return
	}
	<-gatherComplete

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"sdp": pc.LocalDescription().SDP,
	})
}

type KickRequest struct {
	UserID string `json:"userId"`
	RoomID string `json:"roomId"`
}

func (h *Handler) HandleKick(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate the Webhook token using same logic but via Authorization header
	authHeader := r.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		http.Error(w, "Missing token", http.StatusUnauthorized)
		return
	}

	ticket := strings.TrimPrefix(authHeader, "Bearer ")
	parts := strings.SplitN(ticket, ".", 2)
	if len(parts) != 2 {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// We simply verify the HMAC of the payload, we don't need a strict "TicketPayload"
	// structure since this represents an arbitrary internal webhook payload.
	mac := hmac.New(sha256.New, []byte(h.config.InternalSecret))
	mac.Write([]byte(parts[0]))
	expectedSig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expectedSig), []byte(parts[1])) {
		http.Error(w, "Invalid signature", http.StatusUnauthorized)
		return
	}

	var req KickRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	log.Printf("KICK Webhook triggered for User %s in Room %s", req.UserID, req.RoomID)
	// TODO: Look up Room, find Peer, close PeerConnection

	w.WriteHeader(http.StatusOK)
}
