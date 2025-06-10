import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { PDFDocument, degrees } from 'pdf-lib';
import axios, { head } from 'axios';

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
  printingDetails?: any;
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
    const pythonPath = path.join(
      __dirname,
      '../../../apps/pdf-parser/venv/bin/python'
    );

    // for dockerized setup
    // const pythonPath = '/opt/venv/bin/python3';

    return new Promise((resolve, reject) => {
      const python = spawn(pythonPath, [scriptPath, signedUrl]);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(stdout);
      });
      python.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log(stderr);
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

  private static async loadOrgConfig(user: any): Promise<any> {
    const crudService = new CrudService();
    const setupConfig: Record<string, any> = {};

    const onboardingConfig = await crudService.fetchJsonFromSignedUrl(
      `${user?.org?.name}/config/onboarding.json`
    );

    Object.entries(onboardingConfig.setup).forEach(([key, value]) => {
      setupConfig[`${key}Config`] = value;
    });

    return {
      ...setupConfig,
    };
  }

  private static processParsedPdf(data: any, config: any): ParsedPdf {
    function cleanTable(table: any): any {
      if (Array.isArray(table)) {
        const cleaned = table
          .map(cleanTable)
          .filter(
            (row) =>
              !(
                Array.isArray(row) &&
                row.every((cell) => cell === null || cell === '')
              ) &&
              row !== null &&
              row !== ''
          );
        return cleaned;
      }
      return table;
    }

    const text = data.text;
    const tables = data.tables.map(cleanTable);

    return {
      bom: this.extractBomFromTables(tables, config.bomConfig),
      titleBlock: this.extractTitleBlockFromTables(
        tables,
        config.titleBlockConfig
      ),
      printingDetails: this.extractPrintingDetails(
        text,
        config.printingDetailConfig
      ),
    };
  }

  // private static extractBomFromTables(
  //   tables: any[][],
  //   config: any
  // ): JobCardItem[] {
  //   const {
  //     header: { expected: expectedHeaders, required: requiredHeaders },
  //   } = config;
  //   const stringService = new StringService();

  //   const bomTable = tables.find((table: any[][]) => {
  //     console.log(table);
  //     return table.some((row) => {
  //       const normalized = row.map((cell) => (cell || '').toLowerCase().trim());
  //       return requiredHeaders.every((req) =>
  //         normalized.some((cell) => cell.includes(req.toLowerCase()))
  //       );
  //     });
  //   });

  //   if (!bomTable) return [];

  //   const headerIndex = bomTable.findIndex((row) => {
  //     const normalized = row.map((cell) => (cell || '').toLowerCase().trim());
  //     return requiredHeaders.every((req) => normalized.includes(req));
  //   });

  //   if (headerIndex < 0) return [];

  //   const headerRow = bomTable[headerIndex];
  //   const headerMap = Object.fromEntries(
  //     headerRow.map((cell, i) => [stringService.camelCase(cell), i])
  //   );

  //   return bomTable.slice(headerIndex + 1).map((row) => {
  //     const entry: Record<string, string> = {};
  //     expectedHeaders.forEach((header) => {
  //       entry[header] = row[headerMap[header]] || '';
  //     });
  //     return entry as JobCardItem;
  //   });
  // }

  private static extractBomFromTables(
    tables: any[][][],
    config: any
  ): JobCardItem[] {
    const {
      header: { expected: expectedHeaders, required: requiredHeaders },
    } = config;
    const stringService = new StringService();

    const MATCH_THRESHOLD = 0.75;

    let bestTable: any[][] = [];
    let bestHeaderRowIndex = -1;
    let bestScore = 0;

    // const normalize = (input: any) =>
    //   input.toLowerCase().replace(/\s+/g, ' ').trim();

    tables.forEach((table, tableIndex) => {
      if (!Array.isArray(table) || table.length === 0) return;

      let tableBestScore = 0;
      let tableBestHeaderIndex = -1;

      table.forEach((row, rowIndex) => {
        if (!Array.isArray(row) || row.length < 2) {
          // console.log(`⚠️ Skipping row ${rowIndex}: too few columns`);
          return;
        }

        if ((row[0] || '').toString().length > 100) {
          // console.log(`⚠️ Skipping row ${rowIndex}: first cell too long`);
          return;
        }

        const normalizedHeaders = row[0].map((title) =>
          stringService.camelCase(title)
        );

        let matchCount = 0;

        requiredHeaders.forEach((required) => {
          const scores = normalizedHeaders.map((cell) =>
            stringService.similarityScore(required, cell)
          );
          const maxScore = Math.max(...scores);
          if (maxScore >= MATCH_THRESHOLD) matchCount++;
        });

        const score = matchCount / requiredHeaders.length;

        if (score > tableBestScore) {
          tableBestScore = score;
          tableBestHeaderIndex = rowIndex;
        }
      });

      // console.log(
      //   `Table ${tableIndex} scored: ${(tableBestScore * 100).toFixed(2)}%`
      // );

      // Now update global best if this table is better
      if (tableBestScore > bestScore) {
        bestScore = tableBestScore;
        bestTable = table;
        bestHeaderRowIndex = tableBestHeaderIndex;
      }
    });

    // const headerRow = bestTable[bestHeaderRowIndex];

    // // Map expected headers to their best matching index using fuzzy matching
    // const headerMap: Record<string, number> = {};
    // expectedHeaders.forEach((expected) => {
    //   let bestMatchIndex = -1;
    //   let bestMatchScore = 0;

    //   headerRow.forEach((cell, index) => {
    //     const score = stringService.similarityScore(
    //       expected,
    //       stringService.camelCase(cell)
    //     );
    //     if (score > bestMatchScore) {
    //       bestMatchScore = score;
    //       bestMatchIndex = index;
    //     }
    //   });

    //   if (bestMatchScore >= MATCH_THRESHOLD) {
    //     headerMap[expected] = bestMatchIndex;
    //   }
    // });

    // Extract valid BOM rows after the header
    // const bomRows = bestTable
    //   .slice(bestHeaderRowIndex + 1)
    //   .filter(
    //     (row) =>
    //       Array.isArray(row) &&
    //       row.some((cell) => (cell || '').toString().trim() !== '')
    //   );

    // const bomItems = bomRows.map((row) => {
    //   const entry: Record<string, string> = {};
    //   expectedHeaders.forEach((header) => {
    //     const colIndex = headerMap[header];
    //     entry[header] =
    //     colIndex !== undefined ? (row[colIndex] || '').toString().trim() : '';
    //   });

    //   return entry as JobCardItem;
    // });

    // console.log(`✅ Extracted ${bomItems.length} BOM item(s)`);
    // return bomItems;

    const bom = bestTable[bestHeaderRowIndex].slice(1).map((row) => {
      return expectedHeaders.reduce((obj, header, i) => {
        obj[header] = row[i];
        return obj;
      }, {});
    });

    return bom;
  }

  private static extractTitleBlockFromTables(
    tables: any[][],
    config: any
  ): ParsedPdf['titleBlock'] {
    const {
      header: { expected: expectedHeaders, required: requiredHeaders },
    } = config;
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
    for (const header of expectedHeaders) {
      const normalizedHeader = stringService
        .camelToNormal(header)
        .toLowerCase();

      const matchedRow = temp.find(
        (row) =>
          Array.isArray(row) &&
          row
            .filter(
              (cell): cell is string =>
                typeof cell === 'string' && cell.trim() !== ''
            )
            .some(
              (cell) =>
                cell.length < 50 &&
                cell.toLowerCase().includes(normalizedHeader)
            )
      );

      if (matchedRow) {
        // Flatten and clean the row before processing
        const flatRow = matchedRow.filter(
          (cell): cell is string =>
            typeof cell === 'string' && cell.trim() !== ''
        );

        // Find the matching cell again to extract the value
        const matchingCell = flatRow.find((cell) =>
          cell.toLowerCase().includes(normalizedHeader)
        );

        if (matchingCell) {
          const parts = matchingCell.split(/[:.]/);
          const value =
            parts.length > 1
              ? parts.slice(1).join(':').trim()
              : matchingCell.trim();
          titleBlock[header as keyof ParsedPdf['titleBlock']] = value;
        }
      }
    }

    return titleBlock;
  }

  private static extractPrintingDetails(text: string, config: any) {
    const {
      header: { expected: expectedHeaders, required: requiredHeaders },
    } = config;
    const matches = [];
    let match;

    const pattern = this.buildRegexFromHeaders(expectedHeaders);

    while ((match = pattern.exec(text)) !== null) {
      const entry: Record<string, string> = {};
      expectedHeaders.forEach(
        (header, index) => (entry[header] = match[index + 1] || '')
      );
      matches.push(entry);
    }
    return matches;
  }

  private static buildRegexFromHeaders(headers: string[]): RegExp {
    const fieldPattern = headers
      .map((field) => {
        // Convert camelCase to spaced Title Case for matching, e.g., printingDetail -> Printing Detail
        const label = field
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (c) => c.toUpperCase());
        return `${label}\\s*:\\s*(.+?)\\s*`;
      })
      .join('[\\r\\n]+');

    return new RegExp(`${fieldPattern}(?=\\r?\\n|$)`, 'g');
  }

  private static extractFromTable(tables: any[][], config: any) {
    return [];
  }

  private static extractFromText(text: any, config: any) {
    return [];
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
