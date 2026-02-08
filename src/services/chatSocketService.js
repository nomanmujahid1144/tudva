// src/services/chatSocketService.js
// ✅ Real-time chat service using WebSocket

import { io } from 'socket.io-client';

class ChatSocketService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.userId = null;
    this.userName = null;
    this.userRole = null;
    this.isConnected = false;
    
    // Event callbacks
    this.onMessageCallback = null;
    this.onTypingCallback = null;
    this.onUserJoinedCallback = null;
    this.onUserLeftCallback = null;
  }

  /**
   * Connect to chat room
   */
  async connect(roomId, userId, userName, userRole) {
    try {
      console.log('💬 Connecting to chat room:', roomId);
      
      this.roomId = roomId;
      this.userId = userId;
      this.userName = userName;
      this.userRole = userRole;
      
      // Connect to signaling server
      if (!this.socket) {
        this.socket = io(process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:3001', {
          transports: ['websocket'],
          reconnection: true
        });
        
        this.setupSocketListeners();
      }
      
      // Wait for connection
      await new Promise((resolve) => {
        if (this.socket.connected) {
          resolve();
        } else {
          this.socket.once('connect', () => {
            console.log('✅ Connected to chat server');
            resolve();
          });
        }
      });
      
      // Join chat room
      this.socket.emit('chat-join', {
        roomId,
        userId,
        userName,
        userRole
      });
      
      this.isConnected = true;
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to connect to chat:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup socket event listeners
   */
  setupSocketListeners() {
    // New message received
    this.socket.on('new-message', ({ message }) => {
      console.log('📩 New message received:', message.sender);
      
      if (this.onMessageCallback) {
        this.onMessageCallback(message);
      }
    });

    // User typing
    this.socket.on('user-typing', ({ userId, userName, isTyping }) => {
      if (this.onTypingCallback) {
        this.onTypingCallback({ userId, userName, isTyping });
      }
    });

    // User joined chat
    this.socket.on('user-joined-chat', ({ userId, userName, userRole }) => {
      console.log('👋 User joined chat:', userName);
      
      if (this.onUserJoinedCallback) {
        this.onUserJoinedCallback({ userId, userName, userRole });
      }
    });

    // User left chat
    this.socket.on('user-left-chat', ({ userId }) => {
      console.log('👋 User left chat:', userId);
      
      if (this.onUserLeftCallback) {
        this.onUserLeftCallback({ userId });
      }
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Chat socket connected');
      this.isConnected = true;
      
      // Rejoin room after reconnection
      if (this.roomId) {
        this.socket.emit('chat-join', {
          roomId: this.roomId,
          userId: this.userId,
          userName: this.userName,
          userRole: this.userRole
        });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Chat socket disconnected');
      this.isConnected = false;
    });
  }

  /**
   * Send a message
   */
  sendMessage(message) {
    if (!this.isConnected || !this.socket) {
      console.error('❌ Cannot send message: not connected');
      return { success: false, error: 'Not connected' };
    }

    try {
      this.socket.emit('chat-message', {
        roomId: this.roomId,
        message
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(isTyping) {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.emit('chat-typing', {
      roomId: this.roomId,
      userId: this.userId,
      userName: this.userName,
      isTyping
    });
  }

  /**
   * Register callbacks
   */
  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  onTyping(callback) {
    this.onTypingCallback = callback;
  }

  onUserJoined(callback) {
    this.onUserJoinedCallback = callback;
  }

  onUserLeft(callback) {
    this.onUserLeftCallback = callback;
  }

  /**
   * Disconnect from chat
   */
  disconnect() {
    if (this.socket && this.roomId) {
      this.socket.emit('chat-leave', {
        roomId: this.roomId,
        userId: this.userId
      });
      
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.roomId = null;
    this.userId = null;
    this.userName = null;
    this.userRole = null;
    
    console.log('✅ Disconnected from chat');
  }
}

// Create singleton instance
const chatSocketService = new ChatSocketService();

export default chatSocketService;