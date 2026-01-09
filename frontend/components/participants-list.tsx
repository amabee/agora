"use client"

interface Participant {
  id: string
  name: string
  avatar: string
  status: "online" | "away" | "offline"
  joinedAt: string
}

const PARTICIPANTS: Participant[] = [
  { id: "1", name: "You", avatar: "👤", status: "online", joinedAt: "10:00 AM" },
  { id: "2", name: "Alex Chen", avatar: "👨‍💼", status: "online", joinedAt: "10:15 AM" },
  { id: "3", name: "Jordan Kim", avatar: "👩‍💻", status: "online", joinedAt: "10:20 AM" },
  { id: "4", name: "Casey Morgan", avatar: "👨‍🎨", status: "away", joinedAt: "10:25 AM" },
  { id: "5", name: "Morgan Lee", avatar: "👩‍🔬", status: "offline", joinedAt: "10:30 AM" },
]

interface ParticipantsListProps {
  roomId: string | null
}

export function ParticipantsList({ roomId }: ParticipantsListProps) {
  return (
    <div className="w-72 border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Participants ({PARTICIPANTS.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {PARTICIPANTS.map((participant) => (
            <div key={participant.id} className="p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                  {participant.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{participant.name}</p>
                  <p className="text-xs text-muted-foreground">Joined {participant.joinedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-10">
                <span
                  className={`w-2 h-2 rounded-full ${
                    participant.status === "online"
                      ? "bg-green-500"
                      : participant.status === "away"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                  }`}
                ></span>
                <span className="text-xs text-muted-foreground capitalize">{participant.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
