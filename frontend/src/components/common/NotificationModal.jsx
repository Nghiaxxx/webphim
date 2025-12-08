import React from 'react';

const NotificationModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  // Function to highlight numbers in the message
  const renderMessage = (text) => {
    if (!text) return null;
    
    // Split message by numbers and highlight them
    const parts = text.split(/(\d+)/);
    return parts.map((part, index) => {
      if (/^\d+$/.test(part)) {
        return (
          <span key={index} className="notification-modal-number">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="notification-modal-title">LƯU Ý !</h2>
        <p className="notification-modal-message">{renderMessage(message)}</p>
        <button className="notification-modal-button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;

