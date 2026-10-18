import { Router } from 'express';
import { getActiveLocations } from '../controllers/locationController';

const router = Router();

router.get('/active', getActiveLocations);

export default router;
