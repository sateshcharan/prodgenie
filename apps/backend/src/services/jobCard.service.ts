import axios from 'axios';
import fs from 'fs/promises';

import { PdfService } from './pdf.service.js';
import { TemplateService } from './template.service.js';

import { prisma } from '@prodgenie/libs/prisma';
import { StorageFileService } from '@prodgenie/libs/supabase';
import { JobCardRequest } from '@prodgenie/libs/types';
import { BomItem } from '@prodgenie/libs/types';

import { FileService } from './file.service.js';

export class JobCardService {
  private readonly fileService: FileService;
  private readonly storageFileService: StorageFileService;
  private readonly templateService: TemplateService;
  private readonly pdfService: PdfService;

  constructor() {
    this.fileService = new FileService();
    this.storageFileService = new StorageFileService();
    this.templateService = new TemplateService();
    this.pdfService = new PdfService();
  }

  async generateJobCard({
    bom,
    file,
    jobCardForm,
    user,
    titleBlock,
  }: JobCardRequest): Promise<void> {
    console.log(`Generating job card for File ID: ${file.id}`);

    if (!bom.length) {
      console.log('bom is empty');
      return;
    }

    const templates: string[] = [];

    for (const bomItem of bom) {
      const product = await this.identifyProduct(bomItem);

      if (!product?.sequencePath) {
        console.warn(`⚠️ Missing sequence for: ${bomItem.description}`);
        continue;
      }

      const sequenceUrl = await this.storageFileService.getSignedUrl(
        product.sequencePath
      );
      const { data: sequence } = await axios.get(sequenceUrl);

      const userOrg = await prisma.user.findUnique({
        where: { id: user.id },
        select: { org: { select: { name: true } } },
      });

      for (const section of sequence.sections) {
        const sectionUrl = await this.storageFileService.getSignedUrl(
          `${userOrg?.org?.name}/${section.path}`
        );

        const template = await this.fileService.downloadToTemp(
          sectionUrl,
          section.name
        );

        const injectionValues = {
          description: titleBlock.productTitle,
          productionQty:
            Number(bomItem.qty) * Number(jobCardForm.productionQty),
          drgPartNo: titleBlock.drawingNumber,
          poNumber: jobCardForm.poNumber,
          preparedBy: user.name,
          scheduleDate: jobCardForm.scheduleDate,
          jobCardNumber: jobCardForm.jobCardNumber,
          customerName: titleBlock.customerName,
          jobCardDate: jobCardForm.scheduleDate,
          length: bomItem.length,
          width: bomItem.width,
          height: bomItem.height,
        };

        const populatedTemplate = await this.templateService.injectValues(
          template,
          injectionValues
        );
        templates.push(populatedTemplate);
      }
    }

    const finalDoc = await this.templateService.combineTemplates(templates);
    const outputPath = await this.pdfService.generatePDF(finalDoc, file.id, {
      description: 'jobcard',
    });
    console.log(`Job card saved to ${outputPath}`);
    await this.uploadJobCard(outputPath);

    // cleanup temp files after upload
    // await fs.rm('./tmp', { recursive: true });
  }

  private async identifyProduct(item: BomItem) {
    const name = `${item.description.toLowerCase()}.json`;
    try {
      const result = await prisma.file.findFirst({
        where: { type: 'sequence', name },
      });

      return {
        sequenceId: result?.id,
        sequencePath: result?.path,
      };
    } catch (error) {
      console.error(`❌ Failed to identify product for "${name}":`, error);
      return null;
    }
  }

  private async uploadJobCard(filePath: string): Promise<any> {
    const fileBuffer = await fs.readFile(filePath);
    const fileName = '1234567890.pdf';
    const mimetype = 'application/pdf';

    const fakeMulterFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: fileName,
      encoding: '7bit',
      mimetype,
      size: fileBuffer.length,
      destination: '',
      filename: fileName,
      path: filePath,
      buffer: fileBuffer,
      stream: undefined as any,
    };

    const result = await this.fileService.uploadFile(
      [fakeMulterFile],
      'jobCard',
      '5e4174e2-d53b-4199-a1d3-239bb82f4833'
    );

    return result;
  }

  async notifyFrontend(fileId: string): Promise<void> {
    console.log(`✅ Job card generation completed for File ID: ${fileId}`);
  }
}
