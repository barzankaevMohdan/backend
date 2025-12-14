import { Router } from 'express';
import { authenticate, requireCompanyAccess, requireRole } from '../../middleware/auth';
import * as camerasController from './cameras.controller';

const router = Router();

// Public endpoint for recognition service (no auth)
router.get('/public/:companySlug/cameras', camerasController.getCompanyCamerasPublicHandler);

router.use(authenticate);
router.use(requireCompanyAccess);

router.get('/', camerasController.getAllCamerasHandler);
router.get('/:id', camerasController.getCameraByIdHandler);
router.get('/:id/stream-url', camerasController.getStreamUrlHandler);
router.get(
  '/:id/rtsp-preview',
  requireRole('SUPERADMIN', 'COMPANY_ADMIN'),
  camerasController.getRtspPreviewHandler
);
router.post('/', camerasController.createCameraHandler);
router.put('/:id', camerasController.updateCameraHandler);
router.delete('/:id', camerasController.deleteCameraHandler);

export default router;





