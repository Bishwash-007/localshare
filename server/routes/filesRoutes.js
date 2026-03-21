import express from 'express';
import * as filesController from '../controllers/filesController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: '/tmp' });

// List directory contents
router.get('/', filesController.listDirectory);

// Create file/folder
router.post('/create', express.json(), filesController.create);

// Delete file/folder
router.delete('/delete', express.json(), filesController.remove);

// Rename file/folder
router.post('/rename', express.json(), filesController.rename);

// Download file
router.get('/download', filesController.download);

// Upload file
router.post('/upload', upload.single('file'), filesController.upload);

// Search
router.get('/search', filesController.search);

// Move file/folder
router.post('/move', express.json(), filesController.move);

// Copy file/folder
router.post('/copy', express.json(), filesController.copy);

export default router;
