import { Router } from 'express';
import { recordBall, startOver } from '../controllers/ball.controller.js';

const router = Router();
router.post('/', recordBall);
router.post('/over', startOver);
export default router;