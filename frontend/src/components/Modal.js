import React, { useEffect } from 'react';

const Modal = ({ file, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderMedia = () => {
    const mediaUrl = `/api/media/${file.path}`;

    switch (file.type) {
      case 'image':
        return (
          <img 
            src={mediaUrl}
            alt={file.name}
            className="modal-image"
          />
        );
      
      case 'video':
        return (
          <video 
            src={mediaUrl}
            controls
            autoPlay
            className="modal-video"
          >
            Your browser does not support the video tag.
          </video>
        );
      
      case 'audio':
        return (
          <div className="audio-container">
            <div className="audio-icon">🎵</div>
            <audio 
              src={mediaUrl}
              controls
              autoPlay
              className="modal-audio"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      default:
        return <div className="unsupported-file">Unsupported file type</div>;
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{file.name}</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {renderMedia()}
        </div>
        <div className="modal-footer">
          <div className="file-details">
            <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
            <span>Type: {file.type.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;