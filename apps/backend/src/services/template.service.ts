import fs from 'fs/promises';
import path from 'path';

export class TemplateService {
  async injectValues(templatePath: string, item: any): Promise<string> {
    try {
      const absolutePath = path.resolve(templatePath);
      const templateContent = await fs.readFile(absolutePath, 'utf-8');
      const populated = templateContent.replace(/{{(.*?)}}/g, (_, key) => {
        const value = item[key.trim()];
        return value;
      });
      return populated;
    } catch (error) {
      console.error(`Error reading template: ${error}`);
      return '';
    }
  }

  async combineTemplates(templates: string[]): Promise<string> {
    // Join all populated templates
    const combined = templates.join('\n');

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
