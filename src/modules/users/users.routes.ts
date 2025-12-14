import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import * as usersController from './users.controller';

const router = Router();

router.use(authenticate);
router.use(requireRole('SUPERADMIN', 'COMPANY_ADMIN'));

router.get('/', usersController.getAllUsersHandler);
router.get('/:id', usersController.getUserByIdHandler);
router.post('/', usersController.createUserHandler);
router.put('/:id', usersController.updateUserHandler);
router.delete('/:id', usersController.deleteUserHandler);

export default router;








