# Agora Backend - WebSocket Guide

## WebSocket Connection

Connect to: `ws://localhost:8001/ws` (or `ws://192.168.1.6:8001/ws` for network access)

## Message Types

### 1. Join a Room

Send this to join a room:

```json
{
  "type": "join",
  "roomId": 1,
  "userId": "user-uuid-here",
  "username": "YourUsername"
}
```

**Response:**
```json
{
  "type": "joined",
  "roomId": 1,
  "message": "Successfully joined room"
}
```

**Broadcast to others:**
```json
{
  "type": "user_joined",
  "userId": "user-uuid-here",
  "username": "YourUsername",
  "timestamp": "2026-01-10T12:00:00.000Z"
}
```

---

### 2. Send a Message

```json
{
  "type": "message",
  "content": "Hello everyone!"
}
```

**Broadcast to all in room:**
```json
{
  "type": "new_message",
  "data": {
    "id": 1,
    "room_id": 1,
    "user_id": "user-uuid-here",
    "username": "YourUsername",
    "content": "Hello everyone!",
    "message_type": "text",
    "created_at": "2026-01-10T12:00:00.000Z"
  }
}
```

---

### 3. Typing Indicator

```json
{
  "type": "typing",
  "isTyping": true
}
```

**Broadcast to others:**
```json
{
  "type": "user_typing",
  "userId": "user-uuid-here",
  "username": "YourUsername",
  "isTyping": true
}
```

---

### 4. Leave Room

```json
{
  "type": "leave"
}
```

**Broadcast to others:**
```json
{
  "type": "user_left",
  "userId": "user-uuid-here",
  "username": "YourUsername",
  "timestamp": "2026-01-10T12:00:00.000Z"
}
```

---

## REST API Endpoints

### Rooms

- `GET /rooms` - Get all rooms (with filters)
- `GET /rooms/:id` - Get room details with participants and video sessions
- `GET /rooms/nearby?latitude=X&longitude=Y&radius=10` - Get nearby rooms
- `POST /rooms` - Create a new room
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room
- `GET /rooms/:id/members` - Get room members

### Messages

- `GET /rooms/:roomId/messages?limit=100&offset=0` - Get messages for a room
- `DELETE /messages/:messageId` - Delete a message

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `GET /users/username/:username` - Get user by username
- `POST /users` - Create a new user

---

## Example: Frontend WebSocket Client (JavaScript)

```javascript
const ws = new WebSocket('ws://192.168.1.6:8001/ws');

// Connect
ws.onopen = () => {
  console.log('Connected to WebSocket');
  
  // Join a room
  ws.send(JSON.stringify({
    type: 'join',
    roomId: 1,
    userId: 'your-user-uuid',
    username: 'JohnDoe'
  }));
};

// Receive messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
  
  switch(message.type) {
    case 'joined':
      console.log('Successfully joined room');
      break;
    case 'new_message':
      console.log('New message:', message.data);
      // Display message in UI
      break;
    case 'user_joined':
      console.log(`${message.username} joined`);
      break;
    case 'user_left':
      console.log(`${message.username} left`);
      break;
    case 'user_typing':
      console.log(`${message.username} is ${message.isTyping ? 'typing' : 'not typing'}`);
      break;
    case 'error':
      console.error('Error:', message.message);
      break;
  }
};

// Send a message
function sendMessage(content) {
  ws.send(JSON.stringify({
    type: 'message',
    content: content
  }));
}

// Send typing indicator
function sendTyping(isTyping) {
  ws.send(JSON.stringify({
    type: 'typing',
    isTyping: isTyping
  }));
}

// Leave room
function leaveRoom() {
  ws.send(JSON.stringify({
    type: 'leave'
  }));
}

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
```

---

## Room Types

- **text**: Only text messages (no video)
- **video**: Only video (no text messages)
- **mixed**: Both text messages and video

---

## Notes

- Messages are automatically saved to the database
- Video-only rooms cannot send/receive text messages
- Users automatically leave rooms when disconnecting
- All messages are broadcast to all connected users in the same room
