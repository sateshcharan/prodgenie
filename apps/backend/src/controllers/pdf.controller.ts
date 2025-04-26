import { Request, Response } from 'express';
import { PdfService } from '../services/pdf.service';

export class PdfController {
  static async parsePdf(req: Request, res: Response) {
    try {
      const tables = await PdfService.parsePdf(req.body.signedUrl);
      res.status(201).json({ success: true, data: tables });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
