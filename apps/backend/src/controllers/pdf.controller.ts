import { Request, Response } from 'express';

import { PdfService } from '../services/index.js';

export class PdfController {
  static async extractPdfData(req: Request, res: Response) {
    const user = req.user;
    try {
      const tables = await PdfService.extractPdfData(req.body.signedUrl, user);
      res.status(201).json({ success: true, data: tables });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
