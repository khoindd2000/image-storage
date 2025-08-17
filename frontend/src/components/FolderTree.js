import React, { useState } from 'react';

const FolderItem = ({ folder, onFolderSelect, selectedFolder, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = folder.children && folder.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    onFolderSelect(folder.path);
  };

  return (
    <div className="folder-item">
      <div 
        className={`folder-header ${selectedFolder === folder.path ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 20}px` }}
      >
        {hasChildren && (
          <span 
            className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
            onClick={handleToggle}
          >
            ▶
          </span>
        )}
        <span className="folder-name" onClick={handleSelect}>
          📁 {folder.name}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div className="folder-children">
          {folder.children.map((child, index) => (
            <FolderItem
              key={index}
              folder={child}
              onFolderSelect={onFolderSelect}
              selectedFolder={selectedFolder}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTree = ({ folders, onFolderSelect, selectedFolder }) => {
  if (!folders || folders.length === 0) {
    return <div className="no-folders">No folders found</div>;
  }

  return (
    <div className="folder-tree">
      {folders.map((folder, index) => (
        <FolderItem
          key={index}
          folder={folder}
          onFolderSelect={onFolderSelect}
          selectedFolder={selectedFolder}
        />
      ))}
    </div>
  );
};

export default FolderTree;