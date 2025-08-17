const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
const PORT = process.env.PORT || 5000;
const MEDIA_PATH = process.env.MEDIA_PATH || '/media';

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
}

const getSupportedFiles = (files) => {
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mp3', '.wav'];
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return supportedExtensions.includes(ext);
  });
};

const buildFolderTree = (dirPath, basePath = '') => {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const folders = [];
    
    for (const item of items) {
      if (item.isDirectory()) {
        const fullPath = path.join(dirPath, item.name);
        const relativePath = path.join(basePath, item.name);
        
        try {
          const children = buildFolderTree(fullPath, relativePath);
          folders.push({
            name: item.name,
            path: relativePath,
            children: children
          });
        } catch (error) {
          console.warn(`Cannot read directory ${fullPath}:`, error.message);
        }
      }
    }
    
    return folders;
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
    return [];
  }
};

app.get('/api/folders', (req, res) => {
  try {
    if (!fs.existsSync(MEDIA_PATH)) {
      return res.status(404).json({ error: 'Media directory not found' });
    }
    
    const tree = buildFolderTree(MEDIA_PATH);
    res.json(tree);
  } catch (error) {
    console.error('Error getting folder structure:', error);
    res.status(500).json({ error: 'Failed to read folder structure' });
  }
});

app.get('/api/files/:folderPath(*)', (req, res) => {
  try {
    const folderPath = req.params.folderPath || '';
    const fullPath = path.join(MEDIA_PATH, folderPath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    const files = items
      .filter(item => item.isFile())
      .map(item => item.name);
    
    const supportedFiles = getSupportedFiles(files);
    
    const fileDetails = supportedFiles.map(fileName => {
      const filePath = path.join(fullPath, fileName);
      const stats = fs.statSync(filePath);
      const ext = path.extname(fileName).toLowerCase();
      
      let type = 'image';
      if (['.mp4'].includes(ext)) type = 'video';
      if (['.mp3', '.wav'].includes(ext)) type = 'audio';
      
      return {
        name: fileName,
        path: path.join(folderPath, fileName),
        size: stats.size,
        type: type,
        mimeType: mime.lookup(fileName) || 'application/octet-stream'
      };
    });
    
    res.json(fileDetails);
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ error: 'Failed to read files' });
  }
});

app.get('/api/media/:filePath(*)', (req, res) => {
  try {
    const filePath = req.params.filePath;
    const fullPath = path.join(MEDIA_PATH, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Not a file' });
    }
    
    const mimeType = mime.lookup(fullPath) || 'application/octet-stream';
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    
    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', mediaPath: MEDIA_PATH });
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Media path: ${MEDIA_PATH}`);
});