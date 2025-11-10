import { Request, Response } from 'express';
import { PdfService } from '../services/index.js';
import { prisma } from '@prodgenie/libs/db';

export class PdfController {
  static async extractPdfData(req: Request, res: Response) {
    const user = req.user;

    const tables = await PdfService.extractPdfData(req.body.signedUrl, user);

    await prisma.file.update({
      where: {
        id: req.body.fileId,
      },
      data: {
        data: tables,
      },
    });

    res.status(201).json({ success: true, data: tables });
  }
}
