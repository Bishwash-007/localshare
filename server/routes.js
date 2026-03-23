import { Router } from 'express';
import { listFiles } from './controllers.js';

const router = Router();

router.get('/file', listFiles);
router.get('/list', (req, res) =>
	res.status(501).json({ message: 'Not yet implemented' }),
);

export default router;
