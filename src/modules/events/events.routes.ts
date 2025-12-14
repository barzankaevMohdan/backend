import { Router } from 'express';
import { authenticate, requireCompanyAccess } from '../../middleware/auth';
import * as eventsController from './events.controller';

const router = Router();

// POST /api/events - for Python recognition service (no auth required)
router.post('/', eventsController.createEventHandler);

// GET /api/events - requires auth
router.get('/', authenticate, requireCompanyAccess, eventsController.getEventsHandler);

export default router;








