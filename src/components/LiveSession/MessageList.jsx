// src/components/LiveSession/MessageList.jsx
// Professional message list with different message types

'use client';

import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaUser, FaChalkboardTeacher, FaCog } from 'react-icons/fa';

const MessageList = ({ messages, currentUserId, onMessageClick }) => {
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserIcon = (type) => {
    switch (type) {
      case 'instructor':
        return <FaChalkboardTeacher className="text-primary" />;
      case 'student':
        return <FaUser className="text-success" />;
      case 'system':
        return <FaCog className="text-muted" />;
      default:
        return <FaUser className="text-secondary" />;
    }
  };

  const getUserBadgeVariant = (type) => {
    switch (type) {
      case 'instructor':
        return 'primary';
      case 'student':
        return 'success';
      case 'system':
        return 'secondary';
      default:
        return 'light';
    }
  };

  const isOwnMessage = (senderId) => {
    return senderId === currentUserId;
  };

  const renderMessage = (message, index) => {
    const isOwn = isOwnMessage(message.senderId);
    const isSystem = message.type === 'system';
    
    if (isSystem) {
      return (
        <div key={message.id} className="text-center mb-2">
          <small className="text-muted fst-italic">
            <FaCog className="me-1" />
            {message.content}
            <span className="ms-2 text-muted">{formatTime(message.timestamp)}</span>
          </small>
        </div>
      );
    }

    return (
      <div 
        key={message.id} 
        className={`mb-3 ${isOwn ? 'text-end' : 'text-start'}`}
        onClick={() => onMessageClick?.(message)}
        style={{ cursor: onMessageClick ? 'pointer' : 'default' }}
      >
        <div className={`d-inline-block ${isOwn ? 'ms-5' : 'me-5'}`} style={{ maxWidth: '80%' }}>
          {/* Message Header */}
          <div className={`d-flex align-items-center mb-1 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}>
            {!isOwn && (
              <>
                {getUserIcon(message.type)}
                <span className="fw-semibold ms-1 me-2">{message.sender}</span>
                <Badge bg={getUserBadgeVariant(message.type)} className="me-2">
                  {message.type === 'instructor' ? 'Instructor' : 'Student'}
                </Badge>
              </>
            )}
            <small className="text-muted">{formatTime(message.timestamp)}</small>
            {isOwn && (
              <>
                <Badge bg="info" className="ms-2">You</Badge>
                <span className="fw-semibold ms-2 me-1">{message.sender}</span>
                {getUserIcon(message.type)}
              </>
            )}
          </div>

          {/* Message Content */}
          <div 
            className={`p-2 rounded ${
              isOwn 
                ? 'bg-primary text-white' 
                : message.type === 'instructor' 
                  ? 'bg-light border border-primary' 
                  : 'bg-light'
            }`}
          >
            {message.formatted ? (
              <div dangerouslySetInnerHTML={{ __html: message.formatted }} />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {message.content}
              </div>
            )}
          </div>

          {/* Message Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="mt-1">
              {message.reactions.map((reaction, idx) => (
                <Badge 
                  key={idx} 
                  bg="light" 
                  text="dark" 
                  className="me-1"
                  style={{ cursor: 'pointer' }}
                >
                  {reaction.emoji} {reaction.count}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="message-list" style={{height: '5rem'}}>
      {messages.map((message, index) => renderMessage(message, index))}
    </div>
  );
};

export default MessageList;