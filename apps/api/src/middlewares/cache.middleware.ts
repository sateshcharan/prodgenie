import { Request, Response, NextFunction } from 'express';

export const cache =
  (seconds: number) => (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', `public, max-age=${seconds}`);
    next();
  };
