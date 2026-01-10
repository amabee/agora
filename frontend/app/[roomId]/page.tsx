"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatRoomHeader } from "@/components/chat-room-header";
import { ChatMessagesList } from "@/components/chat-messages-list";
import { ChatInput } from "@/components/chat-input";
import { ChatParticipantsPanel } from "@/components/chat-participants-panel";
import { SidePanelChat } from "@/components/side-panel-chat";
import { VideoGrid, type VideoParticipant } from "@/components/video-grid";
import { VideoControls } from "@/components/video-controls";
import { useRoom } from "@/hooks/useRoom";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { Message } from "@/components/chat-message";
import type { Participant } from "@/interfaces/Participant";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Mock data - replace with real data from your backend
const MOCK_MESSAGES: Message[] = [];

const MOCK_PARTICIPANTS: Participant[] = [];

const MOCK_VIDEO_PARTICIPANTS: VideoParticipant[] = [
  {
    id: "user-1",
    username: "James",
    isMuted: false,
    isVideoOff: false,
    isSpeaking: false,
    avatar: "J",
    hasVideo: true,
  },

  {
    id: "current-user",
    username: "Zoe S (You)",
    isMuted: false,
    isVideoOff: false,
    avatar: "ZS",
    hasVideo: true,
  },
];

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>("");
  const { data: room, isLoading, error } = useRoom(roomId);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [participants, setParticipants] =
    useState<Participant[]>(MOCK_PARTICIPANTS);
  const [videoParticipants, setVideoParticipants] = useState<
    VideoParticipant[]
  >([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(83); // Starting at 1:23

  useEffect(() => {
    // Unwrap the params promise
    Promise.resolve(params).then((resolvedParams) => {
      setRoomId(resolvedParams.roomId);
    });
  }, [params]);

  // Get user info from localStorage
  const [currentUserId] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem("agora_uuid") || `user_${Date.now()}` : `user_${Date.now()}`
  );
  const [currentUsername] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem("agora_username") || "Anonymous" : "Anonymous"
  );

  // WebSocket connection for real-time messaging
  const { isConnected, sendMessage, disconnect } = useWebSocket({
    roomId,
    userId: currentUserId,
    username: currentUsername,
    enabled: !!roomId,
    onMessage: (data) => {
      console.log("Received WebSocket message:", data);
      
      // Handle different message types
      if (data.type === "new_message") {
        const newMessage: Message = {
          id: data.data.id || Date.now().toString(),
          userId: data.data.user_id,
          username: data.data.username || "Unknown",
          content: data.data.content,
          timestamp: new Date(data.data.created_at || data.data.timestamp),
          isOwnMessage: data.data.user_id === currentUserId,
        };
        setMessages((prev) => [...prev, newMessage]);
      } else if (data.type === "user_joined") {
        // Add to video participants list with join animation
        const newParticipant: VideoParticipant = {
          id: data.userId,
          username: data.username,
          isMuted: false,
          isVideoOff: false,
          isSpeaking: false,
          avatar: data.username.charAt(0).toUpperCase(),
          hasVideo: true,
          isNew: true, // Flag for animation
        };
        
        setVideoParticipants((prev) => {
          // Don't add duplicate
          if (prev.find(p => p.id === data.userId)) return prev;
          return [...prev, newParticipant];
        });
        
        // Remove the isNew flag after animation completes
        setTimeout(() => {
          setVideoParticipants((prev) => 
            prev.map(p => p.id === data.userId ? {...p, isNew: false} : p)
          );
        }, 500);
        
        // Don't show notification for yourself
        if (data.userId !== currentUserId) {
          const systemMessage: Message = {
            id: `system_${Date.now()}`,
            userId: "system",
            username: "System",
            content: `${data.username} joined the room`,
            timestamp: new Date(data.timestamp),
            isSystemMessage: true,
          };
          setMessages((prev) => [...prev, systemMessage]);
        }
      } else if (data.type === "user_left") {
        // Remove from video participants
        setVideoParticipants((prev) => prev.filter(p => p.id !== data.userId));
        
        if (data.userId !== currentUserId) {
          const systemMessage: Message = {
            id: `system_${Date.now()}`,
            userId: "system",
            username: "System",
            content: `${data.username} left the room`,
            timestamp: new Date(data.timestamp),
            isSystemMessage: true,
          };
          setMessages((prev) => [...prev, systemMessage]);
        }
      } else if (data.type === "participants") {
        setParticipants(data.participants);
      } else if (data.type === "participant_count") {
        // Update participant count if needed
      } else if (data.type === "joined") {
        // Add yourself to video participants when you join
        const selfParticipant: VideoParticipant = {
          id: currentUserId,
          username: currentUsername + " (You)",
          isMuted: isMicMuted,
          isVideoOff: isVideoOff,
          isSpeaking: false,
          avatar: currentUsername.charAt(0).toUpperCase(),
          hasVideo: true,
        };
        setVideoParticipants([selfParticipant]);
      }
    },
    onConnect: () => {
      console.log("Connected to room:", roomId);
    },
    onDisconnect: () => {
      console.log("Disconnected from room:", roomId);
    },
  });

  // Timer for elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load existing messages when room is loaded
  useEffect(() => {
    if (!roomId) return;

    const loadMessages = async () => {
      try {
        const API_URL = `http://${process.env.NEXT_PUBLIC_WS_HOST || "192.168.1.6"}:${process.env.NEXT_PUBLIC_SERVER_PORT || "8001"}`;
        const response = await fetch(`${API_URL}/api/rooms/${roomId}/messages?limit=50`);
        
        if (response.ok) {
          const result = await response.json();
          
          // Check if response has success and data properties
          if (result.success && result.data) {
            const loadedMessages: Message[] = result.data.map((msg: any) => ({
              id: msg.id.toString(),
              userId: msg.user_id,
              username: msg.username || "Unknown",
              content: msg.content,
              timestamp: new Date(msg.created_at),
              isOwnMessage: msg.user_id === currentUserId,
            }));
            setMessages(loadedMessages);
            console.log(`📚 Loaded ${loadedMessages.length} previous messages`);
          }
        } else {
          console.log("No messages to load or room doesn't support messages");
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();
  }, [roomId, currentUserId]);

  // Show loading state
  if (isLoading || !roomId) {
    return (
      <div className="h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading room...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !room) {
    return (
      <div className="h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Room Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error ? "Failed to load room details." : "This room doesn't exist or has been deleted."}
          </p>
          <Button onClick={() => router.push("/")} className="bg-blue-500 hover:bg-blue-600">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const roomData = {
    name: room.name,
    type: room.type,
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    // Send message via WebSocket with correct backend format
    const messageData = {
      type: "message",
      content: content.trim(),
    };

    // Send via WebSocket
    const sent = sendMessage(messageData);
    
    if (!sent) {
      console.error("Failed to send message - WebSocket not connected");
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(
            (r) => r.emoji === emoji
          );
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions?.map((r) =>
                r.emoji === emoji ? { ...r, count: r.count + 1 } : r
              ),
            };
          }
          return {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji, count: 1 }],
          };
        }
        return msg;
      })
    );
  };

  const handleLeaveRoom = () => {
    // Disconnect WebSocket before navigating away
    disconnect();
    router.push("/");
  };

  const handleToggleMic = () => {
    setIsMicMuted(!isMicMuted);
    // TODO: Implement actual mic toggle logic
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // TODO: Implement actual video toggle logic
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // TODO: Implement actual screen share logic
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen bg-[#0f0f0f] overflow-hidden">
      {roomData.type === "video" ? (
        /* Video Only Room Layout */
        <div className="h-full flex flex-col">
          {/* Top Header Bar */}
          <div className="h-14 flex items-center justify-between px-4 bg-[#1a1a1a] border-b border-white/10 shrink-0">
            {/* Left: Room Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h1 className="text-white text-sm font-medium">
                {roomData.name}
              </h1>
            </div>

            {/* Right: Live Indicator & Timer */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-semibold">LIVE</span>
                <span className="text-white/80 text-xs">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                ZS
              </div>
            </div>
          </div>

          {/* Main Content Area - Full Width Video */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 p-4 min-h-0 overflow-hidden">
              <VideoGrid
                participants={videoParticipants}
                localUserId="current-user"
              />
            </div>

            {/* Bottom Controls */}
            <VideoControls
              onToggleMic={handleToggleMic}
              onToggleVideo={handleToggleVideo}
              onToggleScreenShare={handleToggleScreenShare}
              onToggleChat={() => {}}
              onToggleParticipants={() =>
                setShowParticipants(!showParticipants)
              }
              onLeaveCall={handleLeaveRoom}
              isMicMuted={isMicMuted}
              isVideoOff={isVideoOff}
              isScreenSharing={isScreenSharing}
              participantCount={participants.length}
              messagesCount={0}
              isChatOpen={false}
              isParticipantsOpen={showParticipants}
              isChatDisabled={true}
            />
          </div>

          {/* Participants Panel */}
          <ChatParticipantsPanel
            participants={participants}
            isOpen={showParticipants}
            onClose={() => setShowParticipants(false)}
          />
        </div>
      ) : roomData.type === "text-video" ? (
        /* text-video Room Layout (Combined) */
        <div className="h-full flex flex-col">
          {/* Top Header Bar */}
          <div className="h-14 flex items-center justify-between px-4 bg-[#1a1a1a] border-b border-white/10 shrink-0">
            {/* Left: Room Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h1 className="text-white text-sm font-medium">
                {roomData.name}
              </h1>
            </div>

            {/* Right: Live Indicator & Timer */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-semibold">LIVE</span>
                <span className="text-white/80 text-xs">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                ZS
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Video Grid Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <div className="flex-1 p-4 min-h-0 overflow-hidden">
                <VideoGrid
                  participants={videoParticipants}
                  localUserId="current-user"
                />
              </div>

              {/* Bottom Controls */}
              <VideoControls
                onToggleMic={handleToggleMic}
                onToggleVideo={handleToggleVideo}
                onToggleScreenShare={handleToggleScreenShare}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                onToggleParticipants={() => {
                  setIsChatOpen(true);
                  setShowParticipants(true);
                }}
                onLeaveCall={handleLeaveRoom}
                isMicMuted={isMicMuted}
                isVideoOff={isVideoOff}
                isScreenSharing={isScreenSharing}
                participantCount={participants.length}
                messagesCount={messages.length}
                isChatOpen={isChatOpen}
                isParticipantsOpen={showParticipants}
              />
            </div>

            {/* Side Panel Chat/Participants */}
            <SidePanelChat
              messages={messages}
              participants={participants}
              onSendMessage={handleSendMessage}
              onReact={handleReact}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              participantCount={participants.length}
              defaultTab={showParticipants ? "participants" : "chat"}
              onTabChange={(tab) => setShowParticipants(tab === "participants")}
            />
          </div>
        </div>
      ) : (
        /* Text Only Room Layout */
        <div className="h-full flex flex-col">
          {/* Header */}
          <ChatRoomHeader
            roomName={roomData.name}
            roomType={roomData.type}
            participantCount={participants.length}
            onToggleParticipants={() => setShowParticipants(!showParticipants)}
            onLeaveRoom={handleLeaveRoom}
          />

          {/* Chat Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatMessagesList messages={messages} onReact={handleReact} />
            <ChatInput onSendMessage={handleSendMessage} />
          </div>

          {/* Participants Panel */}
          <ChatParticipantsPanel
            participants={participants}
            isOpen={showParticipants}
            onClose={() => setShowParticipants(false)}
          />
        </div>
      )}
    </div>
  );
}
