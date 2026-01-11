"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { VideoParticipant } from "@/interfaces/VideoParticipant";
import type { VideoGridProps } from "@/interfaces/VideoGridProps";

export type { VideoParticipant };

export function VideoGrid({
  participants,
  localUserId = "current-user",
}: VideoGridProps) {
  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);

  const pinnedParticipant = participants.find((p) => p.id === pinnedUserId);
  const otherParticipants = participants.filter((p) => p.id !== pinnedUserId);

  // Pinned/Focused view
  if (pinnedParticipant) {
    return (
      <div className="w-full h-full flex gap-3 p-2 md:p-4">
        {/* Main large video */}
        <div className="flex-1 rounded-lg overflow-hidden">
          <VideoTile
            participant={pinnedParticipant}
            isLocal={pinnedParticipant.id === localUserId}
            onPin={() => setPinnedUserId(null)}
            isPinned={true}
          />
        </div>

        {/* Sidebar with other participants */}
        {otherParticipants.length > 0 && (
          <div className="w-48 md:w-64 flex flex-col gap-2 md:gap-3 overflow-y-auto">
            {otherParticipants.map((participant) => (
              <div key={participant.id} className="aspect-video rounded-lg overflow-hidden">
                <VideoTile
                  participant={participant}
                  isLocal={participant.id === localUserId}
                  onPin={() => setPinnedUserId(participant.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Grid layouts based on participant count
  return (
    <div className="w-full h-full flex items-center justify-center p-2 md:p-4">
      {participants.length === 2 ? (
        // 2 people: side by side
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {participants.map((participant) => (
            <VideoTile 
              key={participant.id} 
              participant={participant} 
              isLocal={participant.id === localUserId}
              onPin={() => setPinnedUserId(participant.id)}
            />
          ))}
        </div>
      ) : participants.length === 3 ? (
        // 3 people: 2 equal on top, 1 equal below
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-2 md:gap-4">
          <VideoTile 
            participant={participants[0]} 
            isLocal={participants[0].id === localUserId}
            onPin={() => setPinnedUserId(participants[0].id)}
          />
          <VideoTile 
            participant={participants[1]} 
            isLocal={participants[1].id === localUserId}
            onPin={() => setPinnedUserId(participants[1].id)}
          />
          <div className="col-span-2">
            <VideoTile 
              participant={participants[2]} 
              isLocal={participants[2].id === localUserId}
              onPin={() => setPinnedUserId(participants[2].id)}
            />
          </div>
        </div>
      ) : participants.length === 4 ? (
        // 4 people: 2x2 grid
        <div className="w-full h-full grid grid-cols-2 gap-2 md:gap-4">
          {participants.map((participant) => (
            <VideoTile 
              key={participant.id} 
              participant={participant} 
              isLocal={participant.id === localUserId}
              onPin={() => setPinnedUserId(participant.id)}
            />
          ))}
        </div>
      ) : participants.length === 5 ? (
        // 5 people: 3 on top, 2 on bottom
        <div className="w-full h-full flex flex-col gap-2 md:gap-4">
          <div className="flex-1 grid grid-cols-3 gap-2 md:gap-4">
            <VideoTile participant={participants[0]} isLocal={participants[0].id === localUserId} onPin={() => setPinnedUserId(participants[0].id)} />
            <VideoTile participant={participants[1]} isLocal={participants[1].id === localUserId} onPin={() => setPinnedUserId(participants[1].id)} />
            <VideoTile participant={participants[2]} isLocal={participants[2].id === localUserId} onPin={() => setPinnedUserId(participants[2].id)} />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 md:gap-4 px-4 md:px-16">
            <VideoTile participant={participants[3]} isLocal={participants[3].id === localUserId} onPin={() => setPinnedUserId(participants[3].id)} />
            <VideoTile participant={participants[4]} isLocal={participants[4].id === localUserId} onPin={() => setPinnedUserId(participants[4].id)} />
          </div>
        </div>
      ) : participants.length === 6 ? (
        // 6 people: 3x2 grid
        <div className="w-full h-full grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          {participants.map((participant) => (
            <VideoTile key={participant.id} participant={participant} isLocal={participant.id === localUserId} onPin={() => setPinnedUserId(participant.id)} />
          ))}
        </div>
      ) : participants.length >= 7 && participants.length <= 9 ? (
        // 7-9 people: 3x3 grid
        <div className="w-full h-full grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 auto-rows-fr">
          {participants.map((participant) => (
            <VideoTile key={participant.id} participant={participant} isLocal={participant.id === localUserId} onPin={() => setPinnedUserId(participant.id)} />
          ))}
        </div>
      ) : participants.length >= 10 ? (
        // 10+ people: 4 columns grid
        <div className="w-full h-full grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-fr overflow-y-auto">
          {participants.map((participant) => (
            <VideoTile key={participant.id} participant={participant} isLocal={participant.id === localUserId} onPin={() => setPinnedUserId(participant.id)} />
          ))}
        </div>
      ) : (
        // 1 person: centered
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full max-w-4xl">
            {participants.map((participant) => (
              <VideoTile key={participant.id} participant={participant} isLocal={participant.id === localUserId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================= */
/* ====================== VIDEO TILE ======================= */
/* ========================================================= */

interface VideoTileProps {
  participant: VideoParticipant;
  isLocal?: boolean;
  onPin?: () => void;
  isPinned?: boolean;
}

function VideoTile({ participant, isLocal, onPin, isPinned }: VideoTileProps) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-purple-500 to-purple-700",
      "from-blue-500 to-blue-700",
      "from-green-500 to-green-700",
      "from-yellow-500 to-orange-600",
      "from-pink-500 to-pink-700",
      "from-cyan-500 to-cyan-700",
      "from-indigo-500 to-indigo-700",
      "from-rose-500 to-rose-700",
    ];
    return colors[
      name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
    ];
  };

  const initials = participant.username
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative w-full h-full rounded-lg overflow-hidden bg-[#1a2535] transition-all duration-300",
        participant.isSpeaking && "ring-4 ring-green-500",
        hovered && onPin && "ring-2 ring-white/50",
        onPin && "cursor-pointer"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPin?.()}
    >
      {/* Video / Avatar */}
      {participant.isVideoOff || !participant.stream ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xl md:text-3xl font-semibold shadow-lg",
              getAvatarColor(participant.username)
            )}
          >
            {initials}
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Pin button - show on hover or if pinned */}
      {(hovered || isPinned) && onPin && (
        <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10">
          <button
            className="bg-black/70 hover:bg-black/90 p-1.5 md:p-2 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
          >
            {isPinned ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <span className="text-white text-sm md:text-base">📌</span>
            )}
          </button>
        </div>
      )}

      {/* Muted indicator */}
      {participant.isMuted && (
        <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-red-500/90 p-1.5 md:p-2 rounded-full shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="md:w-4 md:h-4"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
      )}

      {/* Speaking indicator */}
      {participant.isSpeaking && !participant.isMuted && (
        <div className="absolute top-2 md:top-3 right-2 md:right-3 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
      )}

      {/* Name label */}
      <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 right-2 md:right-3">
        <div className="bg-black/70 px-2 md:px-3 py-1 md:py-1.5 rounded-md backdrop-blur-sm">
          <span className="text-white text-xs md:text-sm font-medium truncate block">
            {participant.username}
          </span>
        </div>
      </div>

      {/* Local badge */}
      {isLocal && !isPinned && (
        <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-blue-500/90 px-2 py-1 rounded-md shadow-lg">
          <span className="text-white text-xs font-semibold">YOU</span>
        </div>
      )}
    </div>
  );
}
