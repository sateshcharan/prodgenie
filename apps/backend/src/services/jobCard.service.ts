import fs from 'fs/promises';
import get from 'lodash/get';
import { Readable } from 'stream';
import { evaluate } from 'mathjs';
import { Parser } from 'expr-eval';
import { randomUUID } from 'crypto';

import { prisma } from '@prodgenie/libs/prisma';
import { FileStorageService } from '@prodgenie/libs/supabase';
import { StringService } from '@prodgenie/libs/frontend-services';
import { FileHelperService } from '@prodgenie/libs/server-services';
import { jobCardRequest, BomItem, FileType } from '@prodgenie/libs/types';

import { PdfService } from './pdf.service.js';
import { FileService } from './file.service.js';
import { TemplateService } from './template.service.js';
import { ThumbnailService } from './thumbnail.service.js';
import { WorkspaceService } from './workspace.service.js';

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

    const templates: string[] = [];
    const workspaceName = activeWorkspace?.workspace?.name;
    const workspaceId = activeWorkspace?.workspace?.id;
    const workspaceCredits = activeWorkspace?.workspace?.credits;
    if (workspaceCredits < 10) {
      throw new Error('Not enough credits'); // check org credits
    }

    console.log(`Generating job card : ${jobCardForm.global.jobCardNumber} `);

    const tables = await this.fetchAllWorkspaceTables(workspaceId);
    const tableConfigs = await this.buildTableConfigs(tables);
    const bomConfig = await WorkspaceService.getWorkspaceConfig(
      workspaceId,
      'bom.json'
    );
    const drawingFile = await this.fileHelperService.downloadToTemp(
      signedUrl,
      'drawing.pdf'
    );

    for (const bomItem of bom) {
      const productSequence = await this.identifyProduct(bomItem);
      if (!productSequence?.sequencePath) {
        console.warn(`⚠️ Missing sequence for: ${bomItem.description}`);
        continue;
      }
      const { sequenceData } = productSequence;
      const sequenceFormulas = sequenceData?.formulas;
      const sequence = await this.fileHelperService.fetchJsonFromSignedUrl(
        productSequence.sequencePath
      );

      for (const templateSection of sequence.sections) {
        const sectionUrl = await this.fileStorageService.getSignedUrl(
          `${workspaceName}/${templateSection.path}`
        );

        const templateData = await prisma.file.findFirst({
          where: {
            type: 'template',
            name: `${templateSection.name}.htm`,
          },
          select: {
            data: true,
          },
        });

        if (!templateData) {
          console.warn(`⚠️ Missing template for: ${templateSection.name}`);
          //skip further processing move to next section
          continue;
        }
        const { templateFields: templateFormulas } = templateData?.data;

        const templateContext = Object.entries({
          bomConfig,
          sequenceFormulas,
          printingDetails,
          sectionName: templateSection.name,
          tables: tableConfigs,
          ...(jobCardForm.sections[templateSection.name] &&
            this.stringService.flattenObjectWith_({
              [`${templateSection.name}_jobCardForm`]:
                jobCardForm.sections[templateSection.name],
              // jobCardForm: jobCardForm.sections[templateSection.name],
            })),
          ...this.stringService.prefixKeys('jobCardForm', jobCardForm.global),
          ...this.stringService.prefixKeys('bomItem', bomItem),
          ...this.stringService.prefixKeys('user', user),
          ...this.stringService.prefixKeys('titleBlock', titleBlock),
          ...this.stringService.prefixKeys('keyword', {
            currentDate: new Date().toISOString().split('T')[0],
          }),
        }).reduce((acc, [key, value]) => {
          acc[key] = !isNaN(value as any) ? Number(value) : value;
          return acc;
        }, {} as Record<string, any>);

        // console.log(templateContext);

        const evaluatedtemplateFormulas = this.evaluateFormulasUnified(
          templateFormulas,
          templateContext
        );

        const template = await this.fileHelperService.downloadToTemp(
          sectionUrl,
          templateSection.name
        );

        const populatedTemplate = await this.templateService.injectValues(
          template,
          { ...templateContext, ...evaluatedtemplateFormulas }
        );
        templates.push(populatedTemplate);
      }
      templates.push(`<div style="page-break-after: always;"></div>`);
      console.log(`Template generated for: ${bomItem.description}`);
    }

    const finalDoc = await this.templateService.combineTemplates(templates);
    const outputPath = await this.pdfService.generatePDF(
      finalDoc,
      jobCardForm.global.jobCardNumber
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

  private async fetchWorkspaceConfig(
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

  private async fetchAllWorkspaceTables(workspaceId: string) {
    const tableFiles = await prisma.file.findMany({
      where: { workspaceId, type: { in: ['table'] as FileType[] } },
      select: { name: true, type: true, path: true },
    });

    const tables: Record<string, any> = {};

    for (const file of tableFiles) {
      try {
        tables[file.name.replace('.json', '')] =
          await this.fileHelperService.fetchJsonFromSignedUrl(file.path);
      } catch (err) {
        console.warn(`⚠️ Failed to load config: ${file.name}`, err);
      }
    }

    return tables;
  }

  private async buildTableConfigs(tables: Record<string, any>) {
    const configs: Record<string, any> = {};

    for (const [tableName, tableData] of Object.entries(tables)) {
      // Normalize table name
      const normalized = tableName.toLowerCase().replace(/\s+/g, '');
      configs[normalized] = {};

      // If tableData is an array of rows with columns
      if (Array.isArray(tableData)) {
        for (const row of tableData) {
          // Use first column (or explicitly "key" column) as key
          const keyColumn = Object.keys(row)[0];
          const key = row[keyColumn]
            ?.toString()
            .toLowerCase()
            .replace(/\s+/g, '');
          configs[normalized][key] = row;
        }
      } else {
        // Fallback if it's just an object config (like your material.json)
        configs[normalized] = tableData;
      }
    }
    return configs;
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
        `❌ Failed to identify productSequence for "${item.description}":`,
        error
      );
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

  // private evaluateFormulasUnified(
  //   formulas: Record<string, string>,
  //   context: Record<string, any>
  // ) {
  //   const cache: Record<string, any> = {};
  //   const parser = new Parser();

  //   // 🔹 Add custom functions
  //   parser.functions.ifelse = (cond: any, a: any, b: any) => (cond ? a : b);

  //   const allFormulas: Record<string, string> = {
  //     ...formulas,
  //     ...context.sequenceFormulas,
  //   };

  //   const evaluateExpression = (expr: string): any => {
  //     if (!expr) return '';

  //     // 🔹 Handle array expansion like "printingDetails[]"
  //     const arrayMatch = expr.match(/^(.*)\[\]$/);
  //     if (arrayMatch) {
  //       const arrKey = arrayMatch[1].trim();
  //       const arrValue = context[arrKey];
  //       if (!Array.isArray(arrValue)) {
  //         console.warn(`⚠️ Expected array for ${arrKey} but got`, arrValue);
  //         return [];
  //       }
  //       return arrValue;
  //     }

  //     // 🔹 Handle ${...} string interpolations
  //     if (/\$\{[^}]+\}/.test(expr)) {
  //       return expr.replace(/\$\{([^}]+)\}/g, (_, varName) => {
  //         const val = resolve(varName) ?? context[varName] ?? '';
  //         return val?.toString?.() ?? '';
  //       });
  //     }

  //     // 🔹 Always concatenate with "x" or "," (even if more than 2 parts)
  //     const separators = [' x ', ' , '];
  //     for (const sep of separators) {
  //       if (expr.includes(sep)) {
  //         const parts = expr.split(sep).map((p) => p.trim());
  //         const evaluated = parts.map((p) => resolve(p) ?? context[p] ?? '');
  //         return evaluated.join(sep);
  //       }
  //     }

  //     // // 🔹 Handle "+" (string concat or numeric add)
  //     // if (expr.includes('+')) {
  //     //   const parts = expr.split('+').map((p) => p.trim());
  //     //   const resolved = parts.map((p) => {
  //     //     if (/^\d+(\.\d+)?$/.test(p)) return Number(p);
  //     //     return resolve(p) ?? context[p] ?? '';
  //     //   });
  //     //   const isString = resolved.some((v) => typeof v === 'string');
  //     //   return isString
  //     //     ? resolved.join(' ')
  //     //     : resolved.reduce((a, b) => a + b, 0);
  //     // }

  //     // 🔹 Otherwise, evaluate as math
  //     try {
  //       return parser.evaluate(expr, { ...context, ...cache });
  //     } catch {
  //       return context[expr] ?? expr;
  //     }
  //   };

  //   // todo: fix execution order of variables to variable dependencies
  //   const resolve = (key: string): any => {
  //     if (cache[key] !== undefined) return cache[key];

  //     const expr = allFormulas[key];
  //     if (!expr) {
  //       const val = context[key];
  //       cache[key] = typeof val === 'number' ? val : val ?? '';
  //       return cache[key];
  //     }
  //     const value = evaluateExpression(expr);
  //     cache[key] = value;
  //     return value;
  //   };

  //   // 🔹 Evaluate all formulas
  //   for (const key of Object.keys(allFormulas)) {
  //     resolve(key);
  //   }

  //   return cache;
  // }

  private evaluateFormulasUnified(
    formulas: Record<string, string>,
    context: Record<string, any>
  ) {
    const cache: Record<string, any> = {};
    const visiting = new Set<string>();
    const parser = new Parser();

    // custom function used in some sequences
    parser.functions.ifelse = (cond: any, a: any, b: any) => (cond ? a : b);

    const allFormulas: Record<string, string> = {
      ...formulas,
      ...(context?.sequenceFormulas || {}),
    };

    // for (const key in allFormulas) {
    //   let formula = allFormulas[key];
    //   formula = formula.replace(/\bifelse\s*\(/g, 'ifelse(');
    //   allFormulas[key] = formula;
    // }

    console.log(allFormulas);

    const escapeRegExp = (s: string) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const formatForReplacement = (val: any): string => {
      if (val === null || val === undefined) return '""';
      if (typeof val === 'string') return JSON.stringify(val); // keep quotes
      if (typeof val === 'object') return JSON.stringify(val);
      // number / boolean
      return String(val);
    };

    const evaluateMathOrResolve = (expr: string): any => {
      // Try to evaluate with resolved variable map first
      try {
        const ids = Array.from(
          new Set((expr.match(/[A-Za-z_]\w*/g) || []).filter(Boolean))
        );

        const vars: Record<string, any> = {};
        for (const id of ids) {
          // skip parser function names
          if (
            parser.functions &&
            Object.prototype.hasOwnProperty.call(parser.functions, id)
          )
            continue;
          if (
            allFormulas[id] !== undefined ||
            context?.hasOwnProperty(id) ||
            cache.hasOwnProperty(id)
          ) {
            vars[id] = resolve(id);
          }
        }

        const scope = { ...context, ...cache, ...vars };
        return parser.evaluate(expr, scope);
      } catch (e) {
        // fallback: replace identifiers with literal values and re-evaluate
        const ids = Array.from(
          new Set((expr.match(/[A-Za-z_]\w*/g) || []).filter(Boolean))
        );
        let replaced = expr;
        for (const id of ids) {
          if (
            parser.functions &&
            Object.prototype.hasOwnProperty.call(parser.functions, id)
          )
            continue;
          let val: any;
          if (cache.hasOwnProperty(id)) val = cache[id];
          else if (allFormulas[id] !== undefined) {
            try {
              val = resolve(id);
            } catch {
              val = undefined;
            }
          } else if (context?.hasOwnProperty(id)) val = context[id];

          if (val === undefined) continue;
          const literal = formatForReplacement(val);
          replaced = replaced.replace(
            new RegExp(`\\b${escapeRegExp(id)}\\b`, 'g'),
            literal
          );
        }

        try {
          return parser.evaluate(replaced, { ...context, ...cache });
        } catch {
          // Last fallback: return replaced string (useful for "a x b" style that wasn't parsed)
          return replaced;
        }
      }
    };

    const evaluateExpression = (expr: string): any => {
      if (expr === undefined || expr === null) return '';

      expr = String(expr).trim();
      if (expr === '') return '';

      // 1) array expansion like "printingDetails[]"
      const arrayMatch = expr.match(/^(.*)\[\]$/);
      if (arrayMatch) {
        const arrKey = arrayMatch[1].trim();
        // prefer cache, then context, then try resolving as formula
        const arrVal = cache[arrKey] ?? context?.[arrKey];
        if (Array.isArray(arrVal)) return arrVal;
        if (allFormulas[arrKey] !== undefined) {
          const resolved = resolve(arrKey);
          if (Array.isArray(resolved)) return resolved;
        }
        console.warn(`⚠️ Expected array for ${arrKey} but got`, arrVal);
        return [];
      }

      // 2) ${...} interpolation (allow expressions inside)
      if (/\$\{[^}]+\}/.test(expr)) {
        return expr.replace(/\$\{([^}]+)\}/g, (_, inner) => {
          try {
            const val = evaluateMathOrResolve(inner);
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return JSON.stringify(val);
            return String(val);
          } catch {
            return '';
          }
        });
      }

      // 3) explicit joins with " x " or " , "
      const separators = [' x ', ' , '];
      for (const sep of separators) {
        if (expr.includes(sep)) {
          const parts = expr.split(sep).map((p) => p.trim());
          const evaluated = parts.map((p) => {
            // if part is a formula/key, resolve it; otherwise try context
            const v =
              allFormulas[p] !== undefined
                ? resolve(p)
                : cache[p] ?? context?.[p];
            return v === undefined || v === null ? '' : String(v);
          });
          return evaluated.join(sep);
        }
      }

      // 4) otherwise try math/expr-eval, with recursive resolution
      return evaluateMathOrResolve(expr);
    };

    const resolve = (key: string): any => {
      if (cache.hasOwnProperty(key)) return cache[key];

      if (visiting.has(key)) {
        throw new Error(`Circular formula dependency detected for key: ${key}`);
      }
      visiting.add(key);

      const expr = allFormulas[key];
      let value: any;
      if (expr === undefined) {
        // fallback to context value (preserve numbers)
        const val = context?.[key];
        value = typeof val === 'number' ? val : val ?? '';
      } else {
        value = evaluateExpression(expr);
      }

      visiting.delete(key);
      cache[key] = value;
      return value;
    };

    // Evaluate/populate all formula keys (so cache contains everything)
    for (const key of Object.keys(allFormulas)) {
      try {
        resolve(key);
      } catch (err: any) {
        // keep going but mark error in cache so templates can see it
        console.error(err);
        cache[key] = `#ERROR: ${err?.message ?? String(err)}`;
      }
    }

    return cache;
  }
}
