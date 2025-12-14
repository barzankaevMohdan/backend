import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../types';
import * as companiesService from './companies.service';
import { logger } from '../../logger';

const createCompanySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
});

const updateCompanySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
  isActive: z.boolean().optional(),
});

export async function getAllCompaniesHandler(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companies = await companiesService.getAllCompanies();
    res.json(companies);
  } catch (error) {
    next(error);
  }
}

export async function getCompanyByIdHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid company ID' });
      return;
    }
    
    const company = await companiesService.getCompanyById(id);
    
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    res.json(company);
  } catch (error) {
    next(error);
  }
}

export async function createCompanyHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createCompanySchema.parse(req.body);
    
    const company = await companiesService.createCompany(body);
    
    logger.info(`Company created: ${company.id} - ${company.name}`);
    
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
}

export async function updateCompanyHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const body = updateCompanySchema.parse(req.body);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid company ID' });
      return;
    }
    
    const company = await companiesService.updateCompany(id, body);
    
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    logger.info(`Company updated: ${company.id} - ${company.name}`);
    
    res.json(company);
  } catch (error) {
    next(error);
  }
}

export async function deleteCompanyHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid company ID' });
      return;
    }
    
    const deleted = await companiesService.deleteCompany(id);
    
    if (!deleted) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    logger.info(`Company deleted: ${id}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}


