import { type Request, type Response, type NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('[ERROR]', err.message);
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
};