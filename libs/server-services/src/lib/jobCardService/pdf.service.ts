import fs from 'fs/promises';
import { existsSync } from 'fs';
// import path, { parse } from 'path';
import path from 'path';
import puppeteer from 'puppeteer';
// import { spawn } from 'child_process';
import { PDFDocument, degrees } from 'pdf-lib';

// import { JobCardItem } from '@prodgenie/libs/types';
// import { StringService } from '@prodgenie/libs/shared-utils';

import { PuppeteerService } from '../puppeteer.service.js';
import { FileHelperService } from '../fileHelper.service.js';

// interface ParsedPdf {
//   bom: JobCardItem[];
//   titleBlock: {
//     customerName?: string;
//     drawingNumber?: string;
//     revision?: string;
//     scale?: string;
//     date?: string;
//     productTitle?: string;
//   };
//   printingDetails?: any;
// }

export class PdfService {
  private static fileHelperService = new FileHelperService();
  // private static stringService = new StringService();
  private static puppeteerService = new PuppeteerService();

  static async extractPdfData(signedUrl: string, user: any): Promise<any> {
    // const config = await this.loadOrgConfig(user);
    await this.loadOrgConfig(user);
    const drawingFile = await this.fileHelperService.downloadToTemp(
      signedUrl,
      'drawing.pdf'
    );

    //local stratergy
    // const parsedData = await this.runPythonParser(signedUrl);
    // return this.processParsedPdf(parsedData, config);

    // llm stratergy
    return await this.puppeteerService.extractFromChatGPT(drawingFile);
  }

  // local setup
  // private static async runPythonParser(signedUrl: string): Promise<any> {
  //   const scriptPath = path.join(
  //     __dirname,
  //     '../../../apps/pdf-parser/pdfParse.py'
  //   );
  //   const pythonPath = path.join(
  //     __dirname,
  //     '../../../apps/pdf-parser/venv/bin/python'
  //   );

  //   // for dockerized setup
  //   // const pythonPath = '/opt/venv/bin/python3';

  //   return new Promise((resolve, reject) => {
  //     const python = spawn(pythonPath, [scriptPath, signedUrl]);

  //     let stdout = '';
  //     let stderr = '';

  //     python.stdout.on('data', (data) => {
  //       stdout += data.toString();
  //       // console.log(stdout);
  //     });
  //     python.stderr.on('data', (data) => {
  //       stderr += data.toString();
  //       // console.log(stderr);
  //     });

  //     python.on('close', (code) => {
  //       if (code === 0) {
  //         try {
  //           resolve(JSON.parse(stdout));
  //         } catch (err) {
  //           reject(`JSON parse error: ${err}`);
  //         }
  //       } else {
  //         reject(`Python script error: ${stderr || 'Unknown error'}`);
  //       }
  //     });
  //   });
  // }

  private static async loadOrgConfig(user: any): Promise<any> {
    // const fileHelperService = new FileHelperService();
    const setupConfig: Record<string, any> = {};

    const onboardingConfig =
      await this.fileHelperService.fetchJsonFromSignedUrl(
        `${user?.org?.name}/config/onboarding.json`
      );

    Object.entries(onboardingConfig.setup).forEach(([key, value]) => {
      setupConfig[`${key}Config`] = value;
    });

    return {
      ...setupConfig,
    };
  }

  // private static processParsedPdf(data: any, config: any): ParsedPdf {
  //   function cleanTable(table: any): any {
  //     if (Array.isArray(table)) {
  //       const cleaned = table
  //         .map(cleanTable)
  //         .filter(
  //           (row) =>
  //             !(
  //               Array.isArray(row) &&
  //               row.every((cell) => cell === null || cell === '')
  //             ) &&
  //             row !== null &&
  //             row !== ''
  //         );
  //       return cleaned;
  //     }
  //     return table;
  //   }

  //   const text = data.text;
  //   const tables = data.tables.map(cleanTable);

  //   return {
  //     bom: this.extractBomFromTables(tables, config.bomConfig),
  //     titleBlock: this.extractTitleBlockFromTables(
  //       tables,
  //       config.titleBlockConfig
  //     ),
  //     printingDetails: this.extractPrintingDetails(
  //       text,
  //       config.printingDetailConfig
  //     ),
  //   };
  // }

  // private static extractBomFromTables(
  //   tables: any[][][],
  //   config: any
  // ): JobCardItem[] {
  //   const {
  //     header: { expected: expectedHeaders, required: requiredHeaders },
  //   } = config;
  //   const stringService = new StringService();

  //   const MATCH_THRESHOLD = 0.75;

  //   let bestTable: any[][] = [];
  //   let bestHeaderRowIndex = -1;
  //   let bestScore = 0;

  //   // const normalize = (input: any) =>
  //   //   input.toLowerCase().replace(/\s+/g, ' ').trim();

  //   tables.forEach((table, tableIndex) => {
  //     if (!Array.isArray(table) || table.length === 0) return;

  //     let tableBestScore = 0;
  //     let tableBestHeaderIndex = -1;

  //     table.forEach((row, rowIndex) => {
  //       if (!Array.isArray(row) || row.length < 2) {
  //         // console.log(`⚠️ Skipping row ${rowIndex}: too few columns`);
  //         return;
  //       }

  //       if ((row[0] || '').toString().length > 100) {
  //         // console.log(`⚠️ Skipping row ${rowIndex}: first cell too long`);
  //         return;
  //       }

  //       const normalizedHeaders = row[0].map((title: string) =>
  //         this.stringService.camelCase(title)
  //       );

  //       let matchCount = 0;

  //       requiredHeaders.forEach((required: string) => {
  //         const scores = normalizedHeaders.map((cell: string) =>
  //           this.stringService.similarityScore(required, cell)
  //         );
  //         const maxScore = Math.max(...scores);
  //         if (maxScore >= MATCH_THRESHOLD) matchCount++;
  //       });

  //       const score = matchCount / requiredHeaders.length;

  //       if (score > tableBestScore) {
  //         tableBestScore = score;
  //         tableBestHeaderIndex = rowIndex;
  //       }
  //     });

  //     // Now update global best if this table is better
  //     if (tableBestScore > bestScore) {
  //       bestScore = tableBestScore;
  //       bestTable = table;
  //       bestHeaderRowIndex = tableBestHeaderIndex;
  //     }
  //   });

  //   const bom = bestTable[bestHeaderRowIndex].slice(1).map((row) => {
  //     return expectedHeaders.reduce((obj, header, i) => {
  //       obj[header] = row[i];
  //       return obj;
  //     }, {});
  //   });

  //   return bom;
  // }

  // private static extractTitleBlockFromTables(
  //   tables: any[][],
  //   config: any
  // ): ParsedPdf['titleBlock'] {
  //   const {
  //     header: { expected: expectedHeaders, required: requiredHeaders },
  //   } = config;
  //   // const stringService = new StringService();

  //   const titleBlock: ParsedPdf['titleBlock'] = {};

  //   const temp: any[] = [];

  //   // Flatten and collect all non-empty strings from table rows
  //   for (const table of tables) {
  //     if (!Array.isArray(table)) continue;

  //     for (const row of table) {
  //       if (Array.isArray(row)) {
  //         temp.push(...row.filter(Boolean));
  //       }
  //     }
  //   }

  //   // Match each header against flattened rows
  //   for (const header of expectedHeaders) {
  //     const normalizedHeader = this.stringService
  //       .camelToNormal(header)
  //       .toLowerCase();

  //     const matchedRow = temp.find(
  //       (row) =>
  //         Array.isArray(row) &&
  //         row
  //           .filter(
  //             (cell): cell is string =>
  //               typeof cell === 'string' && cell.trim() !== ''
  //           )
  //           .some(
  //             (cell) =>
  //               cell.length < 50 &&
  //               cell.toLowerCase().includes(normalizedHeader)
  //           )
  //     );

  //     if (matchedRow) {
  //       // Flatten and clean the row before processing
  //       const flatRow = matchedRow.filter(
  //         (cell: string): cell is string =>
  //           typeof cell === 'string' && cell.trim() !== ''
  //       );

  //       // Find the matching cell again to extract the value
  //       const matchingCell = flatRow.find((cell: string) =>
  //         cell.toLowerCase().includes(normalizedHeader)
  //       );

  //       if (matchingCell) {
  //         const parts = matchingCell.split(/[:.]/);
  //         const value =
  //           parts.length > 1
  //             ? parts.slice(1).join(':').trim()
  //             : matchingCell.trim();
  //         titleBlock[header as keyof ParsedPdf['titleBlock']] = value;
  //       }
  //     }
  //   }

  //   return titleBlock;
  // }

  // private static extractPrintingDetails(text: string, config: any) {
  //   const {
  //     header: { expected: expectedHeaders, required: requiredHeaders },
  //   } = config;
  //   const matches = [];
  //   let match;

  //   const pattern = this.buildRegexFromHeaders(expectedHeaders);

  //   while ((match = pattern.exec(text)) !== null) {
  //     const entry: Record<string, string> = {};
  //     expectedHeaders.forEach(
  //       (header, index) => (entry[header] = match[index + 1] || '')
  //     );
  //     matches.push(entry);
  //   }
  //   return matches;
  // }

  // private static buildRegexFromHeaders(headers: string[]): RegExp {
  //   const fieldPattern = headers
  //     .map((field) => {
  //       // Convert camelCase to spaced Title Case for matching, e.g., printingDetail -> Printing Detail
  //       const label = field
  //         .replace(/([A-Z])/g, ' $1')
  //         .replace(/^./, (c) => c.toUpperCase());
  //       return `${label}\\s*:\\s*(.+?)\\s*`;
  //     })
  //     .join('[\\r\\n]+');

  //   return new RegExp(`${fieldPattern}(?=\\r?\\n|$)`, 'g');
  // }

  // private static extractFromTable(tables: any[][], config: any) {
  //   return [];
  // }

  // private static extractFromText(text: any, config: any) {
  //   return [];
  // }

  async generatePDF(htmlContent: string, jobCardNo: string): Promise<string> {
    const dirPath = path.join('./tmp/jobcards', jobCardNo);
    const outputPath = path.join(dirPath, `${jobCardNo}.pdf`);
    const drawingPath = path.join('./tmp/drawing.pdf');

    // Ensure the directory exists
    await fs.mkdir(dirPath, { recursive: true });

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
      ],
    });
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

        const A4_WIDTH = 595.28;
        const A4_HEIGHT = 841.89;

        for (const page of drawingPages) {
          const { width, height } = page.getSize();
          const isLandscape = width > height;

          const embeddedPage = await mergedPdf.embedPage(page);

          let pageWidth = width;
          let pageHeight = height;
          // let rotationAngle = 0;

          if (isLandscape) {
            pageWidth = height;
            pageHeight = width;
            // rotationAngle = 90;
          }

          const scaleX = A4_WIDTH / pageWidth;
          const scaleY = A4_HEIGHT / pageHeight;
          const scale = Math.min(scaleX, scaleY);

          const scaledWidth = pageWidth * scale;
          const scaledHeight = pageHeight * scale;

          const xOffset = (A4_WIDTH - scaledWidth) / 2;
          const yOffset = (A4_HEIGHT - scaledHeight) / 2;

          const a4Page = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT]);

          a4Page.drawPage(embeddedPage, {
            x: isLandscape ? xOffset + scaledWidth : xOffset,
            y: yOffset,
            xScale: scale,
            yScale: scale,
            rotate: isLandscape ? degrees(90) : undefined,
          });
        }

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
