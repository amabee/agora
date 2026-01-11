"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VideoParticipant } from "@/interfaces/VideoParticipant";
import type { VideoGridProps } from "@/interfaces/VideoGridProps";

export type { VideoParticipant };

export function VideoGrid({
  participants,
  localUserId = "current-user",
  participantsPerPage = 8,
}: VideoGridProps) {
  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const pinnedParticipant = participants.find((p) => p.id === pinnedUserId);
  const otherParticipants = participants.filter((p) => p.id !== pinnedUserId);
  const displayParticipants = pinnedParticipant
    ? otherParticipants
    : participants;

  const totalPages = Math.ceil(
    displayParticipants.length / participantsPerPage
  );
  const startIndex = currentPage * participantsPerPage;

  // Show 7 tiles + 1 overflow tile if there are more participants
  const hasMoreParticipants = displayParticipants.length > participantsPerPage;
  const visibleCount =
    hasMoreParticipants && currentPage === 0 ? 7 : participantsPerPage;
  const paginatedParticipants = displayParticipants.slice(
    startIndex,
    startIndex + visibleCount
  );
  const remainingCount =
    displayParticipants.length - (startIndex + visibleCount);

  const goToPrevPage = () => setCurrentPage((p) => Math.max(0, p - 1));
  const goToNextPage = () =>
    setCurrentPage((p) => Math.min(totalPages - 1, p + 1));

  // Smooth transition when pinning/unpinning
  const handlePin = (userId: string | null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setPinnedUserId(userId);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Grid area with arrows */}
      <div className="flex-1 flex items-center gap-2 px-2 min-h-0">
        {/* Left arrow - hidden in focused mode */}
        {!pinnedParticipant && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className={cn(
              "h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white shrink-0",
              currentPage === 0 && "opacity-30 cursor-not-allowed"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
        )}

        {/* Grid */}
        <div 
          className={cn(
            "flex-1 h-full py-2 min-h-0 transition-opacity duration-200 ease-out",
            isTransitioning ? "opacity-0" : "opacity-100"
          )}
        >
          {pinnedParticipant ? (
            /* ================= PINNED LAYOUT ================= */
            <div 
              className="flex gap-3 h-full"
              style={{
                animation: !isTransitioning ? "smoothFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none"
              }}
            >
              {/* Main video */}
              <div 
                className="flex-1 rounded-xl overflow-hidden bg-[#1a2535]"
                style={{
                  animation: !isTransitioning ? "smoothExpandIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none"
                }}
              >
                <VideoTile
                  participant={pinnedParticipant}
                  isLocal={pinnedParticipant.id === localUserId}
                  onPin={() => handlePin(null)}
                  isPinned
                />
              </div>

              {/* Sidebar - 2 columns grid */}
              {otherParticipants.length > 0 && (
                <div 
                  className="w-96 h-full overflow-y-auto pr-2 scrollbar-thin"
                  style={{
                    animation: !isTransitioning ? "smoothSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none"
                  }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {otherParticipants.map((p, index) => (
                      <div
                        key={p.id}
                        className="aspect-square rounded-xl object-cover overflow-hidden bg-[#1a2535] transition-all duration-200 ease-out hover:scale-[1.03] hover:ring-2 hover:ring-white/30"
                        style={{
                          animation: !isTransitioning ? `smoothTileIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms forwards` : "none",
                          opacity: 0
                        }}
                      >
                        <VideoTile
                          participant={p}
                          isLocal={p.id === localUserId}
                          onPin={() => handlePin(p.id)}
                          size="small"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================= 4x2 GRID LAYOUT ================= */
            <div 
              className="w-full h-full grid grid-cols-4 grid-rows-2 gap-2"
              style={{
                animation: !isTransitioning ? "smoothGridIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none"
              }}
            >
              {paginatedParticipants.map((p, index) => (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-xl overflow-hidden bg-[#1a2535] transition-all duration-200 ease-out hover:scale-[1.03] hover:ring-2 hover:ring-white/30",
                    p.isNew && "animate-bounce-scale"
                  )}
                  style={{
                    animation: !isTransitioning && !p.isNew 
                      ? `smoothTileIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${index * 25}ms forwards` 
                      : p.isNew 
                      ? "bounceScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" 
                      : "none",
                    opacity: p.isNew ? 1 : 0
                  }}
                >
                  <VideoTile
                    participant={p}
                    isLocal={p.id === localUserId}
                    onPin={() => handlePin(p.id)}
                  />
                </div>
              ))}

              {/* +X more tile */}
              {hasMoreParticipants &&
                currentPage === 0 &&
                remainingCount > 0 && (
                  <div
                    className="rounded-xl overflow-hidden bg-[#1a2535] transition-all duration-200 ease-out flex items-center justify-center cursor-pointer hover:bg-[#243447] hover:scale-[1.03]"
                    onClick={goToNextPage}
                    style={{
                      animation: !isTransitioning ? `smoothTileIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${7 * 25}ms forwards` : "none",
                      opacity: 0
                    }}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        +{remainingCount}
                      </div>
                      <div className="text-sm text-white/60">more</div>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Right arrow - hidden in focused mode */}
        {!pinnedParticipant && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className={cn(
              "h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white shrink-0",
              currentPage === totalPages - 1 && "opacity-30 cursor-not-allowed"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        )}
      </div>

      {/* Pagination dots */}
      {!pinnedParticipant && totalPages > 1 && (
        <div className="flex justify-center gap-2 pb-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === currentPage ? "bg-white" : "bg-white/30 hover:bg-white/60"
              )}
            />
          ))}
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
  isLocal: boolean;
  onPin: () => void;
  isPinned?: boolean;
  size?: "small" | "medium" | "large";
}

function VideoTile({ participant, onPin, isPinned, isLocal }: VideoTileProps) {
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
        "relative w-full h-full overflow-hidden bg-[#1a2535] group transition-all duration-300",
        participant.isSpeaking && "ring-2 ring-green-500"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Video / Avatar */}
      {participant.isVideoOff || !participant.stream ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-2xl font-semibold",
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

      {/* Speaking indicator */}
      {participant.isSpeaking && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}

      {/* Name */}
      <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-sm">
        <span className="text-white text-sm font-medium">
          {participant.username}
        </span>
      </div>

      {/* Pin button */}
      {(hovered || isPinned) && (
        <div className="absolute top-3 left-3">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/80"
            onClick={onPin}
          >
            📌
          </Button>
        </div>
      )}
    </div>
  );
}
