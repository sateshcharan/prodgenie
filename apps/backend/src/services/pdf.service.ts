import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

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

    // Find the BOM table
    const bomTable = tables.find((table: any[][]) => {
      if (table && table.length > 0) {
        const header = table[0].map((x) => (x || '').toLowerCase());
        return (
          header.includes('sl no.') &&
          header.includes('description') &&
          header.includes('qty.')
        );
      }
      return false;
    });

    const bom: ParsedPdf['bom'] = [];

    if (bomTable) {
      const [headerRow, ...dataRows] = bomTable;
      for (const row of dataRows) {
        if (row && row.length >= 9) {
          bom.push({
            slNo: row[0],
            description: row[1],
            material: row[2],
            specification: row[3],
            ectBs: row[4],
            length: row[5],
            width: row[6],
            height: row[7],
            qty: row[8],
          });
        }
      }
    }

    // Extract title block info from text
    const titleBlock: ParsedPdf['titleBlock'] = {};

    const lines = text
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string | any[]) => line.length > 0);

    for (const line of lines) {
      if (line.toLowerCase().includes('customer name')) {
        titleBlock.customerName = line.split(':').pop()?.trim();
      }
      if (line.toLowerCase().includes('dwg no')) {
        titleBlock.drawingNumber = line.split(':').pop()?.trim();
      }
      if (line.toLowerCase().includes('scale')) {
        titleBlock.scale = line.split(':').pop()?.trim();
      }
      if (line.toLowerCase().includes('product detail')) {
        const nextLine = lines[lines.indexOf(line) + 1] || '';
        titleBlock.productTitle = nextLine.trim();
      }
      if (line.match(/\d{2}-\d{2}-\d{4}/)) {
        // Date like 05-03-2025
        titleBlock.date = line.trim();
      }
    }

    return {
      bom,
      titleBlock,
    };
  }

  async generatePDF(
    htmlContent: string,
    fileId: string,
    item: JobCardItem
  ): Promise<string> {
    const dirPath = path.join('./tmp/jobcards', fileId);
    const outputPath = path.join(dirPath, `${item.description}.pdf`);

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
        margin: { top: '5mm', bottom: '5mm', left: '10mm', right: '10mm' },
      });

      return outputPath;
    } finally {
      await browser.close();
    }
  }
}
