import express from 'express';
import filesRouter from '../routes/filesRoutes.js';
import * as filesController from '../controllers/filesController.js';

const router = express.Router();

router.use('/files', filesRouter);
// Storage meter endpoint
router.get('/storage', filesController.storage);

export default router;
