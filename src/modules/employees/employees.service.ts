import { prisma } from '../../prismaClient';
import { Employee } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { config } from '../../config';
import { broadcastEvent } from '../../realtime';

export interface CreateEmployeeInput {
  companyId: number;
  name: string;
  roleTitle?: string;
  photoBuffer?: Buffer;
  photoMimetype?: string;
}

export interface UpdateEmployeeInput {
  name?: string;
  roleTitle?: string;
  photoBuffer?: Buffer;
  photoMimetype?: string;
}

export interface EmployeePublic {
  id: number;
  name: string;
  role: string | null;
  photoUrl: string | null;
}

export async function getAllEmployees(companyId: number): Promise<Employee[]> {
  return prisma.employee.findMany({
    where: { companyId },
    orderBy: { id: 'asc' },
  });
}

export async function getEmployeeById(id: number, companyId: number): Promise<Employee | null> {
  return prisma.employee.findFirst({
    where: { id, companyId },
  });
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  let photoFilename: string | null = null;
  
  if (input.photoBuffer) {
    photoFilename = await saveEmployeePhoto(input.photoBuffer);
  }
  
  const employee = await prisma.employee.create({
    data: {
      companyId: input.companyId,
      name: input.name,
      roleTitle: input.roleTitle || null,
      photoFilename,
    },
  });
  broadcastEvent('employee:created', toEmployeePublic(employee));
  return employee;
}

export async function updateEmployee(
  id: number,
  companyId: number,
  input: UpdateEmployeeInput
): Promise<Employee | null> {
  const employee = await getEmployeeById(id, companyId);
  
  if (!employee) {
    return null;
  }
  
  let photoFilename = employee.photoFilename;
  
  if (input.photoBuffer) {
    // Delete old photo
    if (employee.photoFilename) {
      await deleteEmployeePhoto(employee.photoFilename);
    }
    
    // Save new photo
    photoFilename = await saveEmployeePhoto(input.photoBuffer);
  }
  
  const updated = await prisma.employee.update({
    where: { id },
    data: {
      name: input.name,
      roleTitle: input.roleTitle,
      photoFilename,
    },
  });
  broadcastEvent('employee:updated', toEmployeePublic(updated));
  return updated;
}

export async function deleteEmployee(id: number, companyId: number): Promise<boolean> {
  const employee = await getEmployeeById(id, companyId);
  
  if (!employee) {
    return false;
  }
  
  // Delete photo
  if (employee.photoFilename) {
    await deleteEmployeePhoto(employee.photoFilename);
  }
  
  // Delete employee
  await prisma.employee.delete({
    where: { id },
  });
  broadcastEvent('employee:deleted', { id, companyId });
  
  return true;
}

// Photo management
async function saveEmployeePhoto(buffer: Buffer): Promise<string> {
  const filename = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
  const uploadsDir = path.join(config.uploadsDir, 'employees');
  
  // Ensure directory exists
  await fs.mkdir(uploadsDir, { recursive: true });
  
  const filepath = path.join(uploadsDir, filename);
  
  // Optimize image
  await sharp(buffer)
    .resize(800, 800, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toFile(filepath);
  
  return filename;
}

async function deleteEmployeePhoto(filename: string): Promise<void> {
  try {
    const filepath = path.join(config.uploadsDir, 'employees', filename);
    await fs.unlink(filepath);
  } catch (error) {
    // Ignore errors (file might not exist)
  }
}

// Format for Python recognition service
export function toEmployeePublic(employee: Employee): EmployeePublic {
  return {
    id: employee.id,
    name: employee.name,
    role: employee.roleTitle,
    photoUrl: employee.photoFilename ? `/uploads/employees/${employee.photoFilename}` : null,
  };
}





