import { NextFunction, Request, Response } from 'express';
import { FileType } from '@prisma/client';

const allowedTypes = Object.values(FileType);

const validateFileType = (req: Request, res: Response, next: NextFunction) => {
  const { fileType } = req.params;
  if (!allowedTypes.includes(fileType as FileType)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  next();
};

export { validateFileType };
