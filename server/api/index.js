import express from 'express';
import filesRouter from '../routes/filesRoutes.js';

const router = express.Router();

router.use('/files', filesRouter);

export default router;
