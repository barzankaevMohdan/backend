import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import * as companiesController from './companies.controller';

const router = Router();

// All routes require SUPERADMIN role
router.use(authenticate);
router.use(requireRole('SUPERADMIN'));

router.get('/', companiesController.getAllCompaniesHandler);
router.get('/:id', companiesController.getCompanyByIdHandler);
router.post('/', companiesController.createCompanyHandler);
router.put('/:id', companiesController.updateCompanyHandler);
router.delete('/:id', companiesController.deleteCompanyHandler);

export default router;








