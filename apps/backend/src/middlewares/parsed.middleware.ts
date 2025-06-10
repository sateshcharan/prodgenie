import { NextFunction, Request, Response } from 'express';

import { prisma } from '@prodgenie/libs/prisma';

const validateParsed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fileId } = req.body;

  if (!fileId) {
    return res.status(400).json({ error: 'Missing fileId in request body' });
  }

  try {
    const parsedData = await prisma.file.findUnique({
      where: { id: fileId },
      select: { data: true }, // Only fetch `data` if that's all you need
    });

    if (parsedData?.data) {
      return res.status(200).json({ data: parsedData.data });
    }

    next();
  } catch (error) {
    console.error('Error validating parsed file:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { validateParsed };
