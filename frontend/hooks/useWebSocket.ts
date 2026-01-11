import { useEffect, useRef, useState, useCallback } from "react";

const WS_PORT = process.env.NEXT_PUBLIC_SERVER_PORT || "8001";
const WS_HOST = process.env.NEXT_PUBLIC_WS_HOST || "192.168.1.6";
const WS_PROTOCOL = WS_PORT === "443" || WS_HOST.includes(".zrok.io") ? "wss" : "ws";
const WS_URL = `${WS_PROTOCOL}://${WS_HOST}${WS_PORT === "443" || WS_PORT === "80" ? "" : `:${WS_PORT}`}/ws`;

interface UseWebSocketProps {
  roomId: string;
  userId?: string;
  username?: string;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  enabled?: boolean;
}

export function useWebSocket({
  roomId,
  userId,
  username,
  onMessage,
  onConnect,
  onDisconnect,
  enabled = true,
}: UseWebSocketProps) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const hasJoinedRoom = useRef(false);
  
  // Use refs for callbacks to avoid recreating connect function
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  
  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
  });

  const connect = useCallback(() => {
    if (!enabled || !roomId) return;

    try {
      // Connect to WebSocket without query params
      const wsUrl = WS_URL;
      console.log("Connecting to WebSocket:", wsUrl);
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        hasJoinedRoom.current = false;

        // Send join message after connection is established
        const joinMessage = {
          type: 'join',
          roomId,
          userId: userId || `user_${Date.now()}`,
          username: username || 'Anonymous'
        };
        console.log("📤 Sending join message:", joinMessage);
        socket.send(JSON.stringify(joinMessage));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Received message:", data);
          
          // Handle joined confirmation
          if (data.type === 'joined' && !hasJoinedRoom.current) {
            hasJoinedRoom.current = true;
            console.log("✅ Successfully joined room");
            onConnectRef.current?.();
          }
          
          onMessageRef.current?.(data);
        } catch (err) {
          console.error("❌ Failed to parse WebSocket message:", err);
        }
      };

      socket.onerror = (event) => {
        console.error("❌ WebSocket error:", event);
        setError("WebSocket connection error");
      };

      socket.onclose = (event) => {
        console.log("🔌 WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
        setIsConnected(false);
        hasJoinedRoom.current = false;
        onDisconnectRef.current?.();

        // Don't reconnect if it was a normal closure
        if (event.code === 1000) {
          return;
        }

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          reconnectTimeout.current = setTimeout(connect, delay);
        } else {
          console.error("❌ Max reconnection attempts reached");
          setError("Failed to connect after multiple attempts");
        }
      };

      ws.current = socket;
    } catch (err) {
      console.error("❌ Failed to create WebSocket:", err);
      setError("Failed to create WebSocket connection");
    }
  }, [roomId, userId, username, enabled]);

  const disconnect = useCallback((sendLeave = false) => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      // Send leave message before closing if requested
      if (sendLeave && ws.current.readyState === WebSocket.OPEN) {
        try {
          ws.current.send(JSON.stringify({ type: 'leave' }));
        } catch (err) {
          console.error('Failed to send leave message:', err);
        }
      }
      ws.current.close(1000, 'User left');
      ws.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
      return true;
    }
    console.error("WebSocket is not connected");
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect(true);
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}
