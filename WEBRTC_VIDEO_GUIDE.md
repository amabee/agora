# WebRTC Video Calling Guide

## Overview
The video calling feature has been implemented using WebRTC and simple-peer library. This allows peer-to-peer video connections between users in the same room.

## Architecture

### Backend (WebSocket Signaling)
- **Location**: `backend/src/websocket/index.js`
- **Function**: Relays WebRTC signaling messages between peers
- **Message Type**: `webrtc-signal`
- Messages are forwarded from one user to another to establish peer connections

### Frontend Components

#### 1. useWebRTC Hook
- **Location**: `frontend/hooks/useWebRTC.ts`
- **Purpose**: Manages all WebRTC peer connections
- **Key Features**:
  - Local stream management (camera/microphone)
  - Peer connection creation and destruction
  - ICE server configuration (Google STUN servers)
  - Signal handling (offer, answer, ICE candidates)
  - Camera and microphone toggle functions

#### 2. Room Page Integration
- **Location**: `frontend/app/[roomId]/page.tsx`
- **Integration Points**:
  - Initializes WebRTC hook with WebSocket connection
  - Creates VideoParticipant objects with MediaStream for each peer
  - Syncs camera/mic states with UI controls
  - Starts local stream when entering video/mixed rooms

#### 3. Video Grid Component
- **Location**: `frontend/components/video-grid.tsx`
- **Purpose**: Displays video streams in a grid layout
- **Features**:
  - Shows local video stream (muted to avoid echo)
  - Displays remote peer video streams
  - Falls back to avatar when video is off or unavailable
  - Pin/unpin functionality for focused view

## How It Works

### Connection Flow
1. User enters a video or mixed room
2. Local camera/microphone stream is requested via `getUserMedia()`
3. WebSocket connection sends user presence to room
4. For each existing user in the room:
   - Create a SimplePeer instance as "initiator"
   - Send offer signal via WebSocket
5. Remote peer receives offer:
   - Create a SimplePeer instance (non-initiator)
   - Send answer signal back via WebSocket
6. ICE candidates are exchanged to establish P2P connection
7. Once connected, video streams flow directly between peers

### Data Flow
```
User A                    WebSocket Server              User B
   |                              |                         |
   |-- webrtc-signal (offer) ---->|                         |
   |                              |-- relay signal -------->|
   |                              |                         |
   |                              |<-- webrtc-signal (answer)|
   |<---- relay signal -----------|                         |
   |                              |                         |
   |<=== Direct P2P Video Stream =========================>|
```

## Testing the Video Feature

### Prerequisites
1. Two separate browser windows or devices on the same network
2. Camera and microphone permissions granted
3. Backend server running on port 8001
4. Frontend server running on port 3000

### Test Steps

#### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### 2. Create a Video Room
1. Open browser: `http://localhost:3000`
2. Enter a username
3. Click "+" to add a new room
4. Set room type to "Video" or "Mixed"
5. Create the room

#### 3. Join with Multiple Users
1. **First User**:
   - Join the room you created
   - Allow camera/microphone access when prompted
   - You should see your own video feed

2. **Second User** (in a different browser/incognito):
   - Enter a different username
   - Join the same room
   - Allow camera/microphone permissions
   - Both users should now see each other's video

### Troubleshooting

#### Video Not Showing
- Check browser console for errors
- Verify camera/microphone permissions
- Make sure both users are in a "video" or "mixed" room
- Check that WebSocket connection is established (green indicator)

#### Connection Issues
- Ensure both devices are on the same network (or configure TURN servers for NAT traversal)
- Check firewall settings
- Verify STUN servers are accessible:
  - `stun.l.google.com:19302`
  - `stun1.l.google.com:19302`

#### No Audio/Video
- Check if camera/mic toggles are enabled
- Verify browser has access to devices (Settings > Privacy)
- Try refreshing the page and rejoining

#### Backend Logs
Look for these messages in the backend console:
```
🔄 Relayed WebRTC signal from [userId] to [targetUserId]
```

#### Frontend Logs
Look for these messages in the browser console:
```
🎥 Local stream started
👋 New peer connecting: [peerId]
🎬 Received stream from peer: [peerId]
```

## Camera and Microphone Controls

### Toggle Buttons
- **Microphone**: Mutes/unmutes your audio stream
- **Camera**: Turns video on/off (shows avatar when off)

### States
- Red = Muted/Off
- Green = Active/On

## Video Grid Features

### Layouts
1. **4x2 Grid** (default): Shows up to 8 participants
2. **Pinned View**: Click 📌 on any participant to focus on them
   - Main video area shows pinned participant
   - Other participants appear in sidebar (2-column grid)

### Pagination
- Navigate between pages using left/right arrows
- Shows "+X more" tile when there are additional participants
- Dots at bottom indicate current page

## Known Limitations

1. **P2P Only**: Current implementation uses peer-to-peer connections
   - Works well for 2-4 users
   - May have performance issues with many participants
   - Consider implementing SFU (Selective Forwarding Unit) for larger rooms

2. **NAT Traversal**: Only STUN servers configured
   - May not work across complex NAT setups
   - For production, add TURN servers for relay

3. **No Recording**: Video streams are not recorded

4. **Browser Support**: Requires modern browsers with WebRTC support
   - Chrome/Edge: ✅ Full support
   - Firefox: ✅ Full support  
   - Safari: ✅ Full support (iOS 11+)

## Production Considerations

### Add TURN Servers
```typescript
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { 
    urls: 'turn:your-turn-server.com:3478',
    username: 'user',
    credential: 'pass'
  }
];
```

### Implement SFU for Scalability
For rooms with many participants, consider:
- Mediasoup
- Janus Gateway
- Jitsi Videobridge

### Security Enhancements
- Add authentication for TURN servers
- Implement end-to-end encryption
- Rate limit WebRTC signaling messages

### Quality of Service
- Implement bandwidth adaptation
- Add network quality indicators
- Provide quality settings (SD/HD)

## File References

| Component | File Path | Purpose |
|-----------|-----------|---------|
| WebRTC Hook | `frontend/hooks/useWebRTC.ts` | Peer connection management |
| WebSocket Signaling | `backend/src/websocket/index.js` | Signal relay |
| Room Page | `frontend/app/[roomId]/page.tsx` | WebRTC integration |
| Video Grid | `frontend/components/video-grid.tsx` | Video UI display |
| Video Controls | `frontend/components/video-controls.tsx` | Camera/mic buttons |
| VideoParticipant Type | `frontend/interfaces/VideoParticipant.ts` | TypeScript interface |

## Next Steps

- [ ] Test with multiple users (3-4 participants)
- [ ] Implement screen sharing
- [ ] Add video quality settings
- [ ] Handle peer disconnections gracefully
- [ ] Add TURN servers for production NAT traversal
- [ ] Implement recording functionality
- [ ] Add virtual backgrounds
- [ ] Network quality indicators
