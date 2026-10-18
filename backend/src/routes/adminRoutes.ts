import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  revokeUserSessions,
  getAllLocations,
  createLocation,
  updateLocation,
  getAuditLogs,
  getSystemSettings,
  updateSystemSetting,
} from '../controllers/adminController';
import { requireAuth, requireRoles } from '../middlewares/authMiddleware';

const router = Router();

// Protect all admin endpoints: user must be authenticated with ADMIN or SUPER_ADMIN role
router.use(requireAuth, requireRoles(['ADMIN', 'SUPER_ADMIN']));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.post('/users/:id/revoke-sessions', revokeUserSessions);

router.get('/locations', getAllLocations);
router.post('/locations', createLocation);
router.patch('/locations/:id', updateLocation);

router.get('/audit-logs', getAuditLogs);
router.get('/settings', getSystemSettings);
router.patch('/settings/:key', updateSystemSetting);

export default router;
