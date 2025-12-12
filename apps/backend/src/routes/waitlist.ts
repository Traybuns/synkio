import { Router } from 'express';
import { WaitlistController } from '../controllers/WaitlistController';

const router = Router();

router.post('/', WaitlistController.signup);
router.get('/', WaitlistController.getAll);

export default router;
