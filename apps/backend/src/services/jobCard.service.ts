import fs from 'fs/promises';
import { Parser } from 'expr-eval';

import { PdfService } from './pdf.service.js';
import { FileService } from './file.service.js';
import { TemplateService } from './template.service.js';
import { StringService, CrudService } from '../utils/index.js';

import { prisma } from '@prodgenie/libs/prisma';
import { StorageFileService } from '@prodgenie/libs/supabase';
import { jobCardRequest, BomItem } from '@prodgenie/libs/types';

const parser = new Parser();

export class JobCardService {
  private readonly fileService: FileService;
  private readonly storageFileService: StorageFileService;
  private readonly templateService: TemplateService;
  private readonly pdfService: PdfService;
  private readonly crudService: CrudService;
  private readonly stringService: StringService;

  constructor() {
    this.fileService = new FileService();
    this.storageFileService = new StorageFileService();
    this.templateService = new TemplateService();
    this.pdfService = new PdfService();
    this.crudService = new CrudService();
    this.stringService = new StringService();
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

    const formulaConfig = await this.crudService.fetchJsonFromSignedUrl(
      `${user?.org?.name}/config/formula.json`
    );

    for (const bomItem of bom) {
      const product = await this.identifyProduct(bomItem);
      if (!product?.sequencePath) {
        console.warn(`⚠️ Missing sequence for: ${bomItem.description}`);
        continue;
      }
      const sequence = await this.crudService.fetchJsonFromSignedUrl(
        product.sequencePath
      );

      for (const section of sequence.sections) {
        const sectionUrl = await this.storageFileService.getSignedUrl(
          `${user?.org?.name}/${section.path}`
        );

        const template = await this.fileService.downloadToTemp(
          sectionUrl,
          section.name
        );

        // evaluate formulas
        const { productionQty, joints } = this.evaluateFormulas(
          bomItem,
          jobCardForm,
          formulaConfig
        );

        const populatedTemplate = await this.templateService.injectValues(
          template,
          {
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
          }
        );

        templates.push(populatedTemplate);
      }
      templates.push(`<div style="page-break-after: always;"></div>`);
    }

    const finalDoc = await this.templateService.combineTemplates(templates);
    const outputPath = await this.pdfService.generatePDF(finalDoc, file.id);
    console.log(`Job card saved to ${outputPath}`);
    await this.uploadJobCard(outputPath, user.id);

    // cleanup temp files after upload
    // await fs.rm('./tmp', { recursive: true });
  }

  private async identifyProduct(item: BomItem) {
    const name = `${this.stringService.camelCase(item.description)}.json`;
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

  private async uploadJobCard(filePath: string, userId: string): Promise<any> {
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
      userId
    );
  }

  async notifyFrontend(fileId: string): Promise<void> {
    console.log(`✅ Job card generation completed for File ID: ${fileId}`);
  }

  private evaluateFormulas(bomItem: BomItem, jobCardForm: any, formulas: any) {
    const context = {
      bomQty: Number(bomItem.qty),
      jobCardQty: Number(jobCardForm.productionQty),
      lengthId: Number(bomItem.length),
      widthId: Number(bomItem.width),
      heightId: Number(bomItem.height),
    };

    return {
      productionQty: parser.evaluate(formulas.common.productionQty, context),
      joints: parser.evaluate(formulas.common.joints, context),
    };
  }
}
