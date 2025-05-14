import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

import { JobCardItem } from '@prodgenie/libs/types';

import bomConfig from '../config/init.config.json';

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
  static async parsePdf(signedUrl: string): Promise<any> {
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

    const tables = this.processParsedPdf(await parsedPdf);
    return tables;
  }
  static processParsedPdf(data: any): ParsedPdf {
    const tables = data.tables;
    const text = data.text;
    const expectedBomHeaders = bomConfig.bom.header;
    const requiredBomHeaders = bomConfig.bom.required;
    const titleBlockHeaders = bomConfig.titleBlock;

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
          headerMapping[
            header
              .toLowerCase()
              .replace(/\./g, '')
              .replace(/\s+([a-z])/g, (_, char) => char.toUpperCase())
              .replace(/\s+/g, '')
          ] = index;
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

    console.log(lines);

    for (const line of lines) {
      if (
        titleBlockHeaders.some((header) => line.toLowerCase().includes(header))
      ) {
        titleBlock[header] = line.split(':').pop()?.trim();
      }

      // if (line.toLowerCase().includes('customer name')) {
      //   titleBlock.customerName = line.split(':').pop()?.trim();
      // }
      // if (line.toLowerCase().includes('dwg no')) {
      //   titleBlock.drawingNumber = line.split(':').pop()?.trim();
      // }
      // if (line.toLowerCase().includes('scale')) {
      //   titleBlock.scale = line.split(':').pop()?.trim();
      // }
      // if (line.toLowerCase().includes('product detail')) {
      //   const nextLine = lines[lines.indexOf(line) + 1] || '';
      //   titleBlock.productTitle = nextLine.trim();
      // }
      // if (line.match(/\d{2}-\d{2}-\d{4}/)) {
      //   // Date like 05-03-2025
      //   titleBlock.date = line.trim();
      // }
    }

    return {
      bom,
      titleBlock,
    };
  }

  async generatePDF(htmlContent: string, fileId: string): Promise<string> {
    const dirPath = path.join('./tmp/jobcards', fileId);
    const outputPath = path.join(dirPath, `${fileId}-${Date.now()}.pdf`);

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
