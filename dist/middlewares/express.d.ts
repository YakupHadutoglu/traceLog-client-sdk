import { Request, Response, NextFunction } from 'express';
import { TraceLog } from '../core/TraceLog';
export declare const expressMiddleware: (logger: TraceLog) => (req: Request, res: Response, next: NextFunction) => void;
