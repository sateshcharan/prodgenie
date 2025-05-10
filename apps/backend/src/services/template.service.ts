import fs from 'fs/promises';
import path from 'path';

interface JobCardItem {
  description: string;
  qty: number;
  drgPartNo: string;
  poNumber: string;
  preparedBy: string;
  scheduledDate: string;
}

export class TemplateService {
  async injectValues(templatePath: string, item: JobCardItem): Promise<string> {
    const defaultValues = {
      customer: 'ABC Corp',
      jobNumber: jobCardData.jobCardNumber,
      date: '2025-04-28',
      description: 'Fabrication of metal frame',
      quantity: '12',
      partNumber: 'DRW-67890',
      poNumber: 'PO-5555',
      preparedBy: 'John Doe',
      scheduledDate: '2025-05-05',
      companyName: 'BSP CHENNAI',
    };

    try {
      const absolutePath = path.resolve(templatePath);
      const templateContent = await fs.readFile(absolutePath, 'utf-8');
      const populated = templateContent.replace(/{{(.*?)}}/g, (_, key) => {
        const value =
          item[key.trim() as keyof JobCardItem] ||
          defaultValues[key.trim() as keyof typeof defaultValues];
        return value ?? '';
      });
      return populated;
    } catch (error) {
      console.error(`Error reading template: ${error}`);
      return '';
    }
  }

  async combineTemplates(templates: string[]): Promise<string> {
    // Join all populated templates
    const combined = templates.join();

    // Wrap in a basic HTML structure
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Combined Job Cards</title>
          <style>
            body { font-family: Calibri, sans-serif; margin: 0; padding: 0; }
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid #000; padding: 4px; }
          </style>
        </head>
        <body>
          ${combined}
        </body>
      </html>
    `;
  }
}
