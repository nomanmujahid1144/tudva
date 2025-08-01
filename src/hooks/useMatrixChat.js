// src/hooks/useMatrixChat.js
// Real-time chat hook for Matrix integration

import { useState, useEffect, useCallback, useRef } from 'react';
import { matrixService } from '@/services/matrixService';
import { toast } from 'react-hot-toast';

export const useMatrixChat = (roomId, userCredentials) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [roomInfo, setRoomInfo] = useState(null);
  const [error, setError] = useState(null);
  
  // Refs for cleanup
  const messageUnsubscribe = useRef(null);
  const statusUnsubscribe = useRef(null);
  const typingUnsubscribe = useRef(null);
  const typingTimeout = useRef(null);

  /**
   * Initialize Matrix connection
   */
  const initializeMatrix = useCallback(async () => {
    if (!userCredentials?.userId || !userCredentials?.accessToken) {
      setError('Missing user credentials');
      return;
    }

    try {
      setIsJoining(true);
      setError(null);
      
      console.log('🔄 Initializing Matrix for user:', userCredentials.userId);
      
      // Initialize Matrix client
      const initResult = await matrixService.initialize(
        userCredentials.userId,
        userCredentials.accessToken
      );

      if (!initResult.success) {
        throw new Error(initResult.error);
      }

      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Set up event listeners
      setupEventListeners();
      
      console.log('✅ Matrix initialized successfully');

    } catch (error) {
      console.error('❌ Matrix initialization failed:', error);
      setError(error.message);
      setConnectionStatus('error');
      toast.error('Failed to connect to chat');
    } finally {
      setIsJoining(false);
    }
  }, [userCredentials]);

  /**
   * Join Matrix room
   */
  const joinRoom = useCallback(async () => {
    if (!roomId || !isConnected) return;

    try {
      setIsJoining(true);
      console.log('🔄 Joining room:', roomId);

      const joinResult = await matrixService.joinRoom(roomId);
      
      if (!joinResult.success) {
        throw new Error(joinResult.error);
      }

      // Set initial data
      setMessages(joinResult.messages || []);
      setRoomInfo({
        roomId: joinResult.roomId,
        roomName: joinResult.roomName,
        memberCount: joinResult.memberCount
      });

      console.log('✅ Successfully joined room with', joinResult.messages?.length || 0, 'messages');
      toast.success('Connected to chat');

    } catch (error) {
      console.error('❌ Failed to join room:', error);
      setError(error.message);
      toast.error('Failed to join chat room');
    } finally {
      setIsJoining(false);
    }
  }, [roomId, isConnected]);

  /**
   * Set up Matrix event listeners
   */
  const setupEventListeners = useCallback(() => {
    // Clean up existing listeners
    cleanupListeners();

    // Message listener
    messageUnsubscribe.current = matrixService.onMessage((message) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });

      // Show notification for new messages (except own messages)
      if (message.senderId !== userCredentials?.userId && message.type !== 'system') {
        toast(`${message.sender}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`, {
          icon: '💬',
          duration: 3000
        });
      }
    });

    // Status listener
    statusUnsubscribe.current = matrixService.onStatus((status) => {
      setConnectionStatus(status);
      
      if (status === 'PREPARED') {
        setIsConnected(true);
      } else if (status === 'ERROR') {
        setIsConnected(false);
        setError('Connection lost');
        toast.error('Chat connection lost');
      }
    });

    // Typing listener
    typingUnsubscribe.current = matrixService.onTyping((users) => {
      setTypingUsers(users);
    });

  }, [userCredentials?.userId]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (content, msgType = 'm.text') => {
    if (!content.trim() || !isConnected) return { success: false };

    try {
      const result = await matrixService.sendMessage(content.trim(), msgType);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true, eventId: result.eventId };

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
      return { success: false, error: error.message };
    }
  }, [isConnected]);

  /**
   * Send typing indicator
   */
  const sendTyping = useCallback(async (isTyping = true) => {
    if (!isConnected) return;

    try {
      await matrixService.sendTyping(isTyping, 10000);
      
      // Clear typing after 8 seconds
      if (isTyping) {
        if (typingTimeout.current) {
          clearTimeout(typingTimeout.current);
        }
        typingTimeout.current = setTimeout(() => {
          matrixService.sendTyping(false);
        }, 8000);
      }

    } catch (error) {
      console.error('❌ Failed to send typing indicator:', error);
    }
  }, [isConnected]);

  /**
   * Leave room
   */
  const leaveRoom = useCallback(async () => {
    try {
      await matrixService.leaveRoom();
      setMessages([]);
      setRoomInfo(null);
      setTypingUsers([]);
      console.log('✅ Left room successfully');
    } catch (error) {
      console.error('❌ Failed to leave room:', error);
    }
  }, []);

  /**
   * Disconnect from Matrix
   */
  const disconnect = useCallback(async () => {
    try {
      cleanupListeners();
      await matrixService.disconnect();
      
      setIsConnected(false);
      setMessages([]);
      setRoomInfo(null);
      setTypingUsers([]);
      setConnectionStatus('disconnected');
      setError(null);
      
      console.log('✅ Disconnected successfully');
    } catch (error) {
      console.error('❌ Failed to disconnect:', error);
    }
  }, []);

  /**
   * Clean up event listeners
   */
  const cleanupListeners = useCallback(() => {
    if (messageUnsubscribe.current) {
      messageUnsubscribe.current();
      messageUnsubscribe.current = null;
    }
    if (statusUnsubscribe.current) {
      statusUnsubscribe.current();
      statusUnsubscribe.current = null;
    }
    if (typingUnsubscribe.current) {
      typingUnsubscribe.current();
      typingUnsubscribe.current = null;
    }
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
  }, []);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    if (userCredentials?.userId && userCredentials?.accessToken) {
      initializeMatrix();
    }

    return () => {
      cleanupListeners();
    };
  }, [initializeMatrix]);

  /**
   * Join room when connected and roomId available
   */
  useEffect(() => {
    if (isConnected && roomId && !roomInfo) {
      joinRoom();
    }
  }, [isConnected, roomId, roomInfo, joinRoom]);

  /**
   * Helper functions
   */
  const getLastMessage = useCallback(() => {
    return messages[messages.length - 1] || null;
  }, [messages]);

  const getMessageCount = useCallback(() => {
    return messages.length;
  }, [messages]);

  const getUnreadCount = useCallback(() => {
    // This could be enhanced with read receipts
    return 0;
  }, []);

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
    getUnreadCount,
    
    // Status checks
    canSendMessage: isConnected && roomInfo,
    isLoading: isJoining || connectionStatus === 'reconnecting'
  };
};