import { prisma } from '../../prismaClient';
import { Company } from '@prisma/client';

export interface CreateCompanyInput {
  name: string;
  slug: string;
}

export interface UpdateCompanyInput {
  name?: string;
  slug?: string;
  isActive?: boolean;
}

export async function getAllCompanies(): Promise<Company[]> {
  return prisma.company.findMany({
    orderBy: { id: 'asc' },
  });
}

export async function getCompanyById(id: number): Promise<Company | null> {
  return prisma.company.findUnique({
    where: { id },
  });
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  return prisma.company.findUnique({
    where: { slug },
  });
}

export async function getFirstActiveCompany(): Promise<Company | null> {
  return prisma.company.findFirst({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  });
}

export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  return prisma.company.create({
    data: {
      name: input.name,
      slug: input.slug,
    },
  });
}

export async function updateCompany(id: number, input: UpdateCompanyInput): Promise<Company | null> {
  const company = await getCompanyById(id);
  
  if (!company) {
    return null;
  }
  
  return prisma.company.update({
    where: { id },
    data: input,
  });
}

export async function deleteCompany(id: number): Promise<boolean> {
  const company = await getCompanyById(id);
  
  if (!company) {
    return false;
  }
  
  // Soft delete
  await prisma.company.update({
    where: { id },
    data: { isActive: false },
  });
  
  return true;
}





