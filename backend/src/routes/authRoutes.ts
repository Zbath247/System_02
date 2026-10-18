import { Router } from 'express';
import { register, identify, adminLogin, getSession, logout } from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', register);
router.post('/identify', authLimiter, identify);
router.post('/admin/login', authLimiter, adminLogin);
router.get('/session', getSession);
router.post('/logout', logout);

export default router;
