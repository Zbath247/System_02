import { Router } from 'express';
import { checkIn, checkOut, getMeStatus, getMyHistory } from '../controllers/attendanceController';
import { requireAuth, requireActiveAccount } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/me', getMeStatus);
router.get('/me/history', getMyHistory);

router.post('/check-in', requireActiveAccount, checkIn);
router.post('/check-out', requireActiveAccount, checkOut);

export default router;
