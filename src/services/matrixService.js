// src/services/matrixService.js
// FIXED: Server-side Matrix proxy approach

let createClient;

const initializeMatrixSDK = async () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!createClient) {
    const matrixSDK = await import('matrix-js-sdk');
    createClient = matrixSDK.createClient;
  }
  
  return createClient;
};

class MatrixService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.currentRoomId = null;
    this.messageListeners = new Set();
    this.statusListeners = new Set();
    this.typingListeners = new Set();
    this.isInitializing = false;
    this.useServerProxy = true; // Use server-side Matrix operations
  }

  /**
   * Initialize Matrix client with server proxy
   */
  async initialize(userId, accessToken, homeServerUrl = 'https://chat.151.hu') {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server-side rendering - skipping Matrix' };
      }

      if (this.isInitializing) {
        console.log('⏳ Matrix already initializing...');
        return { success: false, error: 'Already initializing' };
      }

      this.isInitializing = true;
      console.log('🔄 Initializing Matrix with server proxy...');
      
      // Instead of direct Matrix connection, use server proxy
      if (this.useServerProxy) {
        return await this.initializeServerProxy(userId);
      }

      // Legacy direct connection (not recommended for your use case)
      return await this.initializeDirect(userId, accessToken, homeServerUrl);
      
    } catch (error) {
      console.error('❌ Matrix initialization failed:', error);
      this.isInitializing = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize using server-side Matrix proxy
   */
  async initializeServerProxy(userId) {
    try {
      console.log('🔄 Using server proxy for Matrix operations');
      
      // Test server connectivity
      const response = await fetch('/api/matrix/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      this.isConnected = true;
      this.userId = userId;
      console.log('✅ Server proxy Matrix connection established');
      
      // Set up polling for messages
      this.startMessagePolling();
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Server proxy initialization failed:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Start polling for messages from server
   */
  startMessagePolling() {
    // Poll every 2 seconds for new messages
    this.pollingInterval = setInterval(async () => {
      if (this.currentRoomId) {
        await this.fetchMessages();
      }
    }, 2000);
  }

  /**
   * Fetch messages from server proxy
   */
  async fetchMessages() {
    try {
      const response = await fetch('/api/matrix/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          roomId: this.currentRoomId,
          userId: this.userId 
        })
      });

      const result = await response.json();
      
      if (result.success && result.data.messages) {
        // Update messages and notify listeners
        this.notifyMessageListeners(result.data.messages);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
    }
  }

  /**
   * Join room using server proxy
   */
  async joinRoom(roomId) {
    try {
      console.log('🔄 Joining room via server proxy:', roomId);

      const response = await fetch('/api/matrix/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          roomId,
          userId: this.userId 
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      this.currentRoomId = roomId;
      console.log('✅ Joined room successfully');
      
      return {
        success: true,
        roomId,
        messages: result.data.messages || [],
        roomName: result.data.roomName,
        memberCount: result.data.memberCount
      };
      
    } catch (error) {
      console.error('❌ Failed to join room:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send message using server proxy
   */
  async sendMessage(content, msgType = 'm.text') {
    if (!content.trim() || !this.currentRoomId) {
      return { success: false, error: 'No content or room' };
    }

    try {
      const response = await fetch('/api/matrix/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: this.currentRoomId,
          userId: this.userId,
          content: content.trim(),
          msgType
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true, eventId: result.data.eventId };
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send typing indicator using server proxy
   */
  async sendTyping(isTyping = true, timeout = 10000) {
    try {
      if (!this.currentRoomId) return { success: false };
      
      const response = await fetch('/api/matrix/typing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: this.currentRoomId,
          userId: this.userId,
          isTyping,
          timeout
        })
      });

      const result = await response.json();
      return { success: result.success };
      
    } catch (error) {
      console.error('❌ Failed to send typing indicator:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Event listener management
   */
  onMessage(callback) {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  onStatus(callback) {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  onTyping(callback) {
    this.typingListeners.add(callback);
    return () => this.typingListeners.delete(callback);
  }

  notifyMessageListeners(messages) {
    this.messageListeners.forEach(callback => {
      try {
        if (Array.isArray(messages)) {
          messages.forEach(message => callback(message));
        } else {
          callback(messages);
        }
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  notifyStatusListeners(status) {
    this.statusListeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }

  notifyTypingListeners(typingUsers) {
    this.typingListeners.forEach(callback => {
      try {
        callback(typingUsers);
      } catch (error) {
        console.error('Error in typing listener:', error);
      }
    });
  }

  /**
   * Leave room and cleanup
   */
  async leaveRoom() {
    try {
      if (this.currentRoomId) {
        const response = await fetch('/api/matrix/leave-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: this.currentRoomId,
            userId: this.userId
          })
        });

        console.log('✅ Left Matrix room:', this.currentRoomId);
      }
      this.currentRoomId = null;
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to leave room:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect() {
    try {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      
      this.isConnected = false;
      this.currentRoomId = null;
      this.isInitializing = false;
      
      // Clear all listeners
      this.messageListeners.clear();
      this.statusListeners.clear();
      this.typingListeners.clear();
      
      console.log('✅ Matrix client disconnected');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to disconnect:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      currentRoomId: this.currentRoomId,
      userId: this.userId || null
    };
  }
}

// Create singleton instance only on client side
let matrixServiceInstance = null;

if (typeof window !== 'undefined') {
  matrixServiceInstance = new MatrixService();
}

export const matrixService = matrixServiceInstance;
export default matrixServiceInstance;