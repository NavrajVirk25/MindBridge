import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

function ChatComponent({ userId = 1, userType = 'student' }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState(null);
  const [chatStatus, setChatStatus] = useState('connecting');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Connect to Socket.io server
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✓ Connected to Socket.io server');
      console.log('👤 Authenticating as userId:', userId, 'userType:', userType);
      setIsConnected(true);

      // Authenticate user and join chat room
      newSocket.emit('authenticate', { userId, userType });
      console.log('📤 Sent authenticate event');
    });

    newSocket.on('disconnect', () => {
      console.log('✗ Disconnected from Socket.io server');
      setIsConnected(false);
      setChatStatus('disconnected');
    });

    // Listen for chat ready event (with history)
    newSocket.on('chat_ready', (data) => {
      console.log('📋 Chat ready event received:', data);
      console.log('🔑 Chat Room ID:', data.chatRoomId);
      console.log('📊 Status:', data.status);

      if (data.chatRoomId) {
        setChatRoomId(data.chatRoomId);
        setChatStatus(data.status);
        console.log('✅ Chat room ID set:', data.chatRoomId);

        // Load chat history
        if (data.history && data.history.length > 0) {
          setMessages(data.history.map(msg => ({
            id: msg.id,
            text: msg.message,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp)
          })));
        } else {
          // Add welcome message
          setMessages([{
            id: 'welcome',
            text: 'Chat session started. A peer supporter will be with you shortly.',
            sender: 'system',
            timestamp: new Date()
          }]);
        }
      } else {
        setChatStatus(data.status);
        setMessages([{
          id: 'waiting',
          text: data.message || 'Waiting for available peer supporter...',
          sender: 'system',
          timestamp: new Date()
        }]);
      }
    });

    // Listen for incoming messages
    newSocket.on('chat_message', (data) => {
      console.log('📨 Received chat_message:', data);
      setMessages(prev => [...prev, {
        id: data.id,
        text: data.message,
        sender: data.sender,
        timestamp: new Date(data.timestamp)
      }]);
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data) => {
      setIsTyping(data.isTyping);
    });

    // Listen for chat closed event
    newSocket.on('chat_closed', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.message,
        sender: 'system',
        timestamp: new Date()
      }]);
      setChatStatus('closed');
    });

    // Listen for errors
    newSocket.on('error', (data) => {
      console.error('❌ Socket error:', data);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Error: ${data.message}`,
        sender: 'system',
        timestamp: new Date()
      }]);
    });

    // Listen for welcome message (initial connection)
    newSocket.on('welcome', (data) => {
      console.log('👋 Welcome message received:', data);
    });

    // Cleanup on component unmount
    return () => {
      newSocket.close();
    };
  }, [userId, userType]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !chatRoomId) return;

    // Send typing start
    socket.emit('typing', { chatRoomId, isTyping: true });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { chatRoomId, isTyping: false });
    }, 1000);
  };

  // Send message handler
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !socket || !chatRoomId) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('typing', { chatRoomId, isTyping: false });

    const messageData = {
      chatRoomId,
      message: inputMessage
    };

    // Send message to server (don't add locally - wait for broadcast)
    console.log('📤 Sending message:', messageData);
    socket.emit('chat_message', messageData);

    // Clear input
    setInputMessage('');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.title}>Peer Support Chat</h2>
          <div style={styles.connectionStatus}>
            <div style={{
              ...styles.statusDot,
              backgroundColor: isConnected ? '#10b981' : '#ef4444'
            }}></div>
            <span style={styles.statusText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {/* Debug info */}
            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#6b7280' }}>
              Room: {chatRoomId || 'None'} | Status: {chatStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateText}>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.messageWrapper,
                justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                ...styles.messageBubble,
                ...(msg.sender === 'me' ? styles.myMessage :
                    msg.sender === 'system' ? styles.systemMessage :
                    styles.otherMessage)
              }}>
                <p style={styles.messageText}>{msg.text}</p>
                <span style={styles.messageTime}>{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div style={styles.typingIndicator}>
            <span>Peer supporter is typing</span>
            <span style={styles.typingDots}>...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type your message..."
          disabled={!isConnected || !chatRoomId || chatStatus === 'closed'}
          style={{
            ...styles.input,
            ...(isConnected && chatRoomId && chatStatus !== 'closed' ? {} : styles.inputDisabled)
          }}
        />
        <button
          type="submit"
          disabled={!isConnected || !chatRoomId || !inputMessage.trim() || chatStatus === 'closed'}
          style={{
            ...styles.sendButton,
            ...(!isConnected || !chatRoomId || !inputMessage.trim() || chatStatus === 'closed' ? styles.sendButtonDisabled : {})
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  },
  header: {
    backgroundColor: '#111827',
    padding: '20px',
    borderBottom: '1px solid #374151'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  statusText: {
    fontSize: '14px',
    color: '#9ca3af'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#1f2937',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: '16px'
  },
  messageWrapper: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    wordWrap: 'break-word'
  },
  myMessage: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    alignSelf: 'flex-end'
  },
  otherMessage: {
    backgroundColor: '#374151',
    color: '#ffffff',
    alignSelf: 'flex-start'
  },
  systemMessage: {
    backgroundColor: '#065f46',
    color: '#d1fae5',
    alignSelf: 'center',
    fontSize: '14px',
    textAlign: 'center'
  },
  messageText: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    lineHeight: '1.5'
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7
  },
  inputContainer: {
    display: 'flex',
    padding: '20px',
    backgroundColor: '#111827',
    borderTop: '1px solid #374151',
    gap: '12px'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#374151',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none'
  },
  inputDisabled: {
    backgroundColor: '#1f2937',
    cursor: 'not-allowed',
    opacity: 0.5
  },
  sendButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  sendButtonDisabled: {
    backgroundColor: '#1f2937',
    cursor: 'not-allowed',
    opacity: 0.5
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    color: '#9ca3af',
    fontSize: '14px',
    fontStyle: 'italic'
  },
  typingDots: {
    animation: 'blink 1.4s infinite',
    fontSize: '16px'
  }
};

export default ChatComponent;
