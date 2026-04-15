package room

import (
	"sync"

	"github.com/pion/webrtc/v4"
)

// Peer represents a single user's connection to the SFU
type Peer struct {
	ID         string
	Connection *webrtc.PeerConnection
	closeChan  chan struct{}
}

func NewPeer(id string, pc *webrtc.PeerConnection) *Peer {
	return &Peer{
		ID:         id,
		Connection: pc,
		closeChan:  make(chan struct{}),
	}
}

func (p *Peer) Close() {
	p.Connection.Close()
	close(p.closeChan)
}

// Room manages multiple Peers safely
type Room struct {
	ID    string
	peers map[string]*Peer
	mu    sync.RWMutex
}

func NewRoom(id string) *Room {
	return &Room{
		ID:    id,
		peers: make(map[string]*Peer),
	}
}

func (r *Room) AddPeer(p *Peer) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.peers[p.ID] = p
}

func (r *Room) RemovePeer(peerID string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if p, ok := r.peers[peerID]; ok {
		p.Close()
		delete(r.peers, peerID)
	}
}

// GetPeers returns a snapshot of all current peers (safely)
func (r *Room) GetPeers() []*Peer {
	r.mu.RLock()
	defer r.mu.RUnlock()
	peers := make([]*Peer, 0, len(r.peers))
	for _, p := range r.peers {
		peers = append(peers, p)
	}
	return peers
}

// Manager holds all active rooms
type Manager struct {
	rooms map[string]*Room
	mu    sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		rooms: make(map[string]*Room),
	}
}

func (m *Manager) GetRoom(id string) *Room {
	m.mu.Lock()
	defer m.mu.Unlock()

	if r, ok := m.rooms[id]; ok {
		return r
	}
	r := NewRoom(id)
	m.rooms[id] = r
	return r
}

func (m *Manager) RemoveRoom(id string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.rooms, id)
}
