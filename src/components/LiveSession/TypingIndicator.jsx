// src/components/LiveSession/TypingIndicator.jsx
// Professional typing indicator for real-time chat

'use client';

import React from 'react';

const TypingIndicator = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    } else {
      return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="px-3 pb-2">
      <div className="d-flex align-items-center text-muted">
        <div className="typing-animation me-2">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <small className="fst-italic">{getTypingText()}</small>
      </div>
      
      <style jsx>{`
        .typing-animation {
          display: flex;
          gap: 2px;
        }
        
        .typing-animation span {
          height: 4px;
          width: 4px;
          background-color: #6c757d;
          border-radius: 50%;
          display: inline-block;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-animation span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-animation span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;