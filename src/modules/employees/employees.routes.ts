import { Router } from 'express';
import multer from 'multer';
import { authenticate, authenticateOptional, requireCompanyAccess } from '../../middleware/auth';
import * as employeesController from './employees.controller';

const router = Router();

// Multer setup for photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Use JPEG, PNG or WebP'));
    }
  },
});

router.get('/', authenticateOptional, employeesController.listEmployeesHandler);

// Protected routes
router.use(authenticate);
router.use(requireCompanyAccess);

router.get('/:id', employeesController.getEmployeeByIdHandler);
router.post('/', upload.single('photo'), employeesController.createEmployeeHandler);
router.put('/:id', upload.single('photo'), employeesController.updateEmployeeHandler);
router.delete('/:id', employeesController.deleteEmployeeHandler);

export default router;


