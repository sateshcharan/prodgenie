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
  static async extractPdfData(signedUrl: string, user: any): Promise<any> {
    const pythonScript = path.join(
      __dirname,
      '../../../apps/pdf-parser/pdfParse.py'
    );
    const pythonExecutable = path.resolve(
      __dirname,
      '../../../apps/pdf-parser/venv/bin/python'
    );

    const parsedPdf = new Promise((resolve, reject) => {
      let stdoutData = '';
      let stderrData = '';

      const python = spawn(pythonExecutable, [pythonScript, signedUrl]);

      python.stdout.on('data', (data) => {
        stdoutData += data.toString();
        // console.log(data.toString());
      });

      python.stderr.on('data', (data) => {
        stderrData += data.toString();
        // console.error(data.toString());
      });

      python.on('close', (code) => {
        if (code === 0) {
          try {
            const parsedOutput = JSON.parse(stdoutData);
            resolve(parsedOutput);
          } catch (err) {
            reject('Failed to parse Python JSON: ' + err);
          }
        } else {
          reject('Python script failed: ' + (stderrData || 'Unknown error'));
        }
      });
    });

    const crudService = new CrudService();
    const onboardingCongig = await crudService.fetchJsonFromSignedUrl(
      `${user?.org?.name}/config/onboarding.json`
    );

    const tables = this.processParsedPdf(await parsedPdf, onboardingCongig);
    return tables;
  }

  static processParsedPdf(data: any, onboardingCongig: any): ParsedPdf {
    const tables = data.tables;
    const text = data.text;

    const expectedBomHeaders = onboardingCongig.bom.header;
    const requiredBomHeaders = onboardingCongig.bom.required;
    const titleBlockHeaders = onboardingCongig.titleBlock.header;

    const stringService = new StringService();

    // console.log(tables);

    const bomTable = tables.find((table: any[][]) => {
      if (!Array.isArray(table)) return false;

      for (const row of table) {
        if (!Array.isArray(row)) continue;
        const header = row.map((x) => (x || '').toLowerCase().trim());

        const matchesAll = requiredBomHeaders.every((required) =>
          header.includes(required)
        );

        if (matchesAll) return true;
      }

      return false;
    });

    const bom: ParsedPdf['bom'] = [];

    if (bomTable) {
      // Find the actual header row index inside bomTable
      const headerIndex = bomTable.findIndex((row: string[]) => {
        if (!Array.isArray(row)) return false;
        const header = row.map((x) => (x || '').toLowerCase().trim());
        return requiredBomHeaders.every((required) =>
          header.includes(required)
        );
      });

      if (headerIndex >= 0) {
        const headerRow = bomTable[headerIndex];

        // Create a mapping of header names to their respective column indexes
        const headerMapping: { [key: string]: number } = {};
        headerRow.forEach((header: string, index: number) => {
          headerMapping[stringService.camelCase(header)] = index;
        });

        const dataRows = bomTable.slice(headerIndex + 1);

        for (const row of dataRows) {
          if (Array.isArray(row) && row.length >= headerRow.length) {
            const bomEntry: Record<string, string> = {};

            expectedBomHeaders.forEach((header) => {
              bomEntry[header] = row[headerMapping[header]] || '';
            });

            bom.push(bomEntry);
          }
        }
      }
    }

    // Extract title block info from text
    const titleBlock: ParsedPdf['titleBlock'] = {};

    const lines = text
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string | any[]) => line.length > 0);

    // console.log(lines);

    for (const header of titleBlockHeaders) {
      const line = lines.find((line: any) =>
        line.toLowerCase().includes(stringService.camelToNormal(header))
      );
      if (line) {
        titleBlock[header as keyof ParsedPdf['titleBlock']] = line
          .split(':')
          .pop()
          ?.trim();
      }
    }

    // const titleBlockKeywords = [
    //   'drawing no',
    //   'dwg no',
    //   'scale',
    //   'sheet',
    //   'revision',
    //   'date',
    //   'approved',
    //   'checked',
    //   'name',
    //   'signature',
    //   'product detail',
    //   'customer name',
    // ];

    // const titleBlockTable = tables.find((table: any[][]) => {
    //   if (!Array.isArray(table)) return false;
    //   for (const row of table) {
    //     if (!Array.isArray(row)) continue;
    //     const joined = row.map((x) => (x || '').toLowerCase()).join(' ');
    //     const matches = titleBlockKeywords.some((keyword) =>
    //       joined.includes(keyword)
    //     );
    //     if (matches) return true;
    //   }
    //   return false;
    // });

    // const titleBlock: Record<string, string> = {};

    // if (titleBlockTable) {
    //   for (const row of titleBlockTable) {
    //     if (!Array.isArray(row)) continue;
    //     const joinedRow = row
    //       .map((cell) => (cell || '').trim().toLowerCase())
    //       .join(' ');
    //     if (joinedRow.includes('drawing no') || joinedRow.includes('dwg no')) {
    //       titleBlock.drawingNo = row.join(' ');
    //     }
    //     if (joinedRow.includes('scale')) {
    //       titleBlock.scale = row.join(' ');
    //     }
    //     if (joinedRow.includes('sheet')) {
    //       titleBlock.sheet = row.join(' ');
    //     }
    //     if (joinedRow.includes('revision')) {
    //       titleBlock.revision = row.join(' ');
    //     }
    //     if (joinedRow.includes('customer name')) {
    //       titleBlock.customerName = row.join(' ');
    //     }
    //     if (joinedRow.includes('product detail')) {
    //       titleBlock.productDetail = row.join(' ');
    //     }
    //     if (joinedRow.includes('approved') || joinedRow.includes("appv'd")) {
    //       titleBlock.approved = row.join(' ');
    //     }
    //     if (joinedRow.includes('checked') || joinedRow.includes("chk'd")) {
    //       titleBlock.checked = row.join(' ');
    //     }
    //     if (joinedRow.includes("genert'd")) {
    //       titleBlock.generated = row.join(' ');
    //     }
    //     if (joinedRow.includes('name') && joinedRow.includes('signature')) {
    //       titleBlock.signatures = row.join(' ');
    //     }
    //   }
    // }

    // console.log(titleBlock);

    return {
      bom,
      titleBlock,
    };
  }

  async generatePDF(htmlContent: string, jobCardNo: string): Promise<string> {
    const dirPath = path.join('./tmp/jobcards', jobCardNo);
    const outputPath = path.join(dirPath, `${jobCardNo}.pdf`);

    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });

    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      // Set HTML content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Generate PDF
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
