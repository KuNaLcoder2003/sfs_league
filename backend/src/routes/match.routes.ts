import { Router } from 'express';
import {
    getMatches,
    getMatchById,
    createMatch,
    getLiveScore,
    endMatch,
} from '../controllers/match.controller.js';

const router = Router();
router.get('/', getMatches);
router.post('/', createMatch);
router.get('/:id', getMatchById);
router.get('/:id/live', getLiveScore);
router.put('/:id/end', endMatch);
export default router;