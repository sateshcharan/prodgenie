import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

import { StringService, CrudService } from '../utils/index.js';
import { JobCardItem } from '@prodgenie/libs/types';

interface ParsedPdf {
  bom: JobCardItem[];
  titleBlock: {
    customerName?: string;
    drawingNumber?: string;
    revision?: string;
    scale?: string;
    date?: string;
    productTitle?: string;
  };
}

export class PdfService {
  static async extractPdfData(
    signedUrl: string,
    user: any
  ): Promise<ParsedPdf> {
    const parsedData = await this.runPythonParser(signedUrl);
    const config = await this.loadOrgConfig(user);

    return this.processParsedPdf(parsedData, config);
  }

  private static async runPythonParser(signedUrl: string): Promise<any> {
    const scriptPath = path.join(
      __dirname,
      '../../../apps/pdf-parser/pdfParse.py'
    );
    const pythonPath = path.join(
      __dirname,
      '../../../apps/pdf-parser/venv/bin/python'
    );

    return new Promise((resolve, reject) => {
      const python = spawn(pythonPath, [scriptPath, signedUrl]);
      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => (stdout += data.toString()));
      python.stderr.on('data', (data) => (stderr += data.toString()));

      python.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(stdout));
          } catch (err) {
            reject(`JSON parse error: ${err}`);
          }
        } else {
          reject(`Python script error: ${stderr || 'Unknown error'}`);
        }
      });
    });
  }

  private static async loadOrgConfig(user: any): Promise<any> {
    const crudService = new CrudService();
    return crudService.fetchJsonFromSignedUrl(
      `${user?.org?.name}/config/onboarding.json`
    );
  }

  private static processParsedPdf(data: any, config: any): ParsedPdf {
    const tables = data.tables;
    const text = data.text;

    return {
      bom: this.extractBomTable(tables, config),
      // titleBlock: this.extractTitleBlock(text, config),
      titleBlock: this.extractTitleBlockFromTables(tables, config),
    };
  }

  private static extractBomTable(tables: any[], config: any): JobCardItem[] {
    const {
      bom: { header: expectedHeaders, required: requiredHeaders },
    } = config;
    const stringService = new StringService();

    const bomTable = tables.find((table: any[][]) =>
      table.some((row) => {
        const normalized = row.map((cell) => (cell || '').toLowerCase().trim());
        return requiredHeaders.every((req) => normalized.includes(req));
      })
    );

    if (!bomTable) return [];

    const headerIndex = bomTable.findIndex((row) => {
      const normalized = row.map((cell) => (cell || '').toLowerCase().trim());
      return requiredHeaders.every((req) => normalized.includes(req));
    });

    if (headerIndex < 0) return [];

    const headerRow = bomTable[headerIndex];
    const headerMap = Object.fromEntries(
      headerRow.map((cell, i) => [stringService.camelCase(cell), i])
    );

    return bomTable.slice(headerIndex + 1).map((row) => {
      const entry: Record<string, string> = {};
      expectedHeaders.forEach((header) => {
        entry[header] = row[headerMap[header]] || '';
      });
      // console.log(bomTable);
      return entry as JobCardItem;
    });
  }

  private static extractTitleBlock(
    text: string,
    config: any
  ): ParsedPdf['titleBlock'] {
    const headers = config.titleBlock.header;
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const stringService = new StringService();
    const titleBlock: ParsedPdf['titleBlock'] = {};

    for (const key of headers) {
      const line = lines.find((line) =>
        line.toLowerCase().includes(stringService.camelToNormal(key))
      );
      if (line) {
        titleBlock[key as keyof ParsedPdf['titleBlock']] = line
          .split(':')
          .pop()
          ?.trim();
      }
    }
    console.log(titleBlock);
    return titleBlock;
  }

  private static extractTitleBlockFromTables(
    tables: any[][],
    config: any
  ): ParsedPdf['titleBlock'] {
    const headers = config.titleBlock.header;
    const stringService = new StringService();
    const titleBlock: ParsedPdf['titleBlock'] = {};

    const temp: any[] = [];

    // Flatten and collect all non-empty strings from table rows
    for (const table of tables) {
      if (!Array.isArray(table)) continue;

      for (const row of table) {
        if (Array.isArray(row)) {
          temp.push(...row.filter(Boolean));
        }
      }
    }

    // Match each header against flattened rows
    for (const header of headers) {
      const normalizedHeader = stringService
        .camelToNormal(header)
        .toLowerCase();

      const matched = temp.find((item) => {
        return (
          item.length < 50 && item.toLowerCase().includes(normalizedHeader)
        );
      });

      if (matched) {
        // Split by either ':' or '.' using regex
        const parts = matched.split(/[:.]/);
        const value =
          parts.length > 1 ? parts.slice(1).join(':').trim() : matched.trim();
        titleBlock[header as keyof ParsedPdf['titleBlock']] = value;
      }
    }
    return titleBlock;
  }

  async generatePDF(htmlContent: string, jobCardNo: string): Promise<string> {
    const dirPath = path.join('./tmp/jobcards', jobCardNo);
    const outputPath = path.join(dirPath, `${jobCardNo}.pdf`);

    await fs.mkdir(dirPath, { recursive: true });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
      });
      return outputPath;
    } finally {
      await browser.close();
    }
  }
}
