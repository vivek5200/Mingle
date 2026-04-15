package webrtc

import (
	"context"
	"log"

	"github.com/pion/interceptor"
	"github.com/pion/webrtc/v4"
)

// InitEngine creates a WebRTC API engine configured for standard browser codes (VP8/Opus)
func InitEngine() (*webrtc.API, error) {
	m := &webrtc.MediaEngine{}

	if err := m.RegisterDefaultCodecs(); err != nil {
		return nil, err
	}

	// This is the interceptor registry needed to handle RTCP, SRTP, etc
	i := &interceptor.Registry{}
	if err := webrtc.RegisterDefaultInterceptors(m, i); err != nil {
		return nil, err
	}

	api := webrtc.NewAPI(webrtc.WithMediaEngine(m), webrtc.WithInterceptorRegistry(i))
	return api, nil
}

// ForwardTrack sets up the Track Local on all OTHER peers in the room
// Note: You must pass in the Room package (we can inject dependencies in the handler)
func ForwardTrack(ctx context.Context, trackRemote *webrtc.TrackRemote, receiver *webrtc.RTPReceiver, localPeerID string, otherPeers []*webrtc.PeerConnection) {
	// Create a local track, which we will use to forward the incoming RTP packets
	trackLocal, err := webrtc.NewTrackLocalStaticRTP(
		trackRemote.Codec().RTPCodecCapability,
		trackRemote.ID(),
		trackRemote.StreamID(),
	)
	if err != nil {
		log.Printf("Failed to create local track: %v", err)
		return
	}

	// Loop over all other peers and add the track
	for _, pc := range otherPeers {
		sender, err := pc.AddTrack(trackLocal)
		if err != nil {
			log.Printf("Failed to add track to peer: %v", err)
			continue
		}

		// Read RTCP packets from the sender in a goroutine
		go func(s *webrtc.RTPSender) {
			for {
				select {
				case <-ctx.Done():
					return
				default:
					_, _, rtcpErr := s.ReadRTCP()
					if rtcpErr != nil {
						return
					}
				}
			}
		}(sender)

		// Create a new offer for the peer to negotiate
		// For a full SFU, we would use renegotiation (onnegotiationneeded) here.
	}

	// Fan-Out loop: Read RTP packets from remote and write to local
	go func() {
		defer log.Printf("Track forwarding Goroutine exited safely for track %s", trackRemote.ID())
		for {
			select {
			case <-ctx.Done():
				return
			default:
				packet, _, readErr := trackRemote.ReadRTP()
				if readErr != nil {
					return
				}

				if writeErr := trackLocal.WriteRTP(packet); writeErr != nil {
					return
				}
			}
		}
	}()
}
