import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../types';
import * as usersService from './users.service';
import { UserRole } from '@prisma/client';
import { logger } from '../../logger';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPERADMIN', 'COMPANY_ADMIN', 'USER']),
  companyId: z.number().int().positive().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['SUPERADMIN', 'COMPANY_ADMIN', 'USER']).optional(),
});

export async function getAllUsersHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = req.user!.role === 'SUPERADMIN' ? null : req.user!.companyId!;
    
    const users = await usersService.getAllUsers(companyId);
    const publicUsers = users.map(usersService.toUserPublic);
    
    res.json(publicUsers);
  } catch (error) {
    next(error);
  }
}

export async function getUserByIdHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    
    const user = await usersService.getUserById(id);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Check access
    if (req.user!.role !== 'SUPERADMIN' && user.companyId !== req.user!.companyId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    res.json(usersService.toUserPublic(user));
  } catch (error) {
    next(error);
  }
}

export async function createUserHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createUserSchema.parse(req.body);
    
    // Validate permissions
    if (req.user!.role === 'COMPANY_ADMIN') {
      // Can only create USER role in own company
      if (body.role !== 'USER') {
        res.status(403).json({ error: 'Can only create USER role' });
        return;
      }
      if (body.companyId && body.companyId !== req.user!.companyId) {
        res.status(403).json({ error: 'Can only create users in own company' });
        return;
      }
      body.companyId = req.user!.companyId!;
    }
    
    const user = await usersService.createUser({
      email: body.email,
      password: body.password,
      role: body.role as UserRole,
      companyId: body.companyId,
    });
    
    logger.info(`User created: ${user.id} - ${user.email}`);
    
    res.status(201).json(usersService.toUserPublic(user));
  } catch (error) {
    next(error);
  }
}

export async function updateUserHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const body = updateUserSchema.parse(req.body);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    
    // Check access
    const existingUser = await usersService.getUserById(id);
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    if (req.user!.role !== 'SUPERADMIN' && existingUser.companyId !== req.user!.companyId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const user = await usersService.updateUser(id, body);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    logger.info(`User updated: ${user.id} - ${user.email}`);
    
    res.json(usersService.toUserPublic(user));
  } catch (error) {
    next(error);
  }
}

export async function deleteUserHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    
    // Check access
    const existingUser = await usersService.getUserById(id);
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    if (req.user!.role !== 'SUPERADMIN' && existingUser.companyId !== req.user!.companyId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const deleted = await usersService.deleteUser(id);
    
    if (!deleted) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    logger.info(`User deleted: ${id}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}








