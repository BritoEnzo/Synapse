import { Router } from 'express';
import { NoteController } from '../controllers/noteController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const noteController = new NoteController();

router.use(authMiddleware);

router.post('/', noteController.create);
router.get('/', noteController.list);
router.get('/:id', noteController.getById);
router.put('/:id', noteController.update);
router.delete('/:id', noteController.delete);
router.post('/:id/restore', noteController.restore);
router.post('/:id/pin', noteController.togglePin);
router.post('/:id/archive', noteController.toggleArchive);

export default router;