// src/services/matrixService.js
// Enhanced Matrix service with better sync debugging

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
  }

  /**
   * Initialize Matrix client with enhanced debugging
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
      console.log('🔄 Initializing Matrix client...');
      console.log('📋 Config:', { userId, homeServerUrl, hasToken: !!accessToken });
      
      // Dynamically load Matrix SDK
      const matrixCreateClient = await initializeMatrixSDK();
      if (!matrixCreateClient) {
        throw new Error('Failed to load Matrix SDK');
      }

      // Test Matrix server connectivity first
      console.log('🔍 Testing Matrix server connectivity...');
      try {
        const testResponse = await fetch(`${homeServerUrl}/_matrix/client/versions`);
        if (!testResponse.ok) {
          console.error('❌ Matrix server not reachable:', testResponse.status);
          throw new Error(`Matrix server not reachable: ${testResponse.status}`);
        }
        console.log('✅ Matrix server is reachable');
      } catch (networkError) {
        console.error('❌ Matrix server connectivity test failed:', networkError);
        throw new Error('Cannot connect to Matrix server');
      }

      // Create Matrix client
      this.client = matrixCreateClient({
        baseUrl: homeServerUrl,
        accessToken: accessToken,
        userId: userId,
      });

      console.log('✅ Matrix client created successfully');

      // Set up event listeners before starting
      this.setupEventListeners();

      // Start the client with detailed options
      console.log('🔄 Starting Matrix client...');
      await this.client.startClient({
        initialSyncLimit: 10, // Reduced for faster sync
        pollTimeout: 20000,   // Reduced timeout
      });

      // Enhanced sync waiting with detailed logging
      await new Promise((resolve, reject) => {
        let syncTimeout;
        let syncAttempts = 0;
        const maxAttempts = 3;
        
        const onSync = (state, prevState, data) => {
          syncAttempts++;
          console.log(`🔄 Matrix sync attempt ${syncAttempts}/${maxAttempts} - State: ${state}`);
          
          if (data && data.error) {
            console.error('❌ Sync data error:', data.error);
          }
          
          if (state === 'PREPARED') {
            this.isConnected = true;
            console.log('✅ Matrix client connected and synced successfully');
            clearTimeout(syncTimeout);
            this.client.removeListener('sync', onSync);
            resolve();
          } else if (state === 'ERROR') {
            console.error('❌ Matrix sync error state:', data);
            
            if (syncAttempts < maxAttempts) {
              console.log(`🔄 Retrying sync (${syncAttempts}/${maxAttempts})...`);
              // Don't reject immediately, let it retry
              return;
            }
            
            clearTimeout(syncTimeout);
            this.client.removeListener('sync', onSync);
            reject(new Error(`Matrix sync failed after ${maxAttempts} attempts: ${data?.error || 'Unknown error'}`));
          } else if (state === 'SYNCING') {
            console.log('🔄 Matrix is syncing...');
          } else if (state === 'RECONNECTING') {
            console.log('🔄 Matrix is reconnecting...');
          }
        };

        this.client.on('sync', onSync);

        // Extended timeout for slower connections
        syncTimeout = setTimeout(() => {
          this.client.removeListener('sync', onSync);
          reject(new Error('Matrix sync timeout - connection took too long'));
        }, 45000); // 45 seconds
      });

      this.isInitializing = false;
      return { success: true, message: 'Matrix client initialized successfully' };
      
    } catch (error) {
      this.isInitializing = false;
      console.error('❌ Matrix initialization failed:', error);
      
      // Cleanup on failure
      if (this.client) {
        try {
          this.client.stopClient();
        } catch (stopError) {
          console.error('Error stopping client:', stopError);
        }
        this.client = null;
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Set up Matrix event listeners with better error handling
   */
  setupEventListeners() {
    if (!this.client) return;

    console.log('🔄 Setting up Matrix event listeners...');

    // Listen for new messages
    this.client.on('Room.timeline', (event, room, toStartOfTimeline) => {
      try {
        if (toStartOfTimeline) return;
        if (event.getType() !== 'm.room.message') return;
        if (room.roomId !== this.currentRoomId) return;

        console.log('📨 New message received:', event.getContent().body);
        const message = this.formatMessage(event, room);
        this.notifyMessageListeners(message);
      } catch (error) {
        console.error('Error handling message event:', error);
      }
    });

    // Enhanced sync status listening
    this.client.on('sync', (state, prevState, data) => {
      console.log('🔄 Matrix sync status changed:', state);
      this.notifyStatusListeners(state);
      
      if (state === 'ERROR') {
        console.error('❌ Sync error details:', data);
      }
    });

    // Listen for connection errors
    this.client.on('event', (event) => {
      if (event.getType() === 'm.room.message' && event.roomId === this.currentRoomId) {
        console.log('📨 Event received:', event.getContent());
      }
    });

    console.log('✅ Event listeners set up successfully');
  }

  /**
   * Join a Matrix room with better error handling
   */
  async joinRoom(roomId) {
    try {
      if (!this.client) {
        throw new Error('Matrix client not initialized');
      }

      if (!this.isConnected) {
        console.log('⚠️ Matrix not fully connected yet, attempting anyway...');
      }

      console.log('🔄 Joining Matrix room:', roomId);
      
      // Try to join the room
      try {
        await this.client.joinRoom(roomId);
        console.log('✅ Successfully joined room via API');
      } catch (joinError) {
        console.log('ℹ️ Join room API call failed (might already be in room):', joinError.message);
        // Continue anyway - might already be in the room
      }

      this.currentRoomId = roomId;

      // Give it a moment to settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      const room = this.client.getRoom(roomId);
      console.log('🔍 Room object after join:', room ? 'Found' : 'Not found');

      if (room) {
        console.log('📊 Room details:', {
          name: room.name,
          members: room.getJoinedMemberCount(),
          roomId: room.roomId
        });
      }

      const messages = room ? this.getRecentMessages(room) : [];
      console.log(`📨 Loaded ${messages.length} recent messages`);
      
      return {
        success: true,
        roomId,
        roomName: room?.name || 'Live Session',
        messages,
        memberCount: room?.getJoinedMemberCount() || 1
      };

    } catch (error) {
      console.error('❌ Failed to join room:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a message with enhanced error handling
   */
  async sendMessage(content, msgType = 'm.text') {
    try {
      if (!this.client) {
        throw new Error('Matrix client not initialized');
      }

      if (!this.currentRoomId) {
        throw new Error('Not connected to a room');
      }

      if (!this.isConnected) {
        console.log('⚠️ Matrix not fully connected, attempting to send anyway...');
      }

      console.log('📤 Sending message:', content);

      const result = await this.client.sendEvent(
        this.currentRoomId,
        'm.room.message',
        {
          msgtype: msgType,
          body: content
        }
      );

      console.log('✅ Message sent successfully:', result.event_id);
      return { success: true, eventId: result.event_id };

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent messages from room
   */
  getRecentMessages(room, limit = 20) {
    if (!room) {
      console.log('⚠️ No room object provided for message history');
      return [];
    }

    try {
      const timeline = room.getLiveTimeline();
      const events = timeline.getEvents();
      
      const messageEvents = events.filter(event => event.getType() === 'm.room.message');
      const recentEvents = messageEvents.slice(-limit);
      
      console.log(`📨 Found ${messageEvents.length} total messages, returning ${recentEvents.length} recent ones`);
      
      return recentEvents.map(event => this.formatMessage(event, room));
    } catch (error) {
      console.error('Error getting recent messages:', error);
      return [];
    }
  }

  /**
   * Format Matrix event as message object
   */
  formatMessage(event, room) {
    try {
      const sender = event.getSender();
      const content = event.getContent();
      const senderMember = room?.getMember(sender);
      
      return {
        id: event.getId(),
        sender: senderMember?.name || sender || 'Unknown',
        senderId: sender,
        content: content.body || '',
        timestamp: new Date(event.getTs()).toISOString(),
        type: this.getUserType(sender),
        avatar: null,
        reactions: []
      };
    } catch (error) {
      console.error('Error formatting message:', error);
      return {
        id: Date.now().toString(),
        sender: 'Unknown',
        senderId: 'unknown',
        content: 'Error loading message',
        timestamp: new Date().toISOString(),
        type: 'system',
        avatar: null,
        reactions: []
      };
    }
  }

  /**
   * Determine user type based on user ID
   */
  getUserType(userId) {
    if (!userId) return 'unknown';
    if (userId.includes('instructor_')) return 'instructor';
    if (userId.includes('student_')) return 'student';
    if (userId.includes('@nom:')) return 'system';
    return 'unknown';
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

  notifyMessageListeners(message) {
    this.messageListeners.forEach(callback => {
      try {
        callback(message);
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
   * Send typing indicator
   */
  async sendTyping(isTyping = true, timeout = 10000) {
    try {
      if (!this.client || !this.currentRoomId) return { success: false };
      
      await this.client.sendTyping(this.currentRoomId, isTyping, timeout);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send typing indicator:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Leave current room and cleanup
   */
  async leaveRoom() {
    try {
      if (this.client && this.currentRoomId) {
        await this.client.leave(this.currentRoomId);
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
      if (this.client) {
        this.client.stopClient();
        this.client = null;
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
      userId: this.client?.getUserId() || null
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