import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as metricsController from './metrics.controller';

const router = Router();

router.use(authenticate);
router.get('/', metricsController.getMetricsHandler);

export default router;




