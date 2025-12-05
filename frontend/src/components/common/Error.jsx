import React from 'react';

/**
 * Reusable Error component
 */
const Error = ({ 
  message = 'Có lỗi xảy ra', 
  onRetry = null,
  className = '' 
}) => {
  return (
    <div 
      className={`error-container ${className}`}
      style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: '#ef4444',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px'
      }}
    >
      <div style={{ fontSize: '18px', fontWeight: '500' }}>
        {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Thử lại
        </button>
      )}
    </div>
  );
};

export default Error;

