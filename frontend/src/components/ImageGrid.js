import React from 'react';

const ImageGrid = ({ files, onFileSelect }) => {
  if (!files || files.length === 0) {
    return <div className="no-files">No supported files found in this folder</div>;
  }

  const getFileIcon = (file) => {
    switch (file.type) {
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '🖼️';
    }
  };

  const getThumbnail = (file) => {
    if (file.type === 'image' || file.type === 'video') {
      return `/api/media/${file.path}`;
    }
    return null;
  };

  return (
    <div className="image-grid">
      {files.map((file, index) => (
        <div 
          key={index} 
          className="grid-item"
          onClick={() => onFileSelect(file)}
        >
          <div className="thumbnail-container">
            {file.type === 'image' || file.type === 'video' ? (
              <img 
                src={getThumbnail(file)}
                alt={file.name}
                className="thumbnail"
                loading="lazy"
              />
            ) : (
              <div className="file-icon">
                {getFileIcon(file)}
                <div className="file-type">{file.type.toUpperCase()}</div>
              </div>
            )}
            {file.type === 'video' && (
              <div className="play-overlay">▶</div>
            )}
          </div>
          <div className="file-info">
            <div className="file-name" title={file.name}>
              {file.name}
            </div>
            <div className="file-size">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;