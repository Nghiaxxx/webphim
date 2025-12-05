import React from 'react';

const TrailerModal = ({ isOpen, onClose, movie, videoId }) => {
  if (!isOpen || !videoId) return null;

  return (
    <div className="trailer-modal-overlay" onClick={onClose}>
      <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="trailer-modal-header">
          <h3>{movie?.title}</h3>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        <div className="trailer-video-wrapper">
          <iframe
            title="Movie Trailer"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;

