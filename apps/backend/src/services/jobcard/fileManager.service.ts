import fs from 'fs/promises';
import { randomUUID } from 'crypto';

import { FileService } from '../file.service.js';
import { ThumbnailService } from '../thumbnail.service.js';
import { PdfService } from '../pdf.service.js';

import { FileStorageService } from '@prodgenie/libs/supabase';

export class FileManager {
  private fileService = new FileService();
  private thumbnailService = new ThumbnailService();
  private storageService = new FileStorageService();
  private pdfService = new PdfService();

  async saveAsPDF(html: string, jobCardNumber: string) {
    return this.pdfService.generatePDF(html, jobCardNumber);
  }

  async uploadJobCard(filePath: string, user: any, workspace: any) {
    const buffer = await fs.readFile(filePath);
    const fileName = filePath.split('/').pop();

    const file: Express.Multer.File = {
      id: randomUUID(),
      fieldname: 'file',
      originalname: fileName!,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: buffer.length,
      destination: '',
      filename: fileName!,
      path: filePath,
      buffer,
    };

    const jobCard = await this.fileService.uploadFile(
      [file],
      'jobCard',
      user,
      workspace
    );
    const thumbBuffer = await this.thumbnailService.generate(file, 'jobCard');
    const thumb: Express.Multer.File = {
      fieldname: 'file',
      originalname: `${jobCard[0].id}_thumbnail.png`,
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: thumbBuffer.length,
      buffer: thumbBuffer,
      destination: '',
      filename: '',
      path: '',
    };
    await this.thumbnailService.set(thumb, jobCard[0].id, user, workspace);
    return await this.storageService.getSignedUrl(jobCard[0].path);
  }
}
