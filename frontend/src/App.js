import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FolderTree from './components/FolderTree';
import ImageGrid from './components/ImageGrid';
import Modal from './components/Modal';
import './App.css';

function App() {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/folders');
      setFolders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load folders');
      console.error('Error fetching folders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (folderPath) => {
    try {
      const response = await axios.get(`/api/files/${folderPath}`);
      setFiles(response.data);
      setSelectedFolder(folderPath);
      setError(null);
    } catch (err) {
      setError('Failed to load files');
      console.error('Error fetching files:', err);
    }
  };

  const handleFolderSelect = (folderPath) => {
    fetchFiles(folderPath);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const closeModal = () => {
    setSelectedFile(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <div className="sidebar">
        <h2>Folders</h2>
        {error && <div className="error">{error}</div>}
        <FolderTree 
          folders={folders} 
          onFolderSelect={handleFolderSelect}
          selectedFolder={selectedFolder}
        />
      </div>
      <div className="main-content">
        <h2>{selectedFolder ? `Images in ${selectedFolder}` : 'Select a folder'}</h2>
        <ImageGrid 
          files={files} 
          onFileSelect={handleFileSelect}
        />
      </div>
      {selectedFile && (
        <Modal 
          file={selectedFile} 
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default App;