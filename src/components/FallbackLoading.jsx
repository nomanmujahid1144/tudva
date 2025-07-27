'use client';

import React from 'react';
import Image from 'next/image';

const FallbackLoading = ({ message = 'Loading...' }) => {
  return (
    <div className="fallback-loading">
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-primary">{message}</p>
      </div>

      <style jsx>{`
        .fallback-loading {
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

export default FallbackLoading;
