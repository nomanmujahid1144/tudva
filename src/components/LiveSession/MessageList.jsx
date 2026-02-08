// src/components/LiveSession/MessageList.jsx
// UPDATED: Instructor messages LEFT, Student messages RIGHT, professional chat design

'use client';

import React from 'react';
import { Badge } from 'react-bootstrap';

const MessageList = ({ messages, currentUserId, onMessageClick }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isCurrentUser = (senderId) => {
    if (!currentUserId || !senderId) return false;
    const extractedId = senderId.replace(/@(instructor|student)_/, '').split(':')[0];
    const currentId = currentUserId.replace(/@(instructor|student)_/, '').split(':')[0];
    return extractedId === currentId;
  };

  return (
    <div className="d-flex flex-column gap-3">
      {messages.map((message) => {
        const isOwn = isCurrentUser(message.senderId);
        const isInstructor = message.senderRole === 'instructor';
        
        // ✅ ALIGNMENT LOGIC:
        // Instructor messages: ALWAYS LEFT
        // Student messages: ALWAYS RIGHT
        const alignRight = !isInstructor; // Students always on right

        return (
          <div
            key={message.id}
            className={`d-flex ${alignRight ? 'justify-content-end' : 'justify-content-start'}`}
            onClick={() => onMessageClick?.(message)}
          >
            <div
              className="message-bubble"
              style={{
                maxWidth: '75%',
                minWidth: '120px'
              }}
            >
              {/* Sender Info - Show on top for non-own messages */}
              {!isOwn && (
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span 
                    className="fw-semibold small"
                    style={{ 
                      color: isInstructor ? '#667eea' : '#4299e1',
                      fontSize: '0.85rem'
                    }}
                  >
                    {message.sender}
                  </span>
                  <Badge 
                    bg={isInstructor ? 'primary' : 'info'}
                    className="px-2 py-0"
                    style={{ 
                      fontSize: '0.65rem',
                      background: isInstructor ? '#667eea' : '#4299e1'
                    }}
                  >
                    {isInstructor ? 'Instructor' : 'Student'}
                  </Badge>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className="rounded-3 px-3 py-2 shadow-sm position-relative"
                style={{
                  backgroundColor: isInstructor 
                    ? (isOwn ? '#667eea' : '#f0f4ff')  // Instructor: purple or light purple
                    : (isOwn ? '#4299e1' : '#e6f7ff'), // Student: blue or light blue
                  color: isOwn ? '#ffffff' : (isInstructor ? '#5a67d8' : '#2c5aa0'),
                  wordBreak: 'break-word',
                  borderBottomLeftRadius: isInstructor && !isOwn ? '4px' : '12px',
                  borderBottomRightRadius: !isInstructor && !isOwn ? '4px' : '12px',
                }}
              >
                {/* Message Content */}
                <div 
                  className="message-content"
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                  }}
                >
                  {message.content}
                </div>

                {/* Timestamp */}
                <div 
                  className="mt-1"
                  style={{
                    fontSize: '0.7rem',
                    opacity: 0.75,
                    color: isOwn ? '#ffffff' : (isInstructor ? '#667eea' : '#4299e1'),
                    textAlign: alignRight ? 'right' : 'left'
                  }}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {/* Own Message Badge - Show below bubble */}
              {isOwn && (
                <div className={`d-flex ${alignRight ? 'justify-content-end' : 'justify-content-start'} mt-1`}>
                  <Badge 
                    bg={isInstructor ? 'primary' : 'info'}
                    className="px-2 py-0"
                    style={{ 
                      fontSize: '0.65rem',
                      background: isInstructor ? '#667eea' : '#4299e1',
                      opacity: 0.8
                    }}
                  >
                    You
                  </Badge>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;