import { Request } from 'express';
import { JWTPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface DateRangeQuery {
  dateFrom?: string;
  dateTo?: string;
}








