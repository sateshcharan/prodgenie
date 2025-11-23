import { Response, Request, NextFunction } from 'express';

import { redis } from '@prodgenie/libs/redis';

export const redisCache = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl;
  const cached = await redis.get(key);

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    await redis.set(key, JSON.stringify(body), 'EX', 60);
    return originalJson(body);
  };

  next();
};
