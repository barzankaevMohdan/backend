import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../types';
import * as employeesService from './employees.service';
import * as companiesService from '../companies/companies.service';
import { logger } from '../../logger';
import { config } from '../../config';

const createEmployeeSchema = z.object({
  name: z.string().min(1).max(255),
  roleTitle: z.string().max(255).optional(),
});

const updateEmployeeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  roleTitle: z.string().max(255).optional(),
});

export async function listEmployeesHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const companyId = await resolveCompanyId(req);

    if (!companyId) {
      res.status(404).json({ error: 'Company context not found' });
      return;
    }

    const employees = await employeesService.getAllEmployees(companyId);
    res.json(employees.map(employeesService.toEmployeePublic));
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeByIdHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const companyId = req.user!.companyId!;
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }
    
    const employee = await employeesService.getEmployeeById(id, companyId);
    
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    
    res.json(employeesService.toEmployeePublic(employee));
  } catch (error) {
    next(error);
  }
}

export async function createEmployeeHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createEmployeeSchema.parse(req.body);
    const companyId = req.user!.companyId!;
    
    const input: employeesService.CreateEmployeeInput = {
      companyId,
      name: body.name,
      roleTitle: body.roleTitle,
    };
    
    // Handle photo upload
    if (req.file) {
      input.photoBuffer = req.file.buffer;
      input.photoMimetype = req.file.mimetype;
    }
    
    const employee = await employeesService.createEmployee(input);
    
    logger.info(`Employee created: ${employee.id} - ${employee.name}`);
    
    res.status(201).json(employeesService.toEmployeePublic(employee));
  } catch (error) {
    next(error);
  }
}

export async function updateEmployeeHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const companyId = req.user!.companyId!;
    const body = updateEmployeeSchema.parse(req.body);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }
    
    const input: employeesService.UpdateEmployeeInput = {
      name: body.name,
      roleTitle: body.roleTitle,
    };
    
    if (req.file) {
      input.photoBuffer = req.file.buffer;
      input.photoMimetype = req.file.mimetype;
    }
    
    const employee = await employeesService.updateEmployee(id, companyId, input);
    
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    
    logger.info(`Employee updated: ${employee.id} - ${employee.name}`);
    
    res.json(employeesService.toEmployeePublic(employee));
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployeeHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const companyId = req.user!.companyId!;
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }
    
    const deleted = await employeesService.deleteEmployee(id, companyId);
    
    if (!deleted) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    
    logger.info(`Employee deleted: ${id}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function resolveCompanyId(req: AuthRequest): Promise<number | null> {
  const queryCompanyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : undefined;
  const queryCompanySlug = (req.query.companySlug as string | undefined) || undefined;

  if (req.user) {
    if (req.user.role === 'SUPERADMIN') {
      if (queryCompanyId) {
        const company = await companiesService.getCompanyById(queryCompanyId);
        return company?.id ?? null;
      }
      if (queryCompanySlug) {
        const company = await companiesService.getCompanyBySlug(queryCompanySlug);
        return company?.id ?? null;
      }
      return null;
    }
    return req.user.companyId ?? null;
  }

  if (queryCompanyId) {
    const company = await companiesService.getCompanyById(queryCompanyId);
    if (company?.isActive) {
      return company.id;
    }
  }

  const slug = queryCompanySlug || config.publicEmployeesCompanySlug || undefined;
  if (slug) {
    const company = await companiesService.getCompanyBySlug(slug);
    if (company?.isActive) {
      return company.id;
    }
  }

  const fallback = await companiesService.getFirstActiveCompany();
  return fallback?.id ?? null;
}





