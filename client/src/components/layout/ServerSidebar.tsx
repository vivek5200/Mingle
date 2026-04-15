import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../store'
import Modal from '../ui/Modal'
import CreateServerModal from '../server/CreateServerModal'
import JoinServerModal from '../server/JoinServerModal'

export default function ServerSidebar() {
  const servers = useAppStore((s) => s.servers)
  const { serverId } = useParams()
  const navigate = useNavigate()

  // Modal states
  const [showPicker, setShowPicker] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  const handleServerClick = (id: string) => {
    const server = servers.find((s) => s.id === id)
    const firstTextChannel = server?.channels.find((c) => c.type === 'text')
    if (firstTextChannel) {
      navigate(`/servers/${id}/channels/${firstTextChannel.id}`)
    }
  }

  return (
    <>
      <nav className="flex flex-col items-center w-[72px] bg-bg-tertiary py-3 gap-2 shrink-0 overflow-y-auto no-select">
        {/* Home button */}
        <button
          id="home-button"
          onClick={() => navigate('/')}
          className="w-12 h-12 rounded-2xl bg-bg-primary flex items-center justify-center
                     text-text-primary font-bold text-xl hover:bg-blurple hover:rounded-xl
                     transition-all duration-200"
        >
          M
        </button>

        {/* Separator */}
        <div className="w-8 h-0.5 bg-bg-modifier-active rounded-full" />

        {/* Server icons */}
        {servers.map((server) => {
          const isActive = server.id === serverId
          return (
            <div key={server.id} className="relative group">
              {/* Active indicator pill */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-1 h-10 bg-text-primary rounded-r-full" />
              )}
              <button
                id={`server-${server.id}`}
                onClick={() => handleServerClick(server.id)}
                className={`w-12 h-12 flex items-center justify-center font-semibold text-sm
                           transition-all duration-200 cursor-pointer
                           ${isActive
                             ? 'bg-blurple rounded-xl text-white'
                             : 'bg-bg-primary rounded-2xl text-text-primary hover:bg-blurple hover:rounded-xl hover:text-white'
                           }`}
                title={server.name}
              >
                {server.iconUrl ? (
                  <img
                    src={server.iconUrl}
                    alt={server.name}
                    className="w-full h-full rounded-inherit object-cover"
                  />
                ) : (
                  server.name.charAt(0).toUpperCase()
                )}
              </button>
              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-bg-floating text-text-primary
                              text-sm px-3 py-2 rounded-md shadow-xl whitespace-nowrap opacity-0
                              group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {server.name}
              </div>
            </div>
          )
        })}

        {/* Add server button */}
        <button
          id="add-server-button"
          onClick={() => setShowPicker(true)}
          className="w-12 h-12 rounded-2xl bg-bg-primary flex items-center justify-center
                     text-green text-2xl font-light hover:bg-green hover:text-white hover:rounded-xl
                     transition-all duration-200"
        >
          +
        </button>
      </nav>

      {/* Action picker modal — Create or Join */}
      <Modal isOpen={showPicker} onClose={() => setShowPicker(false)} title="Add a Server">
        <p className="text-text-muted text-sm text-center mb-6">
          Create your own server or join an existing one with an invite code.
        </p>
        <div className="space-y-3">
          <button
            id="pick-create-server"
            onClick={() => { setShowPicker(false); setShowCreate(true) }}
            className="w-full flex items-center gap-4 px-4 py-3 bg-bg-secondary rounded-lg
                       hover:bg-bg-modifier-hover transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-blurple/20 flex items-center justify-center shrink-0
                            group-hover:bg-blurple/30 transition-colors">
              <svg className="w-6 h-6 text-blurple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-text-primary font-semibold text-sm">Create My Own</p>
              <p className="text-text-muted text-xs">Start a new server from scratch</p>
            </div>
            <svg className="w-5 h-5 text-text-muted ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <button
            id="pick-join-server"
            onClick={() => { setShowPicker(false); setShowJoin(true) }}
            className="w-full flex items-center gap-4 px-4 py-3 bg-bg-secondary rounded-lg
                       hover:bg-bg-modifier-hover transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-green/20 flex items-center justify-center shrink-0
                            group-hover:bg-green/30 transition-colors">
              <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-text-primary font-semibold text-sm">Join a Server</p>
              <p className="text-text-muted text-xs">Enter an invite code to join</p>
            </div>
            <svg className="w-5 h-5 text-text-muted ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </Modal>

      {/* Sub-modals */}
      <CreateServerModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <JoinServerModal isOpen={showJoin} onClose={() => setShowJoin(false)} />
    </>
  )
}

