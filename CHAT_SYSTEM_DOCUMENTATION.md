# MindBridge Real-Time Peer Support Chat System

## 🎉 System Overview

The MindBridge chat system provides real-time peer support matching and messaging with full database persistence. Students can connect with trained peer supporters for anonymous, confidential chat sessions.

---

## 🏗️ Architecture

### **Database Tables**

1. **chat_rooms** - Manages chat sessions
   - Links students to peer supporters
   - Tracks session status (waiting/active/closed)
   - Supports anonymous mode

2. **chat_messages** - Stores all messages
   - Persists chat history
   - Timestamps for each message
   - Read receipts tracking

3. **peer_support_availability** - Tracks peer supporter status
   - Online/offline status
   - Socket.io connection IDs
   - Concurrent chat capacity

### **Technology Stack**

**Backend:**
- Node.js + Express
- Socket.io (real-time communication)
- PostgreSQL (data persistence)
- Custom chat service module

**Frontend:**
- React
- Socket.io-client
- Real-time UI updates

---

## 🚀 Features Implemented

### ✅ Core Functionality

1. **Auto-Matching System**
   - Students are automatically matched with available peer supporters
   - Load balancing (assigns peer with least active chats)
   - Waiting queue when no peers available

2. **Real-Time Messaging**
   - Instant message delivery
   - Message persistence to database
   - Chat history loaded on connection

3. **Typing Indicators**
   - Shows when other user is typing
   - Auto-hides after 1 second of inactivity

4. **Connection Management**
   - Automatic reconnection
   - Online/offline status tracking
   - Graceful disconnect handling

5. **Anonymous Mode**
   - Student identity hidden from peer supporter
   - Database stores actual IDs for auditing
   - Privacy-preserving UI

---

## 📁 File Structure

```
server/
├── services/
│   └── chatService.js           # Database operations
├── migrations/
│   ├── 001_create_chat_tables.sql
│   └── run-migration.js
├── index.js                      # Socket.io server integration
└── db.js                         # Database connection

client/src/components/
├── ChatComponent.js              # Real-time chat UI
└── StudentDashboard.js           # Dashboard integration
```

---

## 🔌 Socket.io Events

### **Client → Server**

| Event | Data | Description |
|-------|------|-------------|
| `authenticate` | `{ userId, userType }` | Authenticate user and join chat room |
| `chat_message` | `{ chatRoomId, message }` | Send a message |
| `typing` | `{ chatRoomId, isTyping }` | Send typing indicator |
| `close_chat` | `{ chatRoomId }` | Close chat session |

### **Server → Client**

| Event | Data | Description |
|-------|------|-------------|
| `chat_ready` | `{ chatRoomId, status, history }` | Chat room ready with history |
| `chat_message` | `{ id, message, sender, timestamp }` | New message received |
| `user_typing` | `{ isTyping, userId }` | Other user typing status |
| `chat_closed` | `{ message }` | Chat session ended |
| `new_chat_assigned` | `{ chatRoomId, studentId }` | New chat assigned to peer supporter |
| `error` | `{ message }` | Error occurred |

---

## 💾 Database Schema

### **chat_rooms Table**

```sql
CREATE TABLE chat_rooms (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,              -- FK to users(id)
  peer_support_id INTEGER,                  -- FK to users(id), nullable
  status VARCHAR(20) DEFAULT 'waiting',     -- waiting, active, closed
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP
);
```

### **chat_messages Table**

```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  chat_room_id INTEGER NOT NULL,            -- FK to chat_rooms(id)
  sender_id INTEGER NOT NULL,               -- FK to users(id)
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);
```

### **peer_support_availability Table**

```sql
CREATE TABLE peer_support_availability (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,          -- FK to users(id)
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  socket_id VARCHAR(255),
  max_concurrent_chats INTEGER DEFAULT 3,
  current_active_chats INTEGER DEFAULT 0
);
```

---

## 🎯 How It Works

### **Student Flow**

1. Student navigates to Peer Support → "Start Anonymous Chat"
2. ChatComponent connects to Socket.io server
3. Client emits `authenticate` with userId=1, userType='student'
4. Server creates chat room, tries to match with peer supporter
5. If peer available: room becomes 'active', peer is notified
6. If no peer: room stays 'waiting', student sees waiting message
7. Student and peer can exchange real-time messages
8. All messages are saved to database
9. Chat history persists across sessions

### **Peer Supporter Flow**

1. Peer supporter connects (userId=2, userType='peer_supporter')
2. Server updates their status to `is_online = true`
3. They receive `new_chat_assigned` event when student needs help
4. They join the chat room and can start messaging
5. When they disconnect, status updates to `is_online = false`

---

## 🧪 Testing Guide

### **Prerequisites**
- PostgreSQL running
- Database migrated (chat tables created)
- Server started: `cd server && npm start`
- Client started: `cd client && npm start`

### **Test Scenarios**

#### **Test 1: Student-to-Peer Supporter Chat**

1. **Open Browser Window 1 (Student)**
   - Go to `http://localhost:3000/login`
   - Login as student
   - Navigate to Peer Support tab
   - Click "Start Anonymous Chat"
   - You should see: "Waiting for available peer supporter..."

2. **Open Browser Window 2 (Peer Supporter)**
   - Go to `http://localhost:3000/login`
   - Login as peer supporter (or add `?peer=true` to dashboard URL)
   - Navigate to Peer Support tab
   - Click "Start Anonymous Chat"
   - Peer supporter should connect automatically

3. **Test Messaging**
   - Type message in Window 1 → Should appear in Window 2
   - Type message in Window 2 → Should appear in Window 1
   - Check typing indicators work

4. **Test Persistence**
   - Refresh either window
   - Chat history should load from database

#### **Test 2: Database Verification**

```sql
-- Check chat rooms
SELECT * FROM chat_rooms;

-- Check messages
SELECT cm.*, u.email
FROM chat_messages cm
JOIN users u ON cm.sender_id = u.id
ORDER BY cm.created_at DESC;

-- Check peer availability
SELECT psa.*, u.email
FROM peer_support_availability psa
JOIN users u ON psa.user_id = u.id;
```

---

## 🔧 Configuration

### **Environment Variables (.env)**

```bash
DB_USER=postgres
DB_HOST=localhost
DB_NAME=mindbridge_dev
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
```

### **Peer Supporter Settings**

- **Max Concurrent Chats**: 3 (configurable in database)
- **Auto-Match**: Enabled
- **Load Balancing**: Assigns peer with fewest active chats

---

## 📊 API Reference

### **Chat Service Functions** (`server/services/chatService.js`)

```javascript
// Find available peer supporter
findAvailablePeerSupporter()

// Create new chat room
createChatRoom(studentId, peerSupportId, isAnonymous)

// Get active chat room for user
getActiveChatRoom(userId)

// Save message
saveMessage(chatRoomId, senderId, message)

// Get chat history
getChatHistory(chatRoomId, limit)

// Mark messages as read
markMessagesAsRead(chatRoomId, userId)

// Close chat room
closeChatRoom(chatRoomId)

// Update peer supporter status
updatePeerSupporterStatus(userId, isOnline, socketId)

// Assign peer to waiting room
assignPeerSupporter(chatRoomId, peerSupportId)
```

---

## 🚀 Future Enhancements

### **Planned Features**

- [ ] Group chat support
- [ ] File/image sharing
- [ ] Push notifications
- [ ] Chat ratings/feedback
- [ ] Admin dashboard for monitoring
- [ ] Crisis escalation workflow
- [ ] Automated chatbot for FAQ
- [ ] Voice/video call integration

---

## 🐛 Troubleshooting

### **Common Issues**

**Issue**: "Not authenticated" error
- **Solution**: Make sure `userId` and `userType` are passed to ChatComponent

**Issue**: Messages not persisting
- **Solution**: Check database connection, verify chat_rooms table exists

**Issue**: Peer supporter not matching
- **Solution**: Ensure peer supporter is online, check `peer_support_availability` table

**Issue**: Typing indicator not working
- **Solution**: Verify `chatRoomId` is set before sending typing events

---

## 📝 Notes

- All chat sessions are anonymous by default
- Database stores actual user IDs for auditing
- Messages are never deleted, only chat rooms can be closed
- Peer supporters can handle up to 3 concurrent chats
- Socket rooms are named `chat_{chatRoomId}`

---

## 👥 Contributors

- MindBridge Development Team
- Claude Code AI Assistant

---

**Last Updated**: October 20, 2025
**Version**: 1.0.0
