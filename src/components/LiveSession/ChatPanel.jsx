// src/components/LiveSession/ChatPanel.jsx
// Professional live chat with modern streaming platform design

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaPaperPlane, FaUsers, FaCircle, FaSmile, FaTimes } from 'react-icons/fa';
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        await sendTyping(false);
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

  const getConnectionStatus = () => {
    // Check if we have messages or are connected
    const isActuallyConnected = canSendMessage || messages.length > 0;
    
    if (isActuallyConnected || connectionStatus === 'PREPARED') {
      return { color: 'success', text: 'Connected', icon: true };
    } else if (connectionStatus === 'SYNCING' || isJoining) {
      return { color: 'warning', text: 'Connecting...', icon: false };
    } else {
      return { color: 'danger', text: 'Disconnected', icon: false };
    }
  };

  const status = getConnectionStatus();

  return (
    <div className={`d-flex flex-column h-100 rounded-3 overflow-hidden shadow-sm ${className}`} style={{ height }}>
      {/* Modern Header */}
      {showHeader && (
        <div className="border-bottom" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '12px 16px'
        }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center gap-2 text-white">
                <FaUsers size={16} />
                <span className="fw-semibold">Live Chat</span>
              </div>
              {roomInfo && (
                <Badge bg="light" text="dark" className="px-2 py-1">
                  {roomInfo.memberCount || 0}
                </Badge>
              )}
            </div>
            
            <div className="d-flex align-items-center gap-2">
              {status.icon && (
                <FaCircle 
                  size={8} 
                  className="text-success animate-pulse" 
                  style={{ filter: 'drop-shadow(0 0 3px rgba(72, 187, 120, 0.8))' }} 
                />
              )}
              <span className="text-white small">{status.text}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="m-2 mb-0 border-0 shadow-sm rounded-3">
          <div className="d-flex align-items-start">
            <small className="flex-grow-1">{error}</small>
            <Button variant="link" size="sm" className="p-0 text-danger">
              <FaTimes />
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading State */}
      {isJoining && (
        <div className="flex-grow-1 d-flex justify-content-center align-items-center bg-light">
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted mb-0">Joining chat room...</p>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      {!isJoining && (
        <>
          <div className="flex-grow-1 overflow-auto bg-light" style={{ 
            minHeight: 0,
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e0 transparent'
          }}>
            <div className="p-3">
              {messages.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <div className="rounded-circle bg-white shadow-sm mx-auto d-flex align-items-center justify-content-center" 
                      style={{ width: '60px', height: '60px' }}>
                      <FaUsers size={24} className="text-muted" />
                    </div>
                  </div>
                  <p className="text-muted mb-1 fw-semibold">No messages yet</p>
                  <small className="text-muted">Be the first to say hello! 👋</small>
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
              <div className="px-3 pb-2">
                <TypingIndicator typingUsers={typingUsers} />
              </div>
            )}
          </div>

          {/* Message Input Area */}
          <div className="border-top bg-white" style={{ padding: '12px' }}>
            <Form onSubmit={handleSendMessage}>
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mb-2 p-2 border rounded-3 bg-light shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted fw-semibold">Quick Reactions</small>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 text-muted"
                      onClick={() => setShowEmojiPicker(false)}
                    >
                      <FaTimes />
                    </Button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {['👋', '👍', '👎', '❤️', '😊', '😂', '🤔', '👏', '🎉', '🔥', '✨', '💯'].map(emoji => (
                      <Button
                        key={emoji}
                        variant="light"
                        size="sm"
                        className="border-0 hover-shadow"
                        onClick={() => insertEmoji(emoji)}
                        style={{ 
                          fontSize: '1.2rem',
                          width: '40px',
                          height: '40px',
                          padding: 0,
                          transition: 'all 0.2s'
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Row */}
              <div className="d-flex align-items-end gap-2">
                <div className="flex-grow-1">
                  <Form.Control
                    ref={inputRef}
                    as="textarea"
                    rows={1}
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={canSendMessage ? "Send a message..." : "Connecting..."}
                    disabled={!canSendMessage || isSending}
                    className="border-2 shadow-sm"
                    style={{ 
                      resize: 'none',
                      minHeight: '42px',
                      maxHeight: '120px',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                
                <Button
                  variant="light"
                  className="border-2 shadow-sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={!canSendMessage}
                  style={{ 
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    padding: 0
                  }}
                >
                  <FaSmile size={18} className={showEmojiPicker ? 'text-primary' : 'text-muted'} />
                </Button>
                
                <Button
                  type="submit"
                  disabled={!canSendMessage || !newMessage.trim() || isSending}
                  className="shadow-sm"
                  style={{ 
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    padding: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
                  {isSending ? (
                    <Spinner size="sm" />
                  ) : (
                    <FaPaperPlane size={16} />
                  )}
                </Button>
              </div>

              {/* Helper Text */}
              {canSendMessage && (
                <div className="mt-2">
                  <small className="text-muted">
                    Press <kbd className="bg-light border px-1 py-0 rounded">Enter</kbd> to send, <kbd className="bg-light border px-1 py-0 rounded">Shift + Enter</kbd> for new line
                  </small>
                </div>
              )}
            </Form>
          </div>
        </>
      )}

      <style jsx>{`
        .hover-shadow:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transform: translateY(-1px);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;