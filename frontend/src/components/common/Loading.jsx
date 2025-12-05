import React from 'react';

/**
 * Reusable Loading component
 */
const Loading = ({ message = 'Đang tải...', className = '' }) => {
  return (
    <div 
      className={`loading-container ${className}`}
      style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: '#9ca3af' 
      }}
    >
      {message}
    </div>
  );
};

export default Loading;

