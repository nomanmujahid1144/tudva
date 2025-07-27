import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, slotTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  
  useEffect(() => {
    // Calculate initial time left
    const calculateTimeLeft = () => {
      try {
        // Parse the slot time
        const [startTime] = slotTime.split(' - ');
        const [slotHours, slotMinutes] = startTime.split(':').map(num => parseInt(num, 10));
        
        // Create date object for the course start time
        const courseDate = new Date(targetDate);
        courseDate.setHours(slotHours, slotMinutes, 0, 0);
        
        // Get current time
        const now = new Date();
        
        // Calculate difference in milliseconds
        const difference = courseDate - now;
        
        // If time has passed or is now, call onComplete callback
        if (difference <= 0) {
          onComplete && onComplete();
          return null;
        }
        
        // Calculate remaining time values
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const remainingHours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const remainingMinutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        return { 
          days, 
          hours: remainingHours, 
          minutes: remainingMinutes, 
          seconds, 
          total: difference 
        };
      } catch (error) {
        console.error('Error calculating time left:', error);
        return null;
      }
    };
    
    // Set initial time left
    setTimeLeft(calculateTimeLeft());
    
    // Update time left every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Clear interval when countdown finishes
      if (!newTimeLeft) {
        clearInterval(timer);
      }
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [targetDate, slotTime, onComplete]);
  
  // Format display time - ALWAYS showing seconds for real-time effect
  const formatTimeLeft = () => {
    if (!timeLeft) return "Ready";
    
    const { days, hours, minutes, seconds } = timeLeft;
    
    // Always include seconds in the display for real-time effect
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };
  
  return (
    <div className="d-inline-block text-primary">
      <small>Starts in: {formatTimeLeft()}</small>
    </div>
  );
};

export default CountdownTimer;