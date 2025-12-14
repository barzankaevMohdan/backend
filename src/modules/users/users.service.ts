import bcrypt from 'bcrypt';
import { prisma } from '../../prismaClient';
import { User, UserRole } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  companyId?: number;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface UserPublic extends Omit<User, 'passwordHash'> {}

export async function getAllUsers(companyId: number | null): Promise<User[]> {
  if (companyId === null) {
    // SUPERADMIN - see all users
    return prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
  }
  
  // Company users only
  return prisma.user.findMany({
    where: { companyId },
    orderBy: { id: 'asc' },
  });
}

export async function getUserById(id: number): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const passwordHash = await bcrypt.hash(input.password, 10);
  
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
      companyId: input.companyId || null,
    },
  });
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<User | null> {
  const user = await getUserById(id);
  
  if (!user) {
    return null;
  }
  
  const data: any = {};
  
  if (input.email !== undefined) data.email = input.email;
  if (input.password !== undefined) data.passwordHash = await bcrypt.hash(input.password, 10);
  if (input.role !== undefined) data.role = input.role;
  
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: number): Promise<boolean> {
  const user = await getUserById(id);
  
  if (!user) {
    return false;
  }
  
  await prisma.user.delete({
    where: { id },
  });
  
  return true;
}

export function toUserPublic(user: User): UserPublic {
  const { passwordHash, ...rest } = user;
  return rest;
}








