// // src/hooks/useMatrixChat.js
// // FIXED: Real-time chat hook for Matrix integration with userRole detection

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { matrixService } from '@/services/matrixService';
// import { toast } from 'react-hot-toast';

// export const useMatrixChat = (roomId, userCredentials) => {
//   const [messages, setMessages] = useState([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isJoining, setIsJoining] = useState(false);
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [roomInfo, setRoomInfo] = useState(null);
//   const [error, setError] = useState(null);
  
//   // Refs for cleanup
//   const messageUnsubscribe = useRef(null);
//   const statusUnsubscribe = useRef(null);
//   const typingUnsubscribe = useRef(null);

//   /**
//    * Initialize Matrix connection
//    */
//   const initializeMatrix = useCallback(async () => {
//     // For server proxy approach, we just need a user identifier
//     const userId = userCredentials?.userId || `user_${Date.now()}`;

//     try {
//       setIsJoining(true);
//       setError(null);
      
//       console.log('🔄 Initializing Matrix for user:', userId);
      
//       // Initialize Matrix client (will use server proxy)
//       const initResult = await matrixService.initialize(userId);

//       if (!initResult.success) {
//         throw new Error(initResult.error);
//       }

//       setIsConnected(true);
//       setConnectionStatus('connected');
      
//       // Set up event listeners
//       setupEventListeners();
      
//       console.log('✅ Matrix initialized successfully');
//       toast.success('Connected to chat');

//     } catch (error) {
//       console.error('❌ Matrix initialization failed:', error);
//       setError(error.message);
//       setConnectionStatus('error');
//       toast.error('Failed to connect to chat');
//     } finally {
//       setIsJoining(false);
//     }
//   }, [userCredentials]);

//   /**
//    * Join Matrix room
//    * ✅ FIXED: Now passes userCredentials to detect instructor vs student
//    */
//   const joinRoom = useCallback(async () => {
//     if (!roomId || !isConnected) return;

//     try {
//       setIsJoining(true);
//       console.log('🔄 Joining room:', roomId);
//       console.log('👤 User credentials:', userCredentials?.userId);

//       // ✅ CRITICAL FIX: Pass userCredentials to joinRoom
//       const joinResult = await matrixService.joinRoom(roomId, userCredentials);
      
//       if (!joinResult.success) {
//         throw new Error(joinResult.error);
//       }

//       // Set initial data
//       setMessages(joinResult.messages || []);
//       setRoomInfo({
//         roomId: joinResult.roomId,
//         roomName: joinResult.roomName,
//         memberCount: joinResult.memberCount
//       });

//       console.log('✅ Successfully joined room with', joinResult.messages?.length || 0, 'messages');
//       toast.success('Connected to chat');

//     } catch (error) {
//       console.error('❌ Failed to join room:', error);
//       setError(error.message);
//       toast.error('Failed to join chat room');
//     } finally {
//       setIsJoining(false);
//     }
//   }, [roomId, isConnected, userCredentials]); // ✅ Added userCredentials to dependency array

//   /**
//    * Set up Matrix event listeners
//    */
//   const setupEventListeners = useCallback(() => {
//     // Clean up existing listeners
//     cleanupListeners();

//     // Message listener
//     messageUnsubscribe.current = matrixService.onMessage((message) => {
//       setMessages(prev => {
//         // Avoid duplicates
//         if (prev.some(msg => msg.id === message.id)) {
//           return prev;
//         }
//         return [...prev, message];
//       });

//       // Show notification for new messages
//       if (message.type !== 'system') {
//         toast(`${message.sender}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`, {
//           icon: '💬',
//           duration: 3000
//         });
//       }
//     });

//     // Status listener
//     statusUnsubscribe.current = matrixService.onStatus((status) => {
//       setConnectionStatus(status);
      
//       if (status === 'PREPARED') {
//         setIsConnected(true);
//       } else if (status === 'ERROR') {
//         setIsConnected(false);
//         setError('Connection lost');
//         toast.error('Chat connection lost');
//       }
//     });

//     // Typing listener
//     typingUnsubscribe.current = matrixService.onTyping((users) => {
//       setTypingUsers(users);
//     });

//   }, []);

//   /**
//    * Send a message
//    */
//   const sendMessage = useCallback(async (content, msgType = 'm.text') => {
//     if (!content.trim() || !isConnected) return { success: false };

//     try {
//       const result = await matrixService.sendMessage(content.trim(), msgType);
      
//       if (!result.success) {
//         throw new Error(result.error);
//       }

//       return { success: true, eventId: result.eventId };

//     } catch (error) {
//       console.error('❌ Failed to send message:', error);
//       toast.error('Failed to send message');
//       return { success: false, error: error.message };
//     }
//   }, [isConnected]);

//   /**
//    * Send typing indicator
//    */
//   const sendTyping = useCallback(async (isTyping = true) => {
//     if (!isConnected) return;

//     try {
//       await matrixService.sendTyping(isTyping, 10000);
//     } catch (error) {
//       console.error('❌ Failed to send typing indicator:', error);
//     }
//   }, [isConnected]);

//   /**
//    * Leave room
//    */
//   const leaveRoom = useCallback(async () => {
//     try {
//       await matrixService.leaveRoom();
//       setMessages([]);
//       setRoomInfo(null);
//       setTypingUsers([]);
//       console.log('✅ Left room successfully');
//     } catch (error) {
//       console.error('❌ Failed to leave room:', error);
//     }
//   }, []);

//   /**
//    * Disconnect from Matrix
//    */
//   const disconnect = useCallback(async () => {
//     try {
//       cleanupListeners();
//       await matrixService.disconnect();
      
//       setIsConnected(false);
//       setMessages([]);
//       setRoomInfo(null);
//       setTypingUsers([]);
//       setConnectionStatus('disconnected');
//       setError(null);
      
//       console.log('✅ Disconnected successfully');
//     } catch (error) {
//       console.error('❌ Failed to disconnect:', error);
//     }
//   }, []);

//   /**
//    * Clean up event listeners
//    */
//   const cleanupListeners = useCallback(() => {
//     if (messageUnsubscribe.current) {
//       messageUnsubscribe.current();
//       messageUnsubscribe.current = null;
//     }
//     if (statusUnsubscribe.current) {
//       statusUnsubscribe.current();
//       statusUnsubscribe.current = null;
//     }
//     if (typingUnsubscribe.current) {
//       typingUnsubscribe.current();
//       typingUnsubscribe.current = null;
//     }
//   }, []);

//   /**
//    * Initialize on mount
//    */
//   useEffect(() => {
//     initializeMatrix();

//     return () => {
//       cleanupListeners();
//     };
//   }, [initializeMatrix]);

//   /**
//    * Join room when connected and roomId available
//    */
//   useEffect(() => {
//     if (isConnected && roomId && !roomInfo) {
//       joinRoom();
//     }
//   }, [isConnected, roomId, roomInfo, joinRoom]);

//   /**
//    * Helper functions
//    */
//   const getLastMessage = useCallback(() => {
//     return messages[messages.length - 1] || null;
//   }, [messages]);

//   const getMessageCount = useCallback(() => {
//     return messages.length;
//   }, [messages]);

//   const getUnreadCount = useCallback(() => {
//     // This could be enhanced with read receipts
//     return 0;
//   }, []);

//   return {
//     // State
//     messages,
//     isConnected,
//     isJoining,
//     typingUsers,
//     connectionStatus,
//     roomInfo,
//     error,
    
//     // Actions
//     sendMessage,
//     sendTyping,
//     leaveRoom,
//     disconnect,
    
//     // Helpers
//     getLastMessage,
//     getMessageCount,
//     getUnreadCount,
    
//     // Status checks
//     canSendMessage: isConnected && roomInfo,
//     isLoading: isJoining || connectionStatus === 'reconnecting'
//   };
// };

// src/hooks/useMatrixChat.js
// ✅ FINAL FIXED VERSION - No disconnect loops, stable WebSocket connection

import { useState, useEffect, useCallback, useRef } from 'react';
import { matrixService } from '@/services/matrixService';
import chatSocketService from '@/services/chatSocketService';
import { toast } from 'react-hot-toast';

/**
 * ✅ Helper: Get user info from auth token in cookies
 */
const getUserInfoFromCookies = () => {
  if (typeof document === 'undefined') return null;
  
  try {
    // Get auth token from cookies
    const cookies = document.cookie.split(';');
    let authToken = null;
    
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        authToken = value;
        break;
      }
    }
    
    if (!authToken || authToken === 'undefined' || authToken === 'null') {
      return null;
    }
    
    // Decode JWT token
    const payload = JSON.parse(atob(authToken.split('.')[1]));
    
    return {
      fullName: payload.fullName || payload.name || 'User',
      email: payload.email || '',
      role: payload.role || 'student',
      userId: payload.userId
    };
  } catch (error) {
    console.error('❌ Failed to decode auth token:', error);
    return null;
  }
};

export const useMatrixChat = (roomId, userCredentials) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [roomInfo, setRoomInfo] = useState(null);
  const [error, setError] = useState(null);
  
  // ✅ Use refs to prevent re-initialization
  const isInitialized = useRef(false);
  const isMatrixInitialized = useRef(false);
  const typingTimeouts = useRef(new Map());

  /**
   * Initialize Matrix (for history only) - STABLE, won't cause re-renders
   */
  useEffect(() => {
    // ✅ Only initialize once
    if (isMatrixInitialized.current) {
      console.log('⏩ Matrix already initialized, skipping');
      return;
    }

    const initialize = async () => {
      const userId = userCredentials?.userId || `user_${Date.now()}`;

      try {
        setIsJoining(true);
        setError(null);
        
        console.log('🔄 Initializing Matrix for user:', userId);
        
        const initResult = await matrixService.initialize(userId);

        if (!initResult.success) {
          throw new Error(initResult.error);
        }

        isMatrixInitialized.current = true;
        setIsConnected(true);
        setConnectionStatus('connected');
        
        console.log('✅ Matrix initialized successfully');

      } catch (error) {
        console.error('❌ Matrix initialization failed:', error);
        setError(error.message);
        setConnectionStatus('error');
        toast.error('Failed to connect to chat');
      } finally {
        setIsJoining(false);
      }
    };

    initialize();

    // ✅ Cleanup only on unmount
    return () => {
      console.log('🧹 Unmounting - cleaning up chat');
      chatSocketService.disconnect();
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
      isInitialized.current = false;
      isMatrixInitialized.current = false;
    };
  }, []); // ✅ Empty deps - only run on mount/unmount

  /**
   * Setup WebSocket callbacks
   */
  const setupSocketCallbacks = useCallback(() => {
    // On new message received
    chatSocketService.onMessage((message) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });

      // Show notification
      if (message.senderId !== userCredentials?.userId) {
        toast(`${message.sender}: ${message.content.substring(0, 50)}`, {
          icon: '💬',
          duration: 2000
        });
      }
    });

    // On user typing
    chatSocketService.onTyping(({ userId, userName, isTyping }) => {
      if (userId === userCredentials?.userId) return;

      setTypingUsers(prev => {
        const timeout = typingTimeouts.current.get(userId);
        if (timeout) clearTimeout(timeout);

        if (isTyping) {
          if (!prev.includes(userName)) {
            const newTimeout = setTimeout(() => {
              setTypingUsers(current => current.filter(u => u !== userName));
              typingTimeouts.current.delete(userId);
            }, 3000);

            typingTimeouts.current.set(userId, newTimeout);
            return [...prev, userName];
          }
          return prev;
        } else {
          return prev.filter(u => u !== userName);
        }
      });
    });

    // On user joined
    chatSocketService.onUserJoined(({ userName }) => {
      toast(`${userName} joined`, {
        icon: '👋',
        duration: 2000
      });
    });

    // On user left
    chatSocketService.onUserLeft(({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });

  }, [userCredentials]);

  /**
   * Join room and setup WebSocket - STABLE
   */
  useEffect(() => {
    // ✅ Wait for Matrix to be initialized first
    if (!isConnected || !roomId) {
      return;
    }

    // ✅ Prevent multiple joins
    if (isInitialized.current) {
      console.log('⏩ Already joined room, skipping');
      return;
    }

    const joinRoomAndConnect = async () => {
      try {
        setIsJoining(true);
        console.log('🔄 Joining room:', roomId);
        console.log('👤 User credentials:', userCredentials);

        // 1. Join Matrix room (get history only)
        const joinResult = await matrixService.joinRoom(roomId, userCredentials);
        
        if (!joinResult.success) {
          throw new Error(joinResult.error);
        }

        // Set initial history messages
        setMessages(joinResult.messages || []);
        setRoomInfo({
          roomId: joinResult.roomId,
          roomName: joinResult.roomName,
          memberCount: joinResult.memberCount
        });

        console.log('✅ Fetched', joinResult.messages?.length || 0, 'history messages from Matrix');

        // 2. Connect to WebSocket for real-time messages
        // ✅ FIXED: Get actual user name from auth token
        const userInfo = getUserInfoFromCookies();
        
        const userName = userInfo?.fullName || 
                        userCredentials?.userName || 
                        userCredentials?.name || 
                        userCredentials?.fullName ||
                        'User';
        
        const userRole = userCredentials?.userId?.includes('@instructor_') ? 'instructor' : 'student';

        console.log('📝 Using userName:', userName, '| Role:', userRole);

        const socketResult = await chatSocketService.connect(
          roomId,
          userCredentials?.userId || `user_${Date.now()}`,
          userName,
          userRole
        );

        if (!socketResult.success) {
          throw new Error(socketResult.error);
        }

        // Setup WebSocket callbacks
        setupSocketCallbacks();

        // ✅ Mark as initialized
        isInitialized.current = true;
        console.log('✅ Real-time chat connected via WebSocket');
        toast.success('Connected to chat');

      } catch (error) {
        console.error('❌ Failed to join room:', error);
        setError(error.message);
        toast.error('Failed to join chat room');
      } finally {
        setIsJoining(false);
      }
    };

    joinRoomAndConnect();

  }, [isConnected, roomId, userCredentials, setupSocketCallbacks]); // ✅ Only re-run if these change

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (content, msgType = 'm.text') => {
    if (!content.trim() || !isConnected) return { success: false };

    try {
      // ✅ FIXED: Get actual user name from auth token
      const userInfo = getUserInfoFromCookies();
      
      const userName = userInfo?.fullName || 
                      userCredentials?.userName || 
                      userCredentials?.name || 
                      userCredentials?.fullName ||
                      'User';

      // Create message object
      const message = {
        id: `temp_${Date.now()}`,
        content: content.trim(),
        sender: userName, // ✅ Use actual name from auth token
        senderId: userCredentials?.userId || 'unknown',
        senderRole: userCredentials?.userId?.includes('@instructor_') ? 'instructor' : 'student',
        timestamp: new Date().toISOString(),
        type: 'user'
      };

      // ✅ CRITICAL FIX: Send to BOTH WebSocket AND Matrix
      console.log('📤 Sending message to WebSocket + Matrix...');

      // 1. Send via WebSocket (instant delivery to users in chat)
      const socketResult = chatSocketService.sendMessage(message);
      
      if (!socketResult.success) {
        console.warn('⚠️ WebSocket send failed, but will still save to Matrix');
      }

      // 2. ✅ ALWAYS save to Matrix (so it shows in Element app)
      const matrixResult = await matrixService.sendMessage(content.trim(), msgType);
      
      if (!matrixResult.success) {
        console.error('❌ Failed to save message to Matrix:', matrixResult.error);
        throw new Error('Failed to save message to Matrix: ' + matrixResult.error);
      }

      console.log('✅ Message sent to WebSocket + Matrix successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
      return { success: false, error: error.message };
    }
  }, [isConnected, userCredentials]);

  /**
   * Send typing indicator
   */
  const sendTyping = useCallback(async (isTyping = true) => {
    if (!isConnected) return;

    try {
      chatSocketService.sendTyping(isTyping);
    } catch (error) {
      console.error('❌ Failed to send typing indicator:', error);
    }
  }, [isConnected]);

  /**
   * Leave room
   */
  const leaveRoom = useCallback(async () => {
    try {
      chatSocketService.disconnect();
      await matrixService.leaveRoom();
      
      setMessages([]);
      setRoomInfo(null);
      setTypingUsers([]);
      isInitialized.current = false;
      
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
      
      console.log('✅ Left room successfully');
    } catch (error) {
      console.error('❌ Failed to leave room:', error);
    }
  }, []);

  /**
   * Disconnect
   */
  const disconnect = useCallback(async () => {
    try {
      chatSocketService.disconnect();
      await matrixService.disconnect();
      
      setIsConnected(false);
      setMessages([]);
      setRoomInfo(null);
      setTypingUsers([]);
      setConnectionStatus('disconnected');
      setError(null);
      isInitialized.current = false;
      isMatrixInitialized.current = false;
      
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
      
      console.log('✅ Disconnected successfully');
    } catch (error) {
      console.error('❌ Failed to disconnect:', error);
    }
  }, []);

  /**
   * Helper functions
   */
  const getLastMessage = useCallback(() => {
    return messages[messages.length - 1] || null;
  }, [messages]);

  const getMessageCount = useCallback(() => {
    return messages.length;
  }, [messages]);

  return {
    // State
    messages,
    isConnected,
    isJoining,
    typingUsers,
    connectionStatus,
    roomInfo,
    error,
    
    // Actions
    sendMessage,
    sendTyping,
    leaveRoom,
    disconnect,
    
    // Helpers
    getLastMessage,
    getMessageCount,
    
    // Status checks
    canSendMessage: isConnected && roomInfo,
    isLoading: isJoining || connectionStatus === 'reconnecting'
  };
};