// src/services/matrixService.js
// FIXED: Get auth token from COOKIES (not localStorage)

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

// ✅ HELPER: Get auth token from cookies
const getAuthTokenFromCookies = () => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_token') {
      return value;
    }
  }
  return null;
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
    this.useServerProxy = true;
    this.userId = null;
    
    // FIXED: Prevent infinite polling
    this.pollingInterval = null;
    this.lastMessageTime = 0;
    this.isPolling = false;
    this.maxPollInterval = 30000; // Max 30 seconds between polls
    this.minPollInterval = 5000;  // Min 5 seconds between polls
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
      this.userId = userId;
      
      console.log('🔄 Initializing Matrix with server proxy...');
      
      // Use server proxy approach
      return await this.initializeServerProxy(userId);
      
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
      this.userId = userId;
      this.isConnected = true;
      this.isInitializing = false;
      
      console.log('✅ Matrix server proxy initialized for:', userId);
      
      // Emit status update
      this.emitStatus('PREPARED');
      
      return { success: true, message: 'Server proxy initialized' };
      
    } catch (error) {
      this.isInitializing = false;
      this.isConnected = false;
      console.error('❌ Server proxy initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Join room using server proxy
   * ✅ FIXED: Now gets token from COOKIES instead of localStorage
   */
  async joinRoom(roomId, userCredentials) {
    try {
      console.log('🔄 Joining room via server proxy:', roomId);

      // ✅ ADDED: Detect user role from userId
      const isInstructor = userCredentials?.userId?.includes('@instructor_');
      const userRole = isInstructor ? 'instructor' : 'student';
      
      console.log('🔑 User role detected:', userRole, '| userId:', userCredentials?.userId);

      // ✅ CRITICAL FIX: Get auth token from COOKIES (not localStorage)
      const authToken = getAuthTokenFromCookies();
      
      if (!authToken || authToken === 'undefined' || authToken === 'null') {
        console.error('❌ No valid auth token found in cookies');
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('🔐 Auth token from cookie:', authToken.substring(0, 20) + '...');

      const response = await fetch('/api/matrix/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`  // ✅ Token from cookies
        },
        body: JSON.stringify({ 
          roomId,
          userRole  // ✅ CRITICAL: Pass role to API
        })
      });

      console.log('📡 API Response status:', response.status);

      const result = await response.json();
      
      if (!result.success) {
        console.error('❌ Join room failed:', result.error);
        throw new Error(result.error || 'Failed to join room');
      }

      this.currentRoomId = roomId;
      
      // FIXED: Start controlled polling instead of infinite polling
      this.startControlledPolling();
      
      console.log('✅ Joined room successfully as:', userRole);
      
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
   * FIXED: Start controlled polling (not infinite)
   */
  startControlledPolling() {
    // Stop any existing polling first
    this.stopPolling();
    
    if (!this.currentRoomId || this.isPolling) {
      return;
    }
    
    this.isPolling = true;
    console.log('🔄 Starting controlled message polling (every 10 seconds)');
    
    // Poll every 10 seconds (not continuously)
    this.pollingInterval = setInterval(() => {
      this.pollMessages();
    }, 10000); // 10 second intervals
    
    // Initial poll
    this.pollMessages();
  }

  /**
   * FIXED: Controlled message polling
   */
  async pollMessages() {
    if (!this.currentRoomId || !this.isPolling) {
      return;
    }

    try {
      const response = await fetch('/api/matrix/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: this.currentRoomId
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data.messages) {
          // Filter only new messages since last poll
          const newMessages = result.data.messages.filter(msg => {
            const msgTime = new Date(msg.timestamp).getTime();
            return msgTime > this.lastMessageTime;
          });

          if (newMessages.length > 0) {
            // Update last message time
            this.lastMessageTime = Math.max(...newMessages.map(msg => 
              new Date(msg.timestamp).getTime()
            ));

            // Emit new messages
            newMessages.forEach(message => {
              this.emitMessage(message);
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Polling error:', error);
    }
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isPolling = false;
      console.log('⏹️ Stopped message polling');
    }
  }

  /**
   * Send message using server proxy
   * ✅ FIXED: Gets token from cookies
   */
  async sendMessage(content, msgType = 'm.text') {
    if (!content.trim() || !this.currentRoomId) {
      return { success: false, error: 'No content or room' };
    }

    try {
      // ✅ Get token from cookies
      const authToken = getAuthTokenFromCookies();
      
      const response = await fetch('/api/matrix/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
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
    if (!this.currentRoomId) return;

    try {
      await fetch('/api/matrix/typing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: this.currentRoomId,
          isTyping,
          timeout
        })
      });
    } catch (error) {
      console.error('❌ Failed to send typing indicator:', error);
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

  emitMessage(message) {
    this.messageListeners.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('❌ Error in message listener:', error);
      }
    });
  }

  emitStatus(status) {
    this.statusListeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('❌ Error in status listener:', error);
      }
    });
  }

  emitTyping(users) {
    this.typingListeners.forEach(callback => {
      try {
        callback(users);
      } catch (error) {
        console.error('❌ Error in typing listener:', error);
      }
    });
  }

  /**
   * Leave room and cleanup
   */
  async leaveRoom() {
    try {
      this.stopPolling();
      
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
      this.stopPolling();
      
      this.isConnected = false;
      this.currentRoomId = null;
      this.isInitializing = false;
      this.lastMessageTime = 0;
      
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
      userId: this.userId || null,
      isPolling: this.isPolling
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