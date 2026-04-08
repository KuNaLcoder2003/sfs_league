import { Router } from 'express';
import {
    startInnings,
    getInningsById,
    completeInnings,
} from '../controllers/innings.controller.js';

const router = Router();
router.post('/', startInnings);
router.get('/:id', getInningsById);
router.put('/:id/complete', completeInnings);
export default router;