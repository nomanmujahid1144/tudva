// src/components/LoadingSpinner.jsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  fullPage = false,
  text = null,
  className = ''
}) => {
  const t = useTranslations('instructor.profile');
  
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  const sizeClass = sizeClasses[size] || '';
  const colorClass = `text-${color}`;
  const loadingText = text || t('loading');

  if (fullPage) {
    return (
      <div 
        className="d-flex flex-column justify-content-center align-items-center gap-3" 
        style={{ height: '100vh', width: '100%' }}
      >
        <div className={`spinner-border ${sizeClass} ${colorClass}`} role="status">
          <span className="visually-hidden">{loadingText}</span>
        </div>
        <p className={`mb-0 ${colorClass} fw-medium`}>{loadingText}</p>
      </div>
    );
  }

  return (
    <div className={`d-flex flex-column justify-content-center align-items-center py-4 gap-2 ${className}`}>
      <div className={`spinner-border ${sizeClass} ${colorClass}`} role="status">
        <span className="visually-hidden">{loadingText}</span>
      </div>
      {text && <p className={`mb-0 ${colorClass} small`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;