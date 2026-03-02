import { Request, Response, NextFunction } from 'express';
import { TraceLog } from '../core/TraceLog';

export const expressMiddleware = (logger: TraceLog) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;

            let level: 'info' | 'warn' | 'error' = 'info';
            if (res.statusCode >= 400 && res.statusCode < 500) level = 'warn';
            if (res.statusCode >= 500) level = 'error';

            logger.log(level, `HTTP ${req.method} ${req.originalUrl}`, {
                http: {
                    method: req.method,
                    url: req.originalUrl,
                    statusCode: res.statusCode,
                    duration: duration,
                }
            });
        });
        next();
    }
}
