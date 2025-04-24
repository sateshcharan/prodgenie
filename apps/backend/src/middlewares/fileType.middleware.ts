import { NextFunction, Request, Response } from 'express';
import { fileTypes } from '@prodgenie/libs/constant';

const allowedTypes = fileTypes;

const validateFileType = (req: Request, res: Response, next: NextFunction) => {
  const { fileType } = req.params;
  if (!allowedTypes.includes(fileType)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  next();
};

export { validateFileType };
