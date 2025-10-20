import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

function ChatComponent() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Connect to Socket.io server
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✓ Connected to Socket.io server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('✗ Disconnected from Socket.io server');
      setIsConnected(false);
    });

    // Listen for welcome message from server
    newSocket.on('welcome', (data) => {
      console.log('Welcome message received:', data);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.message,
        sender: 'system',
        timestamp: new Date(data.timestamp)
      }]);
    });

    // Listen for incoming messages
    newSocket.on('chat_message', (data) => {
      setMessages(prev => [...prev, {
        id: data.id || Date.now(),
        text: data.message,
        sender: data.sender || 'other',
        timestamp: new Date(data.timestamp)
      }]);
    });

    // Cleanup on component unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      id: Date.now(),
      message: inputMessage,
      sender: 'me',
      timestamp: new Date().toISOString()
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, {
      id: messageData.id,
      text: messageData.message,
      sender: 'me',
      timestamp: new Date(messageData.timestamp)
    }]);

    // Send message to server
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={!isConnected}
          style={{
            ...styles.input,
            ...(isConnected ? {} : styles.inputDisabled)
          }}
        />
        <button
          type="submit"
          disabled={!isConnected || !inputMessage.trim()}
          style={{
            ...styles.sendButton,
            ...(!isConnected || !inputMessage.trim() ? styles.sendButtonDisabled : {})
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
  }
};

export default ChatComponent;
