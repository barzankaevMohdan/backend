import { Router } from 'express';
import { authenticate, requireCompanyAccess } from '../../middleware/auth';
import * as statisticsController from './statistics.controller';

const router = Router();

router.use(authenticate);
router.use(requireCompanyAccess);

router.get('/', statisticsController.getStatisticsHandler);

export default router;








