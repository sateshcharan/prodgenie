import fs from 'fs/promises';
import path from 'path';

export class TemplateService {
  async injectValues(templatePath: string, item: any): Promise<string> {
    try {
      const absolutePath = path.resolve(templatePath);
      const templateContent = await fs.readFile(absolutePath, 'utf-8');

      // First, handle array block sections
      let populated = templateContent.replace(
        /{{#(.*?)\[\]}}([\s\S]*?){{\/\1\[\]}}/g,
        (_, arrayKey, innerTemplate) => {
          const arr = item[arrayKey];
          console.log(arr);
          if (!Array.isArray(arr)) return '';

          return arr
            .map((obj) =>
              innerTemplate.replace(/{{(.*?)}}/g, (_: any, field: any) => {
                return obj[field.trim()] ?? '';
              })
            )
            .join('\n');
        }
      );

      // Then, handle single value keys
      populated = populated.replace(/{{(.*?)}}/g, (_, key) => {
        const value = item[key.trim()];
        return value !== undefined ? value : '';
      });

      return populated;
    } catch (error) {
      console.error(`Error reading template: ${error}`);
      return '';
    }

    // try {
    //   const absolutePath = path.resolve(templatePath);
    //   const templateContent = await fs.readFile(absolutePath, 'utf-8');
    //   const populated = templateContent.replace(/{{(.*?)}}/g, (_, key) => {
    //     const value = item[key.trim()];
    //     return value;
    //   });
    //   return populated;
    // } catch (error) {
    //   console.error(`Error reading template: ${error}`);
    //   return '';
    // }
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
            body {
              font-family: Calibri, sans-serif;
              margin: 0;
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            td,th {
              border: 1px solid #000;
              padding: 4px;
            }
            h1 {
              text-align: center;
              text-transform: uppercase;
              font-weight: bold;
              margin-bottom: 0;
            }
            h2 {
              text-align: center;
              margin-top: 4px;
            }
          </style>
        </head>
        <body>
          <h1>Blue Saphire Packaging</h1>
          <h2>Process cum Inspection Report</h2>
          ${combined}
        </body>
      </html>
    `;
  }
}
