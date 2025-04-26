import pdf from 'pdf-parse';
import { supabase } from '@prodgenie/libs/supabase';

export class PdfService {
  private readonly bucketName = process.env.BUCKET ?? '';

  static async downloadPdfFromStorage(
    bucket: string,
    path: string
  ): Promise<Buffer> {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) {
      throw new Error(`Failed to download PDF from storage: ${error?.message}`);
    }
    const buffer = Buffer.from(await data.arrayBuffer());
    return buffer;
  }

  static async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    const data = await pdf(pdfBuffer);
    console.log(data);
    return data.text;
  }

  static async extractTablesFromText(text: string): Promise<any[]> {
    // Very naive example - this needs to be customized for your PDF structure
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    const tables: any[] = [];
    let currentTable: string[][] = [];
    lines.forEach((line) => {
      const columns = line.split(/\s{2,}/); // split by multiple spaces
      if (columns.length > 1) {
        currentTable.push(columns);
      } else if (currentTable.length) {
        tables.push(currentTable);
        currentTable = [];
      }
    });
    if (currentTable.length) {
      tables.push(currentTable);
    }
    return tables;
  }

  static async parsePdf(signedUrl: string) {
    const response = await fetch(signedUrl, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const blob = await response.blob();
    const pdfBuffer = Buffer.from(await blob.arrayBuffer());
    const text = await this.extractTextFromPdf(pdfBuffer);
    const tables = await this.extractTablesFromText(text);
    return tables;
  }
}
