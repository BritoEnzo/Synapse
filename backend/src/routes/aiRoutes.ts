import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const aiController = new AIController();

router.post('/analyze', authMiddleware, (req, res) => aiController.analyzeNote(req, res));

export default router;
