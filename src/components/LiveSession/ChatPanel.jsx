// src/components/LiveSession/ChatPanel.jsx
// Professional chat panel with real-time Matrix integration

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaPaperPlane, FaUsers, FaWifi, FaExclamationTriangle, FaSmile } from 'react-icons/fa';
import { useMatrixChat } from '@/hooks/useMatrixChat';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';

const ChatPanel = ({ 
  roomId, 
  userCredentials, 
  className = '',
  height = '500px',
  showHeader = true,
  allowFileUpload = false 
}) => {
  const {
    messages,
    isConnected,
    isJoining,
    typingUsers,
    connectionStatus,
    roomInfo,
    error,
    sendMessage,
    sendTyping,
    canSendMessage
  } = useMatrixChat(roomId, userCredentials);

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when connected
  useEffect(() => {
    if (canSendMessage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [canSendMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !canSendMessage || isSending) return;

    try {
      setIsSending(true);
      
      const result = await sendMessage(newMessage);
      
      if (result.success) {
        setNewMessage('');
        await sendTyping(false); // Stop typing indicator
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Send typing indicator
    if (value.trim() && canSendMessage) {
      await sendTyping(true);
    } else if (!value.trim()) {
      await sendTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'PREPARED':
        return <FaWifi className="text-success" />;
      case 'SYNCING':
        return <Spinner size="sm" />;
      case 'ERROR':
        return <FaExclamationTriangle className="text-danger" />;
      default:
        return <FaExclamationTriangle className="text-muted" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'PREPARED':
        return 'Connected';
      case 'SYNCING':
        return 'Connecting...';
      case 'ERROR':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  const getMemberCountText = () => {
    const count = roomInfo?.memberCount || 0;
    return count === 1 ? '1 member' : `${count} members`;
  };

  return (
    <Card className={`h-100 ${className}`} style={{ height }}>
      {/* Chat Header */}
      {showHeader && (
        <Card.Header className="d-flex justify-content-between align-items-center py-2">
          <div className="d-flex align-items-center">
            <h6 className="mb-0 me-2">Live Chat</h6>
            {roomInfo && (
              <Badge bg="secondary" className="me-2">
                <FaUsers className="me-1" />
                {getMemberCountText()}
              </Badge>
            )}
          </div>
          
          <div className="d-flex align-items-center text-sm">
            {getConnectionIcon()}
            <span className="ms-1 small">{getConnectionText()}</span>
          </div>
        </Card.Header>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="m-2 mb-0">
          <small>{error}</small>
        </Alert>
      )}

      {/* Loading State */}
      {isJoining && (
        <div className="d-flex justify-content-center align-items-center p-4">
          <Spinner className="me-2" />
          <span>Joining chat...</span>
        </div>
      )}

      {/* Chat Messages */}
      {!isJoining && (
        <Card.Body className="p-0 d-flex flex-column" style={{ height: 'calc(100% - 120px)' }}>
          <div className="flex-grow-1 overflow-auto p-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted py-4">
                <p className="mb-0">No messages yet</p>
                <small>Be the first to say hello! 👋</small>
              </div>
            ) : (
              <MessageList 
                messages={messages}
                currentUserId={userCredentials?.userId}
                onMessageClick={(message) => console.log('Message clicked:', message)}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <TypingIndicator typingUsers={typingUsers} />
          )}
        </Card.Body>
      )}

      {/* Message Input */}
      {!isJoining && (
        <Card.Footer className="p-2">
          <Form onSubmit={handleSendMessage}>
            <div className="d-flex align-items-end">
              <div className="flex-grow-1 me-2">
                <Form.Control
                  ref={inputRef}
                  as="textarea"
                  rows={1}
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={canSendMessage ? "Type your message..." : "Connecting to chat..."}
                  disabled={!canSendMessage || isSending}
                  style={{ 
                    resize: 'none',
                    minHeight: '38px',
                    maxHeight: '100px'
                  }}
                />
              </div>
              
              {/* Emoji Button */}
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-1"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={!canSendMessage}
              >
                <FaSmile />
              </Button>
              
              {/* Send Button */}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!canSendMessage || !newMessage.trim() || isSending}
              >
                {isSending ? (
                  <Spinner size="sm" />
                ) : (
                  <FaPaperPlane />
                )}
              </Button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="mt-2 p-2 border rounded bg-light">
                <div className="d-flex flex-wrap gap-1">
                  {['👋', '👍', '👎', '❤️', '😊', '😂', '🤔', '👏', '🎉', '🔥'].map(emoji => (
                    <Button
                      key={emoji}
                      variant="link"
                      size="sm"
                      className="p-1"
                      onClick={() => insertEmoji(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Form>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ChatPanel;