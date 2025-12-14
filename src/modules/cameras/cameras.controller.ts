import { Response, NextFunction } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { AuthRequest } from '../../types';
import * as camerasService from './cameras.service';
import { logger } from '../../logger';
import { config } from '../../config';

const createCameraSchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().max(255).optional(),
  ip: z.string().ip(),
  rtspPort: z.number().int().min(1).max(65535).optional(),
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
  rtspPath: z.string().min(1).max(255).optional(),
  recognitionEnabled: z.boolean().optional(),
});

const updateCameraSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  location: z.string().max(255).optional(),
  ip: z.string().ip().optional(),
  rtspPort: z.number().int().min(1).max(65535).optional(),
  username: z.string().min(1).max(255).optional(),
  password: z.string().min(1).max(255).optional(),
  rtspPath: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
  recognitionEnabled: z.boolean().optional(),
});

export async function getAllCamerasHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = req.user!.companyId!;
    
    const cameras = await camerasService.getAllCameras(companyId);
    const publicCameras = cameras.map(camerasService.toCameraPublic);
    
    res.json(publicCameras);
  } catch (error) {
    next(error);
  }
}

export async function getCameraByIdHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const companyId = req.user!.companyId!;
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid camera ID' });
      return;
    }
    
    const camera = await camerasService.getCameraById(id, companyId);
    
    if (!camera) {
      res.status(404).json({ error: 'Camera not found' });
      return;
    }
    
    res.json(camerasService.toCameraPublic(camera));
  } catch (error) {
    next(error);
  }
}

export async function createCameraHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createCameraSchema.parse(req.body);
    const companyId = req.user!.companyId!;
    
    const camera = await camerasService.createCamera({
      companyId,
      ...body,
    });
    
    logger.info(`Camera created: ${camera.id} - ${camera.name}`);
    
    res.status(201).json(camerasService.toCameraPublic(camera));
  } catch (error) {
    next(error);
  }
}

export async function updateCameraHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const companyId = req.user!.companyId!;
    const body = updateCameraSchema.parse(req.body);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid camera ID' });
      return;
    }
    
    const camera = await camerasService.updateCamera(id, companyId, body);
    
    if (!camera) {
      res.status(404).json({ error: 'Camera not found' });
      return;
    }
    
    logger.info(`Camera updated: ${camera.id} - ${camera.name}`);
    
    res.json(camerasService.toCameraPublic(camera));
  } catch (error) {
    next(error);
  }
}

export async function deleteCameraHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const companyId = req.user!.companyId!;
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid camera ID' });
      return;
    }
    
    const deleted = await camerasService.deleteCamera(id, companyId);
    
    if (!deleted) {
      res.status(404).json({ error: 'Camera not found' });
      return;
    }
    
    logger.info(`Camera deleted: ${id}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getStreamUrlHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const companyId = req.user!.companyId!;
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid camera ID' });
      return;
    }
    
    const camera = await camerasService.getCameraById(id, companyId);
    
    if (!camera) {
      res.status(404).json({ error: 'Camera not found' });
      return;
    }
    
    res.json({
      mjpegUrl: `${config.cameraGatewayPublicUrl.replace(/\/$/, '')}/streams/${id}.mjpg`,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRtspPreviewHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const companyId = req.user!.companyId!;

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid camera ID' });
      return;
    }

    const camera = await camerasService.getCameraById(id, companyId);

    if (!camera) {
      res.status(404).json({ error: 'Camera not found' });
      return;
    }

    const url = `${config.cameraGatewayInternalUrl.replace(/\/$/, '')}/api/cameras/${id}/preview`;
    const response = await axios.post(url);

    res.json({
      ok: true,
      latencyMs: response.data?.durationMs ?? null,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 502).json({
        ok: false,
        error: error.response?.data || error.message,
      });
      return;
    }
    next(error);
  }
}

export async function getCompanyCamerasPublicHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companySlug } = req.params;
    
    const cameras = await camerasService.getCamerasByCompanySlug(companySlug);
    
    if (cameras === null) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    const result = cameras.map(camera => ({
      id: camera.id,
      name: camera.name,
      location: camera.location,
      streamUrl: `${config.cameraGatewayPublicUrl.replace(/\/$/, '')}/streams/${camera.id}.mjpg`,
    }));
    
    res.json(result);
  } catch (error) {
    next(error);
  }
}




