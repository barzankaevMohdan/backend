import bcrypt from 'bcrypt';
import { prisma } from '../../prismaClient';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: string;
    companyId: number | null;
  };
}

export async function login(input: LoginInput): Promise<LoginResponse | null> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { company: true },
  });
  
  if (!user) {
    return null;
  }
  
  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
  
  if (!isValidPassword) {
    return null;
  }
  
  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  };
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  };
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string } | null> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    
    if (!user) {
      return null;
    }
    
    const newPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };
    
    const accessToken = generateAccessToken(newPayload);
    
    return { accessToken };
  } catch (error) {
    return null;
  }
}








