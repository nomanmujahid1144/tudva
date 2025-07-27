'use client';

import React, { useEffect, useState } from 'react';

const RedirectLoading = ({ message = 'Redirecting...', destination = '', delay = 2000 }) => {
  const [countdown, setCountdown] = useState(Math.ceil(delay / 1000));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="redirect-loading">
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-primary">{message}</p>
        {destination && (
          <p className="text-muted small">
            Redirecting to {destination} in {countdown} seconds...
          </p>
        )}
      </div>

      <style jsx>{`
        .redirect-loading {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.9);
          z-index: 9999;
        }
        
        .loading-container {
          text-align: center;
          padding: 2rem;
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
      `}</style>
    </div>
  );
};

export default RedirectLoading;
