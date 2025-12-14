import { Router } from 'express';
import { authenticate, requireCompanyAccess, requireRole } from '../../middleware/auth';
import * as presenceController from './presence.controller';

const router = Router();

// Public reset by company slug (used by recognition service on старте)
router.post('/public/reset/:companySlug', presenceController.resetPresencePublicHandler);

router.use(authenticate);
router.use(requireCompanyAccess);

router.get('/', presenceController.getPresenceHandler);
router.post(
  '/reset',
  requireRole('SUPERADMIN', 'COMPANY_ADMIN'),
  presenceController.resetPresenceHandler
);

export default router;








