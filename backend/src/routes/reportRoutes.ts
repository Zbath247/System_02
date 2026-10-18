import { Router } from 'express';
import { getAttendanceReport, exportAttendanceCsv } from '../controllers/reportController';
import { requireAuth, requireRoles } from '../middlewares/authMiddleware';

const router = Router();

// Reports are accessible to ADMIN, SUPER_ADMIN, and TEACHER
router.use(requireAuth, requireRoles(['ADMIN', 'SUPER_ADMIN', 'TEACHER']));

router.get('/attendance', getAttendanceReport);
router.get('/attendance/export', exportAttendanceCsv);

export default router;
