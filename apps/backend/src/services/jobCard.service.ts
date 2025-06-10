import fs from 'fs/promises';
import { Parser } from 'expr-eval';
import get from 'lodash/get';
import { evaluate, parse } from 'mathjs';

import { PdfService } from './pdf.service.js';
import { FileService } from './file.service.js';
import { TemplateService } from './template.service.js';
import { StringService, CrudService } from '../utils/index.js';

import { prisma } from '@prodgenie/libs/prisma';
import { FileStorageService } from '@prodgenie/libs/supabase';
import { jobCardRequest, BomItem } from '@prodgenie/libs/types';
import { date } from 'zod';

const parser = new Parser();

export class JobCardService {
  private fileService = new FileService();
  private fileStorageService = new FileStorageService();
  private templateService = new TemplateService();
  private pdfService = new PdfService();
  private crudService = new CrudService();
  private stringService = new StringService();

  async generateJobCard({
    bom,
    jobCardForm,
    user,
    titleBlock,
    signedUrl,
    printingDetails,
  }: jobCardRequest) {
    console.log(`Generating job card : ${jobCardForm.jobCardNumber} `);

    if (!bom.length) return console.warn('bom is empty');

    const templates: string[] = [];
    const formulaConfig = await this.crudService.fetchJsonFromSignedUrl(
      `${user?.org?.name}/config/formula.json`
    );
    const onboardingConfig = await this.crudService.fetchJsonFromSignedUrl(
      `${user?.org?.name}/config/onboarding.json`
    );

    let manualContext = {
      jobCardForm,
      user,
      titleBlock,
      printingDetails,
    };

    const drawingFile = await this.fileService.downloadToTemp(
      signedUrl,
      'drawing'
    );

    for (const bomItem of bom) {
      const product = await this.identifyProduct(bomItem);
      manualContext = { ...manualContext, bomItem };

      if (!product?.sequencePath) {
        console.warn(`⚠️ Missing sequence for: ${bomItem.description}`);
        continue;
      }

      const sequence = await this.crudService.fetchJsonFromSignedUrl(
        product.sequencePath
      );

      for (const section of sequence.sections) {
        const sectionUrl = await this.fileStorageService.getSignedUrl(
          `${user?.org?.name}/${section.path}`
        );

        const template = await this.fileService.downloadToTemp(
          sectionUrl,
          section.name
        );
        const manualFields = formulaConfig[section.name].fields.manual || {};
        const computedFieldDefs =
          formulaConfig[section.name].fields.computed || {};

        // transform the context map to replace underscores with dots
        const transformedContextMap = Object.fromEntries(
          Object.entries(manualFields).map(([key, value]) => [
            key,
            value.replace(/_/g, '.'),
          ])
        );

        const context = this.buildContext(transformedContextMap, manualContext);

        const evalContext = Object.entries({
          sectionName: section.name,
          onboardingConfig,
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

    const jobCardUrl = await this.uploadJobCard(outputPath, user);
    return jobCardUrl;
    // Optionally clean temp files: await fs.rm('./tmp', { recursive: true });
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
          if (formula === 'depField') {
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

  // private evaluateDepFields(context: Record<string, any>, depField: string) {
  //   const {
  //     sectionName,
  //     onboardingConfig,
  //     bomItem_material,
  //     bomItem_description,
  //   } = context;
  //   const materialThickness =
  //     onboardingConfig.material[
  //       bomItem_material.toLowerCase().replace(/\s/g, '')
  //     ];
  //   const depFieldFormula =
  //     onboardingConfig.product[bomItem_description.toLowerCase()].depField[
  //       depField
  //     ];
  //   const commonFieldFormulas =
  //     onboardingConfig.product[bomItem_description.toLowerCase()].common;
  //   const productFormulas = { ...commonFieldFormulas, depFieldFormula };
  //   const depFieldContext = { ...context, materialThickness };
  //   const evaluated: Record<string, number> = { ...depFieldContext };

  //   const evaluateField = (key: string) => {
  //     if (evaluated[key] !== undefined) return evaluated[key];

  //     const expr = productFormulas[key];
  //     if (!expr) throw new Error(`Expression for "${key}" not found`);

  //     // Replace JS-style ternary with mathjs-compatible if needed
  //     const safeExpr = expr.replace(/\?/g, ' ? ').replace(/:/g, ' : ');

  //     // Replace variables in the expression with evaluated values
  //     const compiled = parse(safeExpr);
  //     const result = compiled.evaluate(evaluated);
  //     evaluated[key] = result;
  //     return result;
  //   };

  //   // Evaluate all fields
  //   Object.keys(productFormulas).forEach((key) => evaluateField(key));

  //   return evaluated.depFieldFormula;
  // }

  private evaluateDepFields(
    context: Record<string, any>,
    depField: string
  ): number | string {
    const { onboardingConfig, bomItem_material, bomItem_description } = context;

    const normalizeKey = (str: string) => str.toLowerCase().replace(/\s/g, '');

    const materialThickness =
      onboardingConfig.material[normalizeKey(bomItem_material)];
    const productConfig =
      onboardingConfig.product[normalizeKey(bomItem_description)];
    const { common = {}, depField: depFields = {} } = productConfig;

    const depFieldExpr = depFields[depField];
    if (!depFieldExpr)
      throw new Error(`depField expression for "${depField}" not found`);

    const formulas = { ...common };
    const evaluated: Record<string, number> = { ...context, materialThickness };

    const evaluateField = (key: string): number => {
      if (evaluated[key] !== undefined) return evaluated[key];
      const expr = formulas[key];
      if (!expr) throw new Error(`Expression for "${key}" not found`);
      const safeExpr = expr.replace(/\?/g, ' ? ').replace(/:/g, ' : ');
      const result = evaluate(safeExpr, evaluated);
      evaluated[key] = result;
      return result;
    };

    Object.keys(formulas).forEach(evaluateField);

    // Handle string interpolation for depField (e.g. "${flatLen} x ${flatWid}")
    const template = depFieldExpr;
    const interpolated = template.replace(/\$\{(\w+)\}/g, (_, varName) => {
      const val = evaluated[varName];
      if (val === undefined)
        throw new Error(
          `Variable "${varName}" not found for template substitution`
        );
      return val.toString();
    });

    return interpolated;
  }

  private async uploadJobCard(filePath: string, user: string): Promise<any> {
    const fileBuffer = await fs.readFile(filePath);
    const fileName = filePath.split('/').pop();

    const fakeMulterFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: fileName,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: fileBuffer.length,
      destination: '',
      filename: fileName,
      path: filePath,
      buffer: fileBuffer,
      stream: undefined as any,
    };

    const jobCard = await this.fileService.uploadFile(
      [fakeMulterFile],
      'jobCard',
      user
    );

    return await this.fileStorageService.getSignedUrl(jobCard[0].path);
  }

  async getJobCardNumber(org: { id: string; name: string }) {
    const latest = await prisma.file.findFirst({
      where: { orgId: org.id, type: 'jobCard' },
      orderBy: { createdAt: 'desc' },
      select: { name: true },
    });
    const prefix = `${org.name.slice(0, 3).toUpperCase()}-JC-`;
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
        const arrPath = arrayMatch[1]; // e.g. "printingDetails"
        const subPath = arrayMatch[2]; // e.g. "name" or undefined

        const arr = get(source, arrPath);

        if (Array.isArray(arr)) {
          if (subPath) {
            output[key] = arr.map((item) =>
              this.evaluateSimpleConcat(subPath, item)
            );
          } else {
            output[key] = arr;
          }
        } else {
          output[key] = [];
        }
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
