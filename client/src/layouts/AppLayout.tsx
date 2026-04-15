import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from '../store'
import ServerSidebar from '../components/layout/ServerSidebar'
import ChannelSidebar from '../components/layout/ChannelSidebar'
import MemberSidebar from '../components/layout/MemberSidebar'
import MessageList from '../components/chat/MessageList'
import MessageInput from '../components/chat/MessageInput'
import TypingIndicator from '../components/chat/TypingIndicator'

export default function AppLayout() {
  const { serverId, channelId } = useParams()
  const setActiveServer = useAppStore((s) => s.setActiveServer)
  const setActiveChannel = useAppStore((s) => s.setActiveChannel)
  const servers = useAppStore((s) => s.servers)

  // Sync URL params → Zustand
  useEffect(() => {
    if (serverId) setActiveServer(serverId)
    if (channelId && channelId !== 'placeholder') setActiveChannel(channelId)
  }, [serverId, channelId, setActiveServer, setActiveChannel])

  const activeServer = servers.find((s) => s.id === serverId)
  const activeChannel = activeServer?.channels.find((c) => c.id === channelId)

  // Redirect if channelId is literal 'placeholder' or doesn't exist
  useEffect(() => {
    if (activeServer && channelId === 'placeholder') {
      const firstTextChannel = activeServer.channels.find(c => c.type === 'text')
      if (firstTextChannel) {
        window.location.replace(`/servers/${activeServer.id}/channels/${firstTextChannel.id}`)
      } else {
        window.location.replace('/')
      }
    }
  }, [activeServer, channelId])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-tertiary">
      {/* Server sidebar — 72px icon strip */}
      <ServerSidebar />

      {/* Channel sidebar — 240px */}
      <ChannelSidebar server={activeServer ?? null} />

      {/* Main content — flex 1 */}
      <main className="flex flex-1 flex-col bg-bg-primary min-w-0">
        {/* Channel header */}
        {activeServer && channelId && activeChannel && (
          <header className="flex h-12 items-center border-b border-bg-tertiary px-4 no-select shrink-0">
            <span className="text-text-muted mr-2 text-xl">{activeChannel.type === 'voice' ? '🔊' : '#'}</span>
            <h2 className="text-text-primary font-semibold text-base truncate">
              {activeChannel.name}
            </h2>
            {/* Divider */}
            <div className="w-px h-6 bg-bg-modifier-active mx-3 shrink-0" />
            <span className="text-text-muted text-sm truncate">
              {activeChannel.topic || (activeChannel.type === 'text' ? 'Welcome to the channel!' : 'Voice channel')}
            </span>
          </header>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          {channelId && activeChannel ? (
            <MessageList channelId={channelId} channelName={activeChannel.name} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-bg-secondary flex items-center justify-center">
                  <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <p className="text-text-muted text-lg font-medium">Select a channel to start chatting</p>
                <p className="text-text-muted/60 text-sm mt-1">Pick a text channel from the sidebar</p>
              </div>
            </div>
          )}
        </div>

        {/* Typing indicator + Input */}
        {channelId && activeChannel && (
          <div className="shrink-0">
            <MessageInput channelId={channelId} channelName={activeChannel.name} />
            <div className="px-4 pb-1">
              <TypingIndicator channelId={channelId} />
            </div>
          </div>
        )}
      </main>

      {/* Member sidebar — 240px */}
      <MemberSidebar serverId={serverId ?? null} />
    </div>
  )
}

