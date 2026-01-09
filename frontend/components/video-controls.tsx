"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MicOffIcon, MoreHorizontalIcon, Trash2Icon, VolumeOffIcon } from "lucide-react";

interface VideoControlsProps {
  onToggleMic?: () => void;
  onToggleVideo?: () => void;
  onToggleScreenShare?: () => void;
  onToggleChat?: () => void;
  onToggleParticipants?: () => void;
  onLeaveCall?: () => void;
  onShowSettings?: () => void;
  isMicMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
  participantCount?: number;
  messagesCount?: number;
  isChatOpen?: boolean;
  isParticipantsOpen?: boolean;
  isChatDisabled?: boolean;
}

// Vertical dots separator component
function DotSeparator() {
  return (
    <div className="flex flex-col gap-0.5 px-1">
      <div className="w-1 h-1 rounded-full bg-white/30" />
      <div className="w-1 h-1 rounded-full bg-white/30" />
      <div className="w-1 h-1 rounded-full bg-white/30" />
    </div>
  );
}

export function VideoControls({
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onLeaveCall,
  onShowSettings,
  isMicMuted = false,
  isVideoOff = false,
  isScreenSharing = false,
  participantCount = 0,
  messagesCount = 0,
  isChatOpen = false,
  isParticipantsOpen = false,
  isChatDisabled = false,
}: VideoControlsProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className="h-16 bg-[#1a1a1a] border-t border-white/10 px-4 flex items-center justify-between shrink-0">
      {/* Left Controls - Mic & Camera */}
      <div className="flex items-center gap-2">
        {/* Microphone Group */}
        <ButtonGroup className="bg-[#2a2a2a] rounded-full">
          <Button
            onClick={onToggleMic}
            size="icon"
            variant="ghost"
            className={cn(
              "h-9 w-9 rounded-full transition-all",
              isMicMuted
                ? "text-white/60 hover:text-white hover:bg-white/10"
                : "text-white hover:bg-white/10"
            )}
          >
            {isMicMuted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="More Options" 
                className="h-9 w-7 rounded-r-full text-white hover:bg-white/10 border-l border-white/10"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="bg-[#2a2a2a] border-white/10 text-white min-w-[200px]"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  <VolumeOffIcon className="w-4 h-4 mr-2" />
                  Mute Some
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  <MicOffIcon className="w-4 h-4 mr-2" />
                  Mute All
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>

        {/* Camera Group */}
        <ButtonGroup className="bg-[#2a2a2a] rounded-full">
          <Button
            onClick={onToggleVideo}
            size="icon"
            variant="ghost"
            className={cn(
              "h-9 w-9 rounded-l-full transition-all",
              isVideoOff
                ? "text-white/60 hover:text-white hover:bg-white/10"
                : "text-white hover:bg-white/10"
            )}
          >
            {isVideoOff ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Camera Options" 
                className="h-9 w-7 rounded-r-full text-white hover:bg-white/10 border-l border-white/10"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="bg-[#2a2a2a] border-white/10 text-white min-w-50"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide Video
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Video Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>

      {/* Center Controls - Screen Share, Reactions, Leave */}
      <div className="flex items-center">
        <div className="flex items-center bg-[#2a2a2a] rounded-full px-1 py-1">
          {/* Screen Share */}
          <Button
            onClick={onToggleScreenShare}
            size="icon"
            variant="ghost"
            className={cn(
              "h-9 w-9 rounded-full transition-all",
              isScreenSharing
                ? "text-green-400 hover:bg-white/10"
                : "text-white hover:bg-white/10"
            )}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </Button>

          <DotSeparator />

          {/* Reactions */}
          <div className="relative">
            <Button
              onClick={() => setShowReactions(!showReactions)}
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full text-white hover:bg-white/10"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Button>

            {/* Reactions Menu */}
            {showReactions && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#2a2a2a] rounded-xl p-2 flex gap-1 shadow-xl border border-white/10">
                {["👍", "❤️", "😂", "👏", "🎉", "🔥"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setShowReactions(false)}
                    className="w-10 h-10 hover:bg-white/10 rounded-lg transition-colors text-xl flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <DotSeparator />

          {/* Leave Call */}
          <Button
            onClick={onLeaveCall}
            size="icon"
            className="h-9 w-9 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
              />
            </svg>
          </Button>

          <DotSeparator />
        </div>
      </div>

      {/* Right Controls - Chat, Participants, Menu */}
      <div className="flex items-center">
        <div className="flex items-center bg-[#2a2a2a] rounded-full px-1 py-1">
          {/* Chat Toggle */}
          <Button
            onClick={onToggleChat}
            size="icon"
            variant="ghost"
            disabled={isChatDisabled}
            className={cn(
              "h-9 w-9 rounded-full transition-all",
              isChatDisabled
                ? "text-white/30 cursor-not-allowed hover:bg-transparent"
                : isChatOpen
                ? "text-blue-400 hover:bg-white/10"
                : "text-white hover:bg-white/10"
            )}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </Button>

          {/* Participants */}
          <Button
            onClick={onToggleParticipants}
            size="icon"
            variant="ghost"
            className={cn(
              "h-9 w-9 rounded-full transition-all relative",
              isParticipantsOpen
                ? "text-blue-400 hover:bg-white/10"
                : "text-white hover:bg-white/10"
            )}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-white/20 text-white text-[9px] flex items-center justify-center font-medium">
              {participantCount}
            </span>
          </Button>

          {/* Menu */}
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full text-white hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
