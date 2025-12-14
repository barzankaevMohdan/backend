import { prisma } from '../../prismaClient';
import { Camera } from '@prisma/client';
import { encrypt, decrypt } from '../../utils/encryption';

export interface CreateCameraInput {
  companyId: number;
  name: string;
  location?: string;
  ip: string;
  rtspPort?: number;
  username: string;
  password: string;
  rtspPath?: string;
  recognitionEnabled?: boolean;
}

export interface UpdateCameraInput {
  name?: string;
  location?: string;
  ip?: string;
  rtspPort?: number;
  username?: string;
  password?: string;
  rtspPath?: string;
  isActive?: boolean;
  recognitionEnabled?: boolean;
}

export interface CameraPublic extends Omit<Camera, 'passwordEnc'> {
  // Password never returned
}

export async function getAllCameras(companyId: number): Promise<Camera[]> {
  return prisma.camera.findMany({
    where: { companyId },
    orderBy: { id: 'asc' },
  });
}

export async function getCameraById(id: number, companyId: number): Promise<Camera | null> {
  return prisma.camera.findFirst({
    where: { id, companyId },
  });
}

export async function createCamera(input: CreateCameraInput): Promise<Camera> {
  const passwordEnc = encrypt(input.password);
  
  return prisma.camera.create({
    data: {
      companyId: input.companyId,
      name: input.name,
      location: input.location || null,
      ip: input.ip,
      rtspPort: input.rtspPort || 554,
      username: input.username,
      passwordEnc,
      rtspPath: input.rtspPath || '/ISAPI/Streaming/Channels/101',
      recognitionEnabled: input.recognitionEnabled !== false,
    },
  });
}

export async function updateCamera(
  id: number,
  companyId: number,
  input: UpdateCameraInput
): Promise<Camera | null> {
  const camera = await getCameraById(id, companyId);
  
  if (!camera) {
    return null;
  }
  
  const data: any = {};
  
  if (input.name !== undefined) data.name = input.name;
  if (input.location !== undefined) data.location = input.location;
  if (input.ip !== undefined) data.ip = input.ip;
  if (input.rtspPort !== undefined) data.rtspPort = input.rtspPort;
  if (input.username !== undefined) data.username = input.username;
  if (input.password !== undefined) data.passwordEnc = encrypt(input.password);
  if (input.rtspPath !== undefined) data.rtspPath = input.rtspPath;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.recognitionEnabled !== undefined) data.recognitionEnabled = input.recognitionEnabled;
  
  return prisma.camera.update({
    where: { id },
    data,
  });
}

export async function deleteCamera(id: number, companyId: number): Promise<boolean> {
  const camera = await getCameraById(id, companyId);
  
  if (!camera) {
    return false;
  }
  
  await prisma.camera.delete({
    where: { id },
  });
  
  return true;
}

export function buildRtspUrl(camera: Camera): string {
  const password = decrypt(camera.passwordEnc);
  return `rtsp://${camera.username}:${password}@${camera.ip}:${camera.rtspPort}${camera.rtspPath}`;
}

export function buildSafeRtspUrl(camera: Camera): string {
  return `rtsp://${camera.username}@${camera.ip}:${camera.rtspPort}${camera.rtspPath}`;
}

export function toCameraPublic(camera: Camera): CameraPublic {
  const { passwordEnc, ...rest } = camera;
  return rest;
}

export async function getCamerasByCompanySlug(companySlug: string): Promise<Camera[] | null> {
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
  });
  
  if (!company) {
    return null;
  }
  
  return prisma.camera.findMany({
    where: {
      companyId: company.id,
      isActive: true,
      recognitionEnabled: true,
    },
    orderBy: { id: 'asc' },
  });
}







