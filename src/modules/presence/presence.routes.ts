import { Router } from 'express';
import { authenticate, requireCompanyAccess } from '../../middleware/auth';
import * as presenceController from './presence.controller';

const router = Router();

router.use(authenticate);
router.use(requireCompanyAccess);

router.get('/', presenceController.getPresenceHandler);

export default router;








