"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { useWebRTC } from "@/hooks/useWebRTC";
import type { Message } from "@/components/chat-message";
import type { Participant } from "@/interfaces/Participant";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const API_PORT = process.env.NEXT_PUBLIC_SERVER_PORT || "8001";
const API_HOST = process.env.NEXT_PUBLIC_SERVER_URL || "localhost";
const API_PROTOCOL = API_PORT === "443" || API_HOST.includes(".zrok.io") ? "https" : "http";
const API_URL = `${API_PROTOCOL}://${API_HOST}${API_PORT === "443" || API_PORT === "80" ? "" : `:${API_PORT}`}`;

// Mock data - replace with real data from your backend
const MOCK_MESSAGES: Message[] = [];

const MOCK_PARTICIPANTS: Participant[] = [];

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
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(83); // Starting at 1:23
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const [isRefreshingParticipants, setIsRefreshingParticipants] = useState(false);
  
  // WebRTC signal handler reference
  const webrtcSignalHandlerRef = useRef<((data: any) => void) | null>(null);

  // Manual refresh function for participants
  const refreshParticipants = useCallback(async () => {
    if (!roomId || isRefreshingParticipants) return;
    
    setIsRefreshingParticipants(true);
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomId}/members`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const membersData: Participant[] = result.data.map((member: any) => ({
            id: member.user_id,
            username: member.username,
            avatar: member.username.charAt(0).toUpperCase(),
            role: member.role,
            joinedAt: new Date(member.joined_at),
          }));
          setParticipants(membersData);
          console.log(`🔄 Refreshed: ${membersData.length} participants`);
        }
      }
    } catch (error) {
      console.error("Failed to refresh participants:", error);
    } finally {
      setIsRefreshingParticipants(false);
    }
  }, [roomId, isRefreshingParticipants]);

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

  // Cleanup on unmount - remove current user from room when they navigate away
  useEffect(() => {
    if (!roomId || !currentUserId) return;

    let cleanupExecuted = false;
    let isComponentMounted = true;

    const leaveRoom = async () => {
      if (cleanupExecuted || !isComponentMounted) return;
      cleanupExecuted = true;
      
      console.log(`🧹 Leaving room: user=${currentUserId}, room=${roomId}`);
      const data = JSON.stringify({ user_id: currentUserId });
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(`${API_URL}/api/rooms/${roomId}/leave`, blob);
    };

    const handleBeforeUnload = () => {
      leaveRoom();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup: Remove ONLY this user from room when component unmounts
    return () => {
      isComponentMounted = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Only leave if not already done
      if (!cleanupExecuted) {
        leaveRoom();
      }
    };
  }, [roomId, currentUserId]);

  // No need to join here - already joined from main page before navigation

  // Fetch room members on mount only - WebSocket handles live updates
  useEffect(() => {
    if (!roomId) return;

    const fetchMembers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/rooms/${roomId}/members`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const membersData: Participant[] = result.data.map((member: any) => ({
              id: member.user_id,
              username: member.username,
              avatar: member.username.charAt(0).toUpperCase(),
              role: member.role,
              joinedAt: new Date(member.joined_at),
            }));
            setParticipants(membersData);
            console.log(`📋 Initial load: ${membersData.length} participants`);
          }
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    };

    // Only fetch once on mount, WebSocket will handle updates
    fetchMembers();
  }, [roomId]);

  // WebRTC for video calling - MUST be before useWebSocket since it's used in onMessage
  const webrtc = useWebRTC({
    roomId,
    userId: currentUserId,
    username: currentUsername,
    sendSignal: (signal) => {
      // Will be set after WebSocket is ready
      if (webSocketSendRef.current) {
        webSocketSendRef.current(signal);
      }
    },
    onSignal: (handler) => {
      webrtcSignalHandlerRef.current = handler;
    },
    enabled: !!roomId && !!currentUserId,
  });

  // Ref to store WebSocket sendMessage function
  const webSocketSendRef = useRef<((data: any) => boolean) | null>(null);

  // WebSocket connection for real-time messaging
  const { isConnected, sendMessage, disconnect } = useWebSocket({
    roomId,
    userId: currentUserId,
    username: currentUsername,
    enabled: !!roomId,
    onMessage: (data) => {
      console.log("Received WebSocket message:", data);
      
      // Handle WebRTC signaling
      if (data.type === "webrtc-signal" && webrtcSignalHandlerRef.current) {
        try {
          webrtcSignalHandlerRef.current(data);
        } catch (error) {
          console.error("Error handling WebRTC signal:", error);
        }
        return;
      }
      
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
        console.log("📥 Joined room, existing users:", data.existingUsers);
        
        // Merge yourself with existing users in participants list
        setParticipants(prev => {
          const newParticipants = [
            {
              id: currentUserId,
              username: currentUsername,
              avatar: currentUsername.charAt(0).toUpperCase(),
              role: 'member' as const,
              joinedAt: new Date(),
            },
            ...(data.existingUsers || []).map((user: any) => ({
              id: user.userId,
              username: user.username,
              avatar: user.username.charAt(0).toUpperCase(),
              role: 'member' as const,
              joinedAt: new Date(),
            }))
          ];
          
          // Merge with existing data, avoid duplicates
          const merged = [...prev];
          newParticipants.forEach(newP => {
            if (!merged.some(p => p.id === newP.id)) {
              merged.push(newP);
            }
          });
          return merged;
        });
        
        // Establish WebRTC connections with existing users ONLY if we have a local stream
        const isVideoRoom = room && (room.type === 'video' || room.type === 'mixed' || room.type === 'text-video');
        if (isVideoRoom) {
          // Wait for local stream to be ready before connecting to peers
          let retryCount = 0;
          const maxRetries = 10;
          const connectToPeers = () => {
            if (webrtc.localStream) {
              console.log("🎥 Local stream ready, connecting to existing users...");
              const existingUserIds = new Set((data.existingUsers || []).map((u: any) => u.userId));
              existingUserIds.forEach((userId: string) => {
                if (userId !== currentUserId) {
                  try {
                    console.log("🎥 Initiating WebRTC connection with existing user:", userId);
                    webrtc.addPeer(userId);
                  } catch (error) {
                    console.error("Failed to add peer:", userId, error);
                  }
                }
              });
            } else if (retryCount < maxRetries) {
              retryCount++;
              console.log(`⏳ Waiting for local stream before connecting to peers... (${retryCount}/${maxRetries})`);
              setTimeout(connectToPeers, 500);
            } else {
              console.warn("⚠️ Gave up waiting for local stream after", maxRetries, "retries");
            }
          };
          connectToPeers();
        }
      } else if (data.type === "user_joined") {
        console.log("👤 User joined:", data.username, data.userId);
        console.log("👤 Current participants before:", participants.length);
        
        // Add to participants list
        setParticipants(prev => {
          const exists = prev.some(p => p.id === data.userId);
          if (exists) {
            console.log("👤 User already in list, skipping");
            return prev;
          }
          
          const newList = [...prev, {
            id: data.userId,
            username: data.username,
            avatar: data.username.charAt(0).toUpperCase(),
            role: 'member' as const,
            joinedAt: new Date(),
          }];
          console.log("👤 Updated participants list:", newList.length);
          return newList;
        });
        
        // Establish WebRTC connection with the new user ONLY if we have a local stream
        const isVideoRoom = room && (room.type === 'video' || room.type === 'mixed' || room.type === 'text-video');
        if (isVideoRoom && data.userId !== currentUserId) {
          if (webrtc.localStream) {
            try {
              console.log("🎥 Initiating WebRTC connection with:", data.userId);
              webrtc.addPeer(data.userId);
            } catch (error) {
              console.error("Failed to add peer:", data.userId, error);
            }
          } else {
            console.log("⏳ Local stream not ready, will retry once for:", data.userId);
            // Retry once after a delay
            setTimeout(() => {
              if (webrtc.localStream) {
                try {
                  console.log("🎥 Retry: Initiating WebRTC connection with:", data.userId);
                  webrtc.addPeer(data.userId);
                } catch (error) {
                  console.error("Failed to add peer on retry:", data.userId, error);
                }
              } else {
                console.warn("⚠️ Still no local stream, cannot connect to:", data.userId);
              }
            }, 1000);
          }
        }
      } else if (data.type === "user_left") {
        console.log("👋 User left:", data.username, data.userId);
        
        // Remove from participants list
        setParticipants(prev => {
          const filtered = prev.filter(p => p.id !== data.userId);
          console.log("👋 Participants after removal:", filtered.length);
          return filtered;
        });
        
        // Remove WebRTC peer connection
        try {
          webrtc.removePeer(data.userId);
        } catch (error) {
          console.error("Error removing peer:", data.userId, error);
        }
      }
    },
    onConnect: () => {
      console.log("Connected to room:", roomId);
    },
    onDisconnect: () => {
      console.log("Disconnected from room:", roomId);
    },
  });

  // Store sendMessage in ref for WebRTC to use
  useEffect(() => {
    webSocketSendRef.current = sendMessage;
  }, [sendMessage]);

  // Update video/mic states from WebRTC
  useEffect(() => {
    setIsMicMuted(!webrtc.isMicOn);
    setIsVideoOff(!webrtc.isCameraOn);
  }, [webrtc.isMicOn, webrtc.isCameraOn]);

  // Start local stream when connected to video/mixed room (only once)
  const hasStartedStreamRef = useRef(false);
  useEffect(() => {
    const isVideoRoom = room && (room.type === 'video' || room.type === 'mixed' || room.type === 'text-video');
    if (isConnected && isVideoRoom && !hasStartedStreamRef.current && !webrtc.localStream) {
      console.log('🎥 Starting local stream for room type:', room.type);
      hasStartedStreamRef.current = true;
      webrtc.startLocalStream();
    }
  }, [isConnected, room, webrtc.localStream]);

  // Create stable peer tracking values
  const peerIdsString = webrtc.peers.map(p => p.peerId).sort().join(',');
  const streamCount = webrtc.peers.filter(p => p.stream).length;

  // Update video participants from WebRTC peers
  const videoParticipantsFromWebRTC = useMemo(() => {
    const localParticipant: VideoParticipant = {
      id: currentUserId,
      username: currentUsername + " (You)",
      isMuted: !webrtc.isMicOn,
      isVideoOff: !webrtc.isCameraOn,
      isSpeaking: false,
      avatar: currentUsername.charAt(0).toUpperCase(),
      hasVideo: true,
      stream: webrtc.localStream || undefined,
    };

    const remoteParticipants: VideoParticipant[] = webrtc.peers.map(peer => {
      const participant = participants.find(p => p.id === peer.peerId);
      const username = participant?.username || 'Unknown';
      return {
        id: peer.peerId,
        username: username,
        isMuted: false,
        isVideoOff: false,
        isSpeaking: false,
        avatar: username.charAt(0).toUpperCase(),
        hasVideo: true,
        stream: peer.stream,
      };
    });

    return [localParticipant, ...remoteParticipants];
  }, [
    webrtc.localStream, 
    peerIdsString,
    streamCount,
    webrtc.isMicOn, 
    webrtc.isCameraOn, 
    currentUserId, 
    currentUsername
  ]);

  useEffect(() => {
    setVideoParticipants(videoParticipantsFromWebRTC);
  }, [videoParticipantsFromWebRTC]);

  // Only update video participants when something actually changed
  const prevVideoParticipantsRef = useRef<VideoParticipant[]>([]);
  useEffect(() => {
    const prev = prevVideoParticipantsRef.current;
    const current = videoParticipantsFromWebRTC;
    
    // Check if anything actually changed
    const hasChanged = 
      prev.length !== current.length ||
      prev.some((p, i) => p.id !== current[i]?.id || p.stream !== current[i]?.stream);
    
    if (hasChanged) {
      console.log('📹 Video participants updated:', { 
        local: !!webrtc.localStream, 
        remotePeers: webrtc.peers.length,
        peerIds: peerIdsString
      });
      setVideoParticipants(current);
      prevVideoParticipantsRef.current = current;
    }
  }, [videoParticipantsFromWebRTC, peerIdsString, webrtc.localStream, webrtc.peers.length]);

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

  // Define all callbacks before conditional returns
  const handleLeaveRoom = useCallback(async () => {
    if (!roomId || !currentUserId) return;

    // Set flag to allow navigation
    setIsLeavingRoom(true);

    try {
      // Remove user from room members
      await fetch(`${API_URL}/api/rooms/${roomId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId }),
      });
      console.log("✅ Left room members");
    } catch (error) {
      console.error("Failed to leave room:", error);
    }

    // Disconnect WebSocket
    disconnect();
    
    // Navigate back to home
    router.push("/");
  }, [roomId, currentUserId, disconnect, router]);

  const handleSendMessage = useCallback((content: string) => {
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
  }, [sendMessage]);

  const handleReact = useCallback((messageId: string, emoji: string) => {
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
  }, []);

  const handleToggleMic = useCallback(() => {
    console.log('🎤 Toggling mic, current state:', webrtc.isMicOn);
    webrtc.toggleMic();
  }, [webrtc]);

  const handleToggleVideo = useCallback(() => {
    console.log('📹 Toggling video, current state:', webrtc.isCameraOn, 'stream exists:', !!webrtc.localStream);
    webrtc.toggleCamera();
  }, [webrtc]);

  const handleToggleScreenShare = useCallback(() => {
    setIsScreenSharing(!isScreenSharing);
    // TODO: Implement actual screen share logic
  }, [isScreenSharing]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

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

  console.log('🏠 Room data:', roomData);

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
                localUserId={currentUserId}
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
            onRefresh={refreshParticipants}
            isRefreshing={isRefreshingParticipants}
          />
        </div>
      ) : roomData.type === "mixed" || roomData.type === "text-video" ? (
        /* Mixed/text-video Room Layout (Combined) */
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
              onRefreshParticipants={refreshParticipants}
              isRefreshingParticipants={isRefreshingParticipants}
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

          {/* Participants Modal Dialog */}
          {showParticipants && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowParticipants(false)}>
              <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Participants ({participants.length})</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={refreshParticipants} 
                      disabled={isRefreshingParticipants}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                      title="Refresh participants"
                    >
                      <svg className={`w-5 h-5 ${isRefreshingParticipants ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button onClick={() => setShowParticipants(false)} className="text-muted-foreground hover:text-foreground">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
                  {participants.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>No participants yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {participants.map((participant) => (
                        <div key={participant.id} className="px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {participant.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{participant.username}</p>
                            {participant.role && participant.role !== 'member' && (
                              <p className="text-xs text-muted-foreground capitalize">{participant.role}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
