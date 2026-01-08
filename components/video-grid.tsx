"use client"

interface Participant {
  id: string
  name: string
  avatar: string
  isMuted: boolean
  isCameraOff: boolean
}

const PARTICIPANTS: Participant[] = [
  { id: "1", name: "You", avatar: "👤", isMuted: false, isCameraOff: false },
  { id: "2", name: "Alex Chen", avatar: "👨‍💼", isMuted: true, isCameraOff: false },
  { id: "3", name: "Jordan Kim", avatar: "👩‍💻", isMuted: false, isCameraOff: false },
  { id: "4", name: "Casey Morgan", avatar: "👨‍🎨", isMuted: false, isCameraOff: true },
]

interface VideoGridProps {
  roomId: string | null
}

export function VideoGrid({ roomId }: VideoGridProps) {
  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a room to start video conference
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-slate-900 p-4 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 overflow-auto">
        {PARTICIPANTS.map((participant) => (
          <div
            key={participant.id}
            className="bg-slate-800 rounded-lg overflow-hidden shadow-lg flex flex-col items-center justify-center relative"
          >
            {/* Video Feed Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800"></div>

            {/* Participant Content */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
              <div className="text-6xl mb-4">{participant.avatar}</div>
              <p className="text-white font-medium">{participant.name}</p>

              {/* Status Indicators */}
              <div className="flex gap-2 mt-3">
                {participant.isMuted && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">🔴 Muted</span>
                )}
                {participant.isCameraOff && (
                  <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">📹 Off</span>
                )}
              </div>
            </div>

            {/* Controls Overlay (on hover) */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
              <button className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur">🔊</button>
              <button className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur">📹</button>
              <button className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur">⋯</button>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-center gap-4 mt-4 py-4 bg-slate-800 rounded-lg">
        <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors">🎙️</button>
        <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors">📹</button>
        <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors">🖥️</button>
        <button className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors font-bold">
          📞
        </button>
      </div>
    </div>
  )
}
