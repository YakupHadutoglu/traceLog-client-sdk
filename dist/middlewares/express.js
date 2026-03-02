"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressMiddleware = void 0;
const expressMiddleware = (logger) => {
    return (req, res, next) => {
        const startTime = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            let level = 'info';
            if (res.statusCode >= 400 && res.statusCode < 500)
                level = 'warn';
            if (res.statusCode >= 500)
                level = 'error';
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
    };
};
exports.expressMiddleware = expressMiddleware;
