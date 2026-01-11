import { messageService } from "../services/message.service.js";
import { roomService } from "../services/room.service.js";

// Store active connections per room
const roomConnections = new Map();

export async function setupWebSocket(app) {
  app.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (socket, request) => {
    
      
      let currentRoomId = null;
      let currentUserId = null;
      let currentUsername = null;

   

      // Handle incoming messages
      socket.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          

          switch (data.type) {
            case 'join': {
              // Join a room
              const { roomId, userId, username } = data;
              
              // Verify room exists
              const room = await roomService.getRoomById(roomId);
              if (!room) {
                socket.send(JSON.stringify({
                  type: 'error',
                  message: 'Room not found'
                }));
                return;
              }

              // Leave previous room if in one
              if (currentRoomId && roomConnections.has(currentRoomId)) {
                const roomSockets = roomConnections.get(currentRoomId);
                roomSockets.delete(socket);
                
                // Broadcast user left
                broadcastToRoom(currentRoomId, {
                  type: 'user_left',
                  userId: currentUserId,
                  username: currentUsername,
                  timestamp: new Date().toISOString()
                }, socket);
              }

              // Join new room
              currentRoomId = roomId;
              currentUserId = userId;
              currentUsername = username;

              if (!roomConnections.has(roomId)) {
                roomConnections.set(roomId, new Set());
              }
              roomConnections.get(roomId).add(socket);

              // Get list of current users in the room (before broadcasting)
              const currentUsers = [];
              const roomSockets = roomConnections.get(roomId);
              for (const clientSocket of roomSockets) {
                if (clientSocket !== socket && clientSocket.userId && clientSocket.username) {
                  currentUsers.push({
                    userId: clientSocket.userId,
                    username: clientSocket.username
                  });
                }
              }

              // Store user info on socket for retrieval
              socket.userId = userId;
              socket.username = username;

              // Send confirmation with list of existing users
              try {
                socket.send(JSON.stringify({
                  type: 'joined',
                  roomId,
                  message: 'Successfully joined room',
                  existingUsers: currentUsers
                }));
              } catch (error) {
                console.error('Error sending joined confirmation:', error);
              }

              // Broadcast to others that user joined
              broadcastToRoom(roomId, {
                type: 'user_joined',
                userId,
                username,
                timestamp: new Date().toISOString()
              }, socket);

              console.log(`User ${username} (${userId}) joined room ${roomId}`);
              break;
            }

            case 'message': {
              // Send a message
              if (!currentRoomId || !currentUserId) {
                socket.send(JSON.stringify({
                  type: 'error',
                  message: 'Must join a room first'
                }));
                return;
              }

              const { content } = data;
              
              if (!content || typeof content !== 'string') {
                socket.send(JSON.stringify({
                  type: 'error',
                  message: 'Message content is required'
                }));
                return;
              }
              
              try {
                // Verify room type allows messages
                const room = await roomService.getRoomById(currentRoomId);
                if (!room) {
                  socket.send(JSON.stringify({
                    type: 'error',
                    message: 'Room not found'
                  }));
                  return;
                }
                
                // Only video-only rooms don't support messages. Mixed and text rooms do.
                if (room.type === 'video') {
                  socket.send(JSON.stringify({
                    type: 'error',
                    message: 'Video-only rooms do not support text messages'
                  }));
                  return;
                }

                // Save message to database
                const message = await messageService.createMessage({
                  room_id: currentRoomId,
                  user_id: currentUserId,
                  content,
                  message_type: 'text'
                });

                // Broadcast message to all users in the room
                broadcastToRoom(currentRoomId, {
                  type: 'new_message',
                  data: message
                });

               
              } catch (messageError) {
                console.error('Error sending message:', messageError);
                socket.send(JSON.stringify({
                  type: 'error',
                  message: 'Failed to send message: ' + messageError.message
                }));
              }
              break;
            }

            case 'typing': {
              // User is typing
              if (!currentRoomId || !currentUserId) return;

              broadcastToRoom(currentRoomId, {
                type: 'user_typing',
                userId: currentUserId,
                username: currentUsername,
                isTyping: data.isTyping
              }, socket);
              break;
            }

            case 'leave': {
              // Leave current room
              if (currentRoomId && roomConnections.has(currentRoomId)) {
                const roomSockets = roomConnections.get(currentRoomId);
                roomSockets.delete(socket);

                broadcastToRoom(currentRoomId, {
                  type: 'user_left',
                  userId: currentUserId,
                  username: currentUsername,
                  timestamp: new Date().toISOString()
                }, socket);

                currentRoomId = null;
                currentUserId = null;
                currentUsername = null;
              }
              break;
            }

            case 'webrtc-signal': {
              // Relay WebRTC signaling messages
              const { to, signal } = data;
              
              if (!currentRoomId || !currentUserId) {
                socket.send(JSON.stringify({
                  type: 'error',
                  message: 'Must join a room first'
                }));
                return;
              }

              // Find the target socket
              const roomSockets = roomConnections.get(currentRoomId);
              if (roomSockets) {
                for (const clientSocket of roomSockets) {
                  if (clientSocket.userId === to) {
                    try {
                      clientSocket.send(JSON.stringify({
                        type: 'webrtc-signal',
                        from: currentUserId,
                        signal: signal
                      }));
                      console.log(`🔄 Relayed WebRTC signal from ${currentUserId} to ${to}`);
                    } catch (error) {
                      console.error('Error relaying WebRTC signal:', error);
                    }
                    break;
                  }
                }
              }
              break;
            }

            default:
              socket.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type'
              }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          console.error('Error stack:', error.stack);
          console.error('Raw message received:', message.toString());
          try {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Invalid message format: ' + error.message
            }));
          } catch (sendError) {
            console.error('Failed to send error message:', sendError);
          }
        }
      });

      // Handle disconnection
      socket.on('close', () => {
        if (currentRoomId && roomConnections.has(currentRoomId)) {
          const roomSockets = roomConnections.get(currentRoomId);
          roomSockets.delete(socket);

          // Clean up empty room
          if (roomSockets.size === 0) {
            roomConnections.delete(currentRoomId);
          }

          // Broadcast user left
          broadcastToRoom(currentRoomId, {
            type: 'user_left',
            userId: currentUserId,
            username: currentUsername,
            timestamp: new Date().toISOString()
          }, socket);

        }
        console.log('WebSocket connection closed');
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  });
}

// Helper function to broadcast message to all clients in a room
function broadcastToRoom(roomId, message, excludeSocket = null) {
  if (!roomConnections.has(roomId)) return;

  const roomSockets = roomConnections.get(roomId);
  const messageStr = JSON.stringify(message);

  for (const clientSocket of roomSockets) {
    if (clientSocket !== excludeSocket) {
      try {
        // For @fastify/websocket, the socket is a ws WebSocket instance
        // Check OPEN state (1) - see https://github.com/websockets/ws/blob/master/doc/ws.md#ready-state-constants
        const WebSocket = clientSocket.constructor;
        if (clientSocket.readyState === WebSocket.OPEN || clientSocket.readyState === 1) {
          clientSocket.send(messageStr);
        }
      } catch (error) {
        console.error('Error broadcasting to client:', error);
      }
    }
  }
}

// Get active connections count for a room
export function getRoomConnectionCount(roomId) {
  return roomConnections.has(roomId) ? roomConnections.get(roomId).size : 0;
}

// Get all active rooms
export function getActiveRooms() {
  return Array.from(roomConnections.keys());
}
