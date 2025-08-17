import React, { useEffect, useState, useRef } from 'react';

const Modal = ({ file, files, onClose, onNext, onPrev }) => {
  const [zoom, setZoom] = useState(1);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    setZoom(1);
    setDragPosition({ x: 0, y: 0 });
  }, [file]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setDragPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (file.type === 'image' && zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - dragPosition.x,
        y: e.clientY - dragPosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && file.type === 'image' && zoom > 1) {
      setDragPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        onPrev();
      } else {
        onNext();
      }
    }
  };

  const handleImageClick = (e) => {
    if (file.type === 'image') {
      e.stopPropagation();
      if (zoom === 1) {
        handleZoomIn();
      }
    }
  };

  const getCurrentFileIndex = () => {
    return files.findIndex(f => f.path === file.path) + 1;
  };

  const renderMedia = () => {
    const mediaUrl = `/api/media/${file.path}`;

    switch (file.type) {
      case 'image':
        return (
          <div 
            className="image-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: zoom > 1 ? 'grab' : 'zoom-in' }}
          >
            <img 
              ref={imageRef}
              src={mediaUrl}
              alt={file.name}
              className="modal-image"
              onClick={handleImageClick}
              style={{
                transform: `scale(${zoom}) translate(${dragPosition.x / zoom}px, ${dragPosition.y / zoom}px)`,
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
              }}
              draggable={false}
            />
          </div>
        );
      
      case 'video':
        return (
          <div 
            className="video-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <video 
              src={mediaUrl}
              controls
              autoPlay
              className="modal-video"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div 
            className="audio-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
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
      <div className="modal-content-large">
        <div className="modal-header">
          <div className="modal-title-section">
            <h3 className="modal-title">{file.name}</h3>
            <span className="file-counter">
              {getCurrentFileIndex()} of {files.length}
            </span>
          </div>
          <div className="modal-controls">
            {file.type === 'image' && (
              <div className="zoom-controls">
                <button className="control-button" onClick={handleZoomOut} disabled={zoom <= 0.25}>
                  🔍−
                </button>
                <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                <button className="control-button" onClick={handleZoomIn} disabled={zoom >= 5}>
                  🔍+
                </button>
                <button className="control-button reset-button" onClick={handleResetZoom}>
                  ⟲
                </button>
              </div>
            )}
            <button className="control-button nav-button" onClick={onPrev} disabled={files.length <= 1}>
              ←
            </button>
            <button className="control-button nav-button" onClick={onNext} disabled={files.length <= 1}>
              →
            </button>
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
        <div className="modal-body-large">
          {renderMedia()}
        </div>
        <div className="modal-footer">
          <div className="file-details">
            <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
            <span>Type: {file.type.toUpperCase()}</span>
            {file.type === 'image' && (
              <span>Click image to zoom • Drag to pan when zoomed</span>
            )}
            <span>Swipe or use arrow keys to navigate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;