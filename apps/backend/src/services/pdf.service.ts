import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { PDFDocument, degrees } from 'pdf-lib';
import axios from 'axios';

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
  printingDetails?: {
    detail: string;
    color: string;
    location: string;
  }[];
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

  // local setup
  private static async runPythonParser(signedUrl: string): Promise<any> {
    const scriptPath = path.join(
      __dirname,
      '../../../apps/pdf-parser/pdfParse.py'
    );
    // const pythonPath = path.join(
    //   __dirname,
    //   '../../../apps/pdf-parser/venv/bin/python'
    // );
    const pythonPath = '/opt/venv/bin/python';

    return new Promise((resolve, reject) => {
      const python = spawn(pythonPath, [scriptPath, signedUrl]);
      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
        // console.log(stdout);
      });
      python.stderr.on('data', (data) => {
        stderr += data.toString();
        // console.log(stderr);
      });

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

  // microservice setup
  // private static async runPythonParser(signedUrl: string): Promise<any> {
  //   try {
  //     const response = await axios.post(
  //       process.env.RENDER_PY_URL!,
  //       { url: signedUrl },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         timeout: 15000, // Optional: 15s timeout to prevent hanging
  //       }
  //     );
  //     return response.data;
  //   } catch (error: any) {
  //     throw new Error(
  //       `Failed to call Python service: ${
  //         error.response?.data || error.message
  //       }`
  //     );
  //   }
  // }

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
      printingDetails: this.extractPrintingDetails(text),
    };
  }

  private static extractBomTable(tables: any[], config: any): JobCardItem[] {
    const {
      bom: { header: expectedHeaders, required: requiredHeaders },
    } = config;
    const stringService = new StringService();

    const bomTable = tables.find((table: any[][]) =>
      table.some((row) => {
        console.log(table);
        // const normalized = row.map((cell) => (cell || '').toLowerCase().trim());
        const normalized = row.map((cell) =>
          // return cell.toLowerCase().trim() || '';
          typeof cell === 'string' ? cell.toLowerCase().trim() : ''
        );

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
          // item.length < 50 && item.includes(normalizedHeader)
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

  private static extractPrintingDetails(text: string) {
    const pattern =
      /Printing Detail\s*:\s*(.+?)\s*[\r\n]+Printing Colour\s*:\s*(.+?)\s*[\r\n]+Printing Location\s*:\s*(.+?)(?=\r?\n|$)/g;

    const matches = [];
    let match;

    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        detail: match[1].trim(),
        color: match[2].trim(),
        location: match[3].trim(),
      });
    }

    return matches;
  }

  async generatePDF(htmlContent: string, jobCardNo: string): Promise<string> {
    const dirPath = path.join('./tmp/jobcards', jobCardNo);
    const outputPath = path.join(dirPath, `${jobCardNo}.pdf`);
    const drawingPath = path.join('./tmp/drawing.pdf');

    // Ensure the directory exists
    await fs.mkdir(dirPath, { recursive: true });

    const browser = await puppeteer.launch();
    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
      });
    } finally {
      await browser.close();
    }

    // Merge with drawing.pdf if it exists
    try {
      if (existsSync(drawingPath)) {
        const jobCardPdf = await PDFDocument.load(
          await fs.readFile(outputPath)
        );
        const drawingPdf = await PDFDocument.load(
          await fs.readFile(drawingPath)
        );

        const mergedPdf = await PDFDocument.create();

        const jobCardPages = await mergedPdf.copyPages(
          jobCardPdf,
          jobCardPdf.getPageIndices()
        );
        jobCardPages.forEach((page) => mergedPdf.addPage(page));

        const drawingPages = await mergedPdf.copyPages(
          drawingPdf,
          drawingPdf.getPageIndices()
        );
        drawingPages.forEach((page) => {
          const { width, height } = page.getSize();
          if (width > height) {
            page.setRotation(degrees(90));
          }
          mergedPdf.addPage(page);
        });

        await fs.writeFile(outputPath, await mergedPdf.save());
      } else {
        console.warn(`Drawing not appended: File not found at ${drawingPath}`);
      }
    } catch (err: any) {
      console.warn('Error merging drawing:', err.message);
    }

    return outputPath;
  }
}
