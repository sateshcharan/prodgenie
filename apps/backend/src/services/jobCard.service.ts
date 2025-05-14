import axios from 'axios';
import fs from 'fs/promises';
import { Parser } from 'expr-eval';

import { PdfService } from './pdf.service.js';
import { TemplateService } from './template.service.js';

import { prisma } from '@prodgenie/libs/prisma';
import { StorageFileService } from '@prodgenie/libs/supabase';
import { jobCardRequest, BomItem } from '@prodgenie/libs/types';

import { FileService } from './file.service.js';
import { normalize } from '../utils';

const parser = new Parser();

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
  }: jobCardRequest): Promise<void> {
    console.log(`Generating job card for File ID: ${file.id}`);

    if (!bom.length) {
      console.log('bom is empty');
      return;
    }

    const templates: string[] = [];

    const userOrg = await prisma.user.findUnique({
      where: { id: user.id },
      select: { org: { select: { name: true } } },
    });

    const formulaUrl = await this.storageFileService.getSignedUrl(
      `${userOrg?.org?.name}/calculation/formulas.json`
    );
    const { data: formulaConfig } = await axios.get(formulaUrl);

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

      for (const section of sequence.sections) {
        const sectionUrl = await this.storageFileService.getSignedUrl(
          `${userOrg?.org?.name}/${section.path}`
        );

        const template = await this.fileService.downloadToTemp(
          sectionUrl,
          section.name
        );

        // Your runtime context
        const context = {
          bomQty: Number(bomItem.qty),
          jobCardQty: Number(jobCardForm.productionQty),
          lengthId: Number(bomItem.length),
          widthId: Number(bomItem.width),
          heightId: Number(bomItem.height),
        };

        // Evaluate in safe order (since thinBlade depends on joints)
        const productionQty = parser.evaluate(
          formulaConfig.common.productionQty,
          context
        );
        const joints = parser.evaluate(formulaConfig.common.joints, context);

        const injectionValues = {
          description: titleBlock.productTitle,
          drgPartNo: titleBlock.drawingNumber,
          poNumber: jobCardForm.poNumber,
          preparedBy: user.name,
          scheduleDate: jobCardForm.scheduleDate,
          jobCardNumber: jobCardForm.jobCardNumber,
          customerName: titleBlock.customerName,
          jobCardDate: jobCardForm.scheduleDate,
          lengthID: bomItem.length,
          widthID: bomItem.width,
          heightID: bomItem.height,
          productionQty,
          joints,
        };

        const populatedTemplate = await this.templateService.injectValues(
          template,
          injectionValues
        );

        templates.push(populatedTemplate);
      }
      templates.push(`<div style="page-break-after: always;"></div>`);
    }

    const finalDoc = await this.templateService.combineTemplates(templates);
    const outputPath = await this.pdfService.generatePDF(finalDoc, file.id);
    console.log(`Job card saved to ${outputPath}`);
    await this.uploadJobCard(outputPath);

    // cleanup temp files after upload
    // await fs.rm('./tmp', { recursive: true });
  }

  private async identifyProduct(item: BomItem) {
    const name = `${normalize(item.description)}.json`;
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
    const fileName = filePath.split('/').pop();
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

    return await this.fileService.uploadFile(
      [fakeMulterFile],
      'jobCard',
      '5e4174e2-d53b-4199-a1d3-239bb82f4833'
    );
  }

  async notifyFrontend(fileId: string): Promise<void> {
    console.log(`✅ Job card generation completed for File ID: ${fileId}`);
  }
}
