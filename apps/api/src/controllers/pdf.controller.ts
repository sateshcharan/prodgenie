import { Request, Response } from 'express';

import { PdfService } from '../services/index.js';

export class PdfController {
  static async extractPdfData(req: Request, res: Response) {
    const user = req.user;
    const { signedUrl, fileId } = req.body;

    if (!signedUrl || !fileId) {
      return res.status(400).json({
        error: 'signedUrl and fileId are required',
      });
    }

    const tables = await PdfService.extractAndSavePdfData(
      signedUrl,
      user,
      fileId
    );
    res.status(201).json({ success: true, data: tables });
  }
}
