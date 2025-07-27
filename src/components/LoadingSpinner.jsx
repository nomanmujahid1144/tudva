'use client';

import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary', fullPage = false }) => {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  }[size] || '';

  const colorClass = `text-${color}`;

  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', width: '100%' }}>
        <div className={`spinner-border ${sizeClass} ${colorClass}`} role="status">
          <span className="visually-hidden">
            Loading...  
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center py-4">
      <div className={`spinner-border ${sizeClass} ${colorClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
