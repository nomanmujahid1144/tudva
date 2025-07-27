'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';

const SlidePanel = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  position = 'right'
}) => {
  const panelRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle animation when opening/closing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Add a small delay before starting the animation
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Restore body scrolling
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Size classes
  const sizeClasses = {
    sm: 'w-300px',
    md: 'w-25',
    lg: 'w-500px',
    xl: 'w-600px',
  };

  // Position classes
  const positionClasses = {
    right: 'end-0',
    left: 'start-0',
  };

  // Panel content
  const panelContent = (
    <div 
      className="position-fixed top-0 bottom-0 start-0 end-0 bg-dark bg-opacity-50" 
      style={{ 
        zIndex: 1050,
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      <div 
        ref={panelRef}
        className={`position-fixed top-0 bottom-0 ${positionClasses[position]} bg-white shadow h-100 ${sizeClasses[size]}`}
        style={{ 
          transform: isAnimating ? 'translateX(0)' : position === 'right' ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1051,
          overflowY: 'auto'
        }}
      >
        <div className="d-flex flex-column h-100">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between bg-light p-3 border-bottom">
            <h5 className="mb-0">{title}</h5>
            <Button 
              variant="link" 
              className="p-0 text-dark" 
              onClick={onClose}
              aria-label="Close"
            >
              <FaTimes />
            </Button>
          </div>
          
          {/* Body */}
          <div className="flex-grow-1 p-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Don't render anything if not visible or not mounted
  if (!isVisible || !mounted) return null;

  // Use createPortal to render outside the parent component
  return createPortal(
    panelContent,
    document.body
  );
};

export default SlidePanel;