import fs from 'fs/promises';
import get from 'lodash/get';
import { Readable } from 'stream';
import { evaluate } from 'mathjs';
import { Parser } from 'expr-eval';
import { randomUUID } from 'crypto';

import { prisma } from '@prodgenie/libs/prisma';
import { FileStorageService } from '@prodgenie/libs/supabase';
import { jobCardRequest, BomItem, FileType } from '@prodgenie/libs/types';
import { StringService } from '@prodgenie/libs/frontend-services';
import { FileHelperService } from '@prodgenie/libs/server-services';

import { PdfService } from './pdf.service.js';
import { FileService } from './file.service.js';
import { TemplateService } from './template.service.js';
import { ThumbnailService } from './thumbnail.service.js';

const parser = new Parser();

export class JobCardService {
  private fileService = new FileService();
  private fileStorageService = new FileStorageService();
  private fileHelperService = new FileHelperService();
  private templateService = new TemplateService();
  private pdfService = new PdfService();
  private stringService = new StringService();
  private thumbnailService = new ThumbnailService();

  async generateJobCard({
    bom,
    jobCardForm,
    user,
    titleBlock,
    signedUrl,
    printingDetails,
    activeWorkspace,
  }: jobCardRequest) {
    if (!bom.length) return console.warn('bom is empty');

    console.log(`Generating job card : ${jobCardForm.jobCardNumber} `);

    const templates: string[] = [];
    const workspaceId = activeWorkspace?.workspace?.id;
    const workspaceCredits = activeWorkspace?.workspace?.credits;
    const workspaceName = activeWorkspace?.workspace?.name;

    // check org credits
    if (workspaceCredits < 10) {
      throw new Error('Not enough credits upgrade your plan');
    }

    const materialConfig = await this.fetchOrgConfig(
      workspaceId,
      'material.json',
      'table'
    );
    const standardConfig = await this.fetchOrgConfig(
      workspaceId,
      'standard.json',
      'table'
    );
    const bomConfig = await this.fetchOrgConfig(
      workspaceId,
      'bom.json',
      'config'
    );

    let manualContext = {
      jobCardForm,
      user,
      titleBlock,
      printingDetails,
      keyword: { currentDate: new Date().toISOString().split('T')[0] },
    };

    const drawingFile = await this.fileHelperService.downloadToTemp(
      signedUrl,
      'drawing.pdf'
    );

    for (const bomItem of bom) {
      const product = await this.identifyProduct(bomItem);
      manualContext = { ...manualContext, bomItem };

      if (!product?.sequencePath) {
        console.warn(`⚠️ Missing sequence for: ${bomItem.description}`);
        continue;
      }

      const sequenceData = product?.sequenceData;

      const sequence = await this.fileHelperService.fetchJsonFromSignedUrl(
        product.sequencePath
      );

      for (const section of sequence.sections) {
        const sectionUrl = await this.fileStorageService.getSignedUrl(
          `${workspaceName}/${section.path}`
        );

        const templateData = await prisma.file.findFirst({
          where: {
            type: 'template',
            name: `${section.name}.htm`,
          },
          select: {
            data: true,
          },
        });

        if (!templateData) {
          console.warn(`⚠️ Missing template for: ${section.name}`);
          continue;
        }

        const template = await this.fileHelperService.downloadToTemp(
          sectionUrl,
          section.name
        );

        const { manual: manualFields, computed: computedFieldDefs } =
          templateData?.data?.templateFields || {};

        const context = this.buildContext(
          Object.fromEntries(
            Object.entries(manualFields).map(([key, value]: any) => [
              key,
              value.replace(/_/g, '.'),
            ])
          ),
          manualContext
        );

        const evalContext = Object.entries({
          sectionName: section.name,
          materialConfig,
          standardConfig,
          sequenceData,
          bomConfig,
          ...context,
          ...this.stringService.prefixKeys('bomItem', bomItem),
          ...this.stringService.prefixKeys('jobCardForm', jobCardForm),
          ...this.stringService.prefixKeys('user', user),
        }).reduce((acc, [key, value]) => {
          acc[key] = !isNaN(value as any) ? Number(value) : value;
          return acc;
        }, {} as Record<string, any>);

        const computedFields = this.evaluateFormulas(
          evalContext,
          computedFieldDefs
        );

        const populatedTemplate = await this.templateService.injectValues(
          template,
          { ...context, ...computedFields }
        );

        templates.push(populatedTemplate);
      }
      templates.push(`<div style="page-break-after: always;"></div>`);
      console.log(`Template generated for: ${bomItem.description}`);
    }

    const finalDoc = await this.templateService.combineTemplates(templates);
    const outputPath = await this.pdfService.generatePDF(
      finalDoc,
      jobCardForm.jobCardNumber
    );
    console.log(`Job card saved to ${outputPath}`);

    const jobCardUrl = await this.uploadJobCard(
      outputPath,
      user,
      activeWorkspace
    );

    // Deduct 10 credits
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { credits: { decrement: 10 } },
    });

    await fs.rm('./tmp', { recursive: true });

    return jobCardUrl;
  }

  private async fetchOrgConfig(
    workspaceId: string,
    name: string,
    type: string
  ) {
    const configFile = await prisma.file.findFirst({
      where: { workspaceId, name, type: type as FileType },
      select: { path: true },
    });

    return await this.fileHelperService.fetchJsonFromSignedUrl(
      `${configFile?.path}`
    );
  }

  private async identifyProduct(item: BomItem) {
    const keyword = this.stringService.camelCase(item.description); // e.g., "partitionLen"
    const baseKeyword = keyword.replace(
      /(Len|Wid|Ht|Size|Dim|Length|Width|Height)$/i,
      ''
    ); // remove common suffixes
    const fallbackKeyword = baseKeyword.toLowerCase();

    try {
      // 1. Try exact match
      const exactMatch = await prisma.file.findFirst({
        where: {
          type: 'sequence',
          name: {
            equals: `${keyword}.json`,
            mode: 'insensitive',
          },
        },
      });

      if (exactMatch) {
        return {
          sequenceId: exactMatch.id,
          sequencePath: exactMatch.path,
          sequenceData: exactMatch.data,
        };
      }

      // 2. Try partial/fuzzy match
      const partialMatch = await prisma.file.findFirst({
        where: {
          type: 'sequence',
          name: {
            contains: fallbackKeyword,
            mode: 'insensitive',
          },
        },
      });

      if (partialMatch) {
        return {
          sequenceId: partialMatch.id,
          sequencePath: partialMatch.path,
          sequenceData: partialMatch.data,
        };
      }

      console.warn(`⚠️ No sequence match for: ${item.description}`);
      return null;
    } catch (error) {
      console.error(
        `❌ Failed to identify product for "${item.description}":`,
        error
      );
      return null;
    }
  }

  private evaluateFormulas(
    context: Record<string, any>,
    computedFields: Record<string, string>
  ) {
    return Object.fromEntries(
      Object.entries(computedFields).map(([key, formula]) => {
        try {
          if (formula === 'keyword_depField') {
            return [key, this.evaluateDepFields(context, key)];
          }
          return [key, parser.evaluate(formula, context)];
        } catch (err) {
          console.warn(`⚠️ Error evaluating ${key}: ${formula}`, err);
          return [key, null];
        }
      })
    );
  }

  private evaluateDepFields(
    context: Record<string, any>,
    depField: string
  ): number | string {
    const { sequenceData, materialConfig, bomItem_material } = context;

    const normalizeKey = (str: string) => str.toLowerCase().replace(/\s/g, '');

    const materialThickness = materialConfig[normalizeKey(bomItem_material)];

    const { common = {}, depField: depFields = {} } = sequenceData;
    const depFieldExpr = depFields[depField];

    if (!depFieldExpr)
      throw new Error(`depField expression for "${depField}" not found`);

    const evaluated: Record<string, any> = { ...context, materialThickness };

    // Match all ${...} references in the depField expression
    const referencedKeys = Array.from(
      depFieldExpr.matchAll(/\$\{(\w+)\}/g),
      (match: any) => match[1]
    );

    // Recursively resolve each referenced key
    for (const key of referencedKeys) {
      if (evaluated[key] === undefined) {
        evaluated[key] = this.resolveField(key, common, context, evaluated);
      }
    }

    // Replace ${...} placeholders with resolved values
    const result = depFieldExpr.replace(/\$\{(\w+)\}/g, (_, key: string) => {
      const val = evaluated[key];
      if (val === undefined) {
        throw new Error(`Missing value for ${key}`);
      }
      return val.toString();
    });

    return result;

    // for (const key of Object.keys(common)) {
    //   if (evaluated[key] === undefined) {
    //     const safeExpr = common[key].replace(/\?/g, ' ? ').replace(/:/g, ' : ');
    //     evaluated[key] = evaluate(safeExpr, evaluated);
    //   }
    // }

    // Handle string interpolation for depField (e.g. "${flatLen} x ${flatWid}")
    // return depFieldExpr.replace(/\$\{(\w+)\}/g, (_: any, varName: any) => {
    //   const val = evaluated[varName];
    //   if (val === undefined)
    //     throw new Error(
    //       `Variable "${varName}" not found in depField interpolation`
    //     );
    //   return val.toString();
    // });
  }

  private resolveField(
    key: string,
    formulas: Record<string, string>,
    context: Record<string, any>,
    cache: Record<string, any>
  ): any {
    if (cache[key] !== undefined) return cache[key];
    const expr = formulas[key];
    if (!expr) throw new Error(`Formula for "${key}" not found`);

    // Replace ${...} recursively
    const resolvedExpr = expr.replace(/\$\{(\w+)\}/g, (_, varName) => {
      return this.resolveField(varName, formulas, context, cache);
    });

    try {
      const result = evaluate(resolvedExpr, { ...context, ...cache });
      cache[key] = result;
      return result;
    } catch (err) {
      console.warn(`Failed to evaluate ${key}:`, resolvedExpr, err);
      return null;
    }
  }

  private async uploadJobCard(
    filePath: string,
    user: string,
    activeWorkspace: string
  ): Promise<any> {
    const fileBuffer = await fs.readFile(filePath);
    const fileName = filePath.split('/').pop();
    const fakeMulterFile: Express.Multer.File = {
      id: randomUUID(),
      fieldname: 'file',
      originalname: fileName,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: fileBuffer.length,
      destination: '',
      filename: fileName,
      path: filePath,
      buffer: fileBuffer,
      // stream: undefined as any,
    };

    const jobCard = await this.fileService.uploadFile(
      [fakeMulterFile],
      'jobCard',
      user,
      activeWorkspace
    );

    const thumbnailBuffer = await this.thumbnailService.generate(
      fakeMulterFile,
      'jobCard'
    );
    const thumbnailFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: `${jobCard[0].id}_thumbnail.png`,
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: thumbnailBuffer.length,
      buffer: thumbnailBuffer,
      destination: '',
      filename: '',
      path: '',
      // stream: Readable.from(thumbnailBuffer),
    };

    await this.thumbnailService.set(
      thumbnailFile,
      jobCard[0].id,
      user,
      activeWorkspace
    );
    return await this.fileStorageService.getSignedUrl(jobCard[0].path);
  }

  async getJobCardNumber(workspace: {
    workspace: { id: string; name: string };
  }) {
    const latest = await prisma.file.findFirst({
      where: { workspaceId: workspace.workspace.id, type: 'jobCard' },
      orderBy: { name: 'desc' },
      select: { name: true },
    });

    const prefix = `${workspace.workspace.name.slice(0, 3).toUpperCase()}-JC-`;
    const lastNumber = parseInt(
      latest?.name?.split('.')[0].split('-')[2] || '0',
      10
    );
    const nextNumber = (lastNumber + 1).toString().padStart(4, '0');

    return { data: `${prefix}${nextNumber}` };
  }

  async notifyFrontend(fileId: string): Promise<void> {
    console.log(`✅ Job card generation completed for File ID: ${fileId}`);
  }

  getValueFromPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  buildContext(map: Record<string, string>, source: Record<string, any>) {
    const output: Record<string, any> = {};
    for (const [key, expression] of Object.entries(map)) {
      const arrayMatch = expression.match(/^(.*)\[\](?:\.(.*))?$/);
      if (arrayMatch) {
        const [_, arrPath, subPath] = arrayMatch;
        const arr = get(source, arrPath);
        output[key] = Array.isArray(arr)
          ? subPath
            ? arr.map((item) => this.evaluateSimpleConcat(subPath, item))
            : arr
          : [];
      } else {
        output[key] = this.evaluateSimpleConcat(expression, source);
      }
    }
    return output;
  }

  private evaluateSimpleConcat(
    expression: string,
    source: Record<string, any>
  ): string {
    return expression
      .split('+')
      .map((part) => part.trim())
      .map((path) => this.getValueFromPath(source, path) ?? '')
      .join(' ');
  }
}
