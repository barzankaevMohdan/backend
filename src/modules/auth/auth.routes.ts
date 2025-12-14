import { Router } from 'express';
import * as authController from './auth.controller';

const router = Router();

router.post('/login', authController.loginHandler);
router.post('/refresh', authController.refreshHandler);

export default router;








