import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import { fromBuffer } from 'pdf2pic';

import { prisma } from '@prodgenie/libs/db';
import { FileStorageService } from '@prodgenie/libs/supabase';
import { FileType } from '@prodgenie/libs/db';

const storageFileService = new FileStorageService();

export class ThumbnailService {
  async get(
    fileId: string,
    workspaceId: string
  ): Promise<{ data: any | null; error: string | null }> {
    const dbFile = await prisma.file.findUnique({
      where: { id: fileId, workspaceId },
    });

    if (!dbFile) return { data: null, error: 'No file found' };

    const signedUrl = await storageFileService.getSignedUrl(dbFile.thumbnail!);

    return {
      data: {
        ...dbFile,
        path: signedUrl,
      },
      error: null,
    };
  }

  async set(
    uploadedFile: Express.Multer.File,
    fileId: string,
    user: any,
    activeWorkspace: any
  ) {
    if (!uploadedFile) throw new Error('No file uploaded');

    const storageResult = await storageFileService.uploadFile(
      `${activeWorkspace.workspace.name}/thumbnail/${fileId}`,
      uploadedFile,
      'thumbnail',
      user
    );

    const updated = await prisma.file.update({
      where: { id: fileId },
      data: { thumbnail: storageResult.path },
    });

    return updated;
  }

  async update(
    uploadedFile: Express.Multer.File,
    fileId: string,
    user: any,
    activeWorkspaceId: any
  ) {
    if (!uploadedFile) throw new Error('No file uploaded');

    const dbFile = await prisma.file.findUnique({
      where: { id: fileId },
      select: { thumbnail: true },
    });

    const activeWorkspace = user.memberships.find(
      (m) => m.workspace.id === activeWorkspaceId
    );

    let result;
    if (!dbFile?.thumbnail) {
      // No previous thumbnail, upload new
      result = await storageFileService.uploadFile(
        `${activeWorkspace.workspace.name}/thumbnail/${fileId}`,
        uploadedFile,
        'thumbnail',
        user
      );
    } else {
      // Replace old thumbnail
      result = await storageFileService.replaceFile(
        dbFile.thumbnail,
        uploadedFile,
        'thumbnail',
        user
      );
    }

    const updated = await prisma.file.update({
      where: { id: fileId },
      data: { thumbnail: result.path },
    });

    return updated;
  }

  async generate(file: any, fileType: string): Promise<Buffer> {
    if (!file) throw new Error('No file provided');
    const filename = path.basename(
      file.originalname,
      path.extname(file.mimetype)
    );

    if (fileType === 'drawing' || fileType === 'jobCard') {
      try {
        const convert = fromBuffer(file.buffer, {
          saveFilename: filename,
          savePath: './tmp',
          density: 72,
          format: 'jpeg',
          // width: 600,
          // height: 600,
          quality: 80,
        });
        const result = await convert(1, { responseType: 'buffer' });

        return result.buffer as Buffer;
      } catch (error: any) {
        console.error('Failed to generate thumbnail:', error);
        throw new Error(`Failed to generate thumbnail: ${error.message}`);
      }
    }

    if (fileType === 'template') {
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

        // ✅ Need to save the .htm buffer to a temporary file before Puppeteer can access it
        const tempFilePath = path.join('/tmp', `${filename}.htm`);
        await fs.writeFile(tempFilePath, file.buffer);

        const fileUrl = `file://${tempFilePath}`;

        await page.goto(fileUrl, {
          waitUntil: 'networkidle0',
          timeout: 10000,
        });

        // Take screenshot as buffer
        const screenshotBuffer = await page.screenshot({
          fullPage: false,
          type: 'jpeg',
          quality: 80,
        });

        return screenshotBuffer as Buffer;
      } finally {
        await browser.close();
      }
    }

    if (fileType === 'config' || fileType === 'sequence') {
      try {
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
        const page = await browser.newPage();

        const jsonData = JSON.parse(file.buffer.toString());

        // Build a basic HTML summary from JSON
        const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background-color: #f9f9f9;
              }
              h1 {
                font-size: 18px;
                margin-bottom: 10px;
              }
              .section {
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .section h2 {
                font-size: 14px;
                margin: 0 0 5px;
              }
              .field {
                font-size: 12px;
                color: #555;
              }
            </style>
          </head>
          <body>
            <h1>Template Preview</h1>
            ${(jsonData?.sections || [])
              .map(
                (section: any) => `
              <div class="section">
                <h2>📦 ${section.name}</h2>
                <div class="field">Fields: ${
                  section?.jobCardForm?.sections?.flatMap(
                    (s: any) => s.fields || []
                  ).length || 0
                }</div>
              </div>
            `
              )
              .join('')}
          </body>
        </html>
      `;

        await page.setContent(htmlContent, {
          waitUntil: 'domcontentloaded',
        });

        const screenshotBuffer = await page.screenshot({
          fullPage: false,
          type: 'jpeg',
          quality: 80,
        });

        await browser.close();
        return screenshotBuffer as Buffer;
      } catch (error: any) {
        console.error('❌ Failed to generate JSON thumbnail:', error);
        throw new Error(`Thumbnail generation error: ${error.message}`);
      }
    }

    //   throw new Error(`Unsupported fileType: ${fileType}`);

    if (fileType === 'table') {
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
        const jsonData = JSON.parse(file.buffer.toString());

        const columns = jsonData?.columns || [];
        const rows = jsonData?.rows || [];

        const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 16px;
              background: #f9f9f9;
            }
            h1 {
              font-size: 16px;
              margin-bottom: 10px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              background: #fff;
              border-radius: 6px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px 10px;
              font-size: 12px;
              text-align: left;
            }
            th {
              background: #f3f3f3;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${columns.map((col: any) => `<th>${col.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows
                .slice(0, 5) // only first 5 rows for thumbnail
                .map(
                  (row: any) => `
                    <tr>
                      ${columns
                        .map((col: any) => `<td>${row[col.key] ?? ''}</td>`)
                        .join('')}
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

        const screenshotBuffer = await page.screenshot({
          fullPage: false,
          type: 'jpeg',
          quality: 80,
        });

        await browser.close();
        return screenshotBuffer as Buffer;
      } catch (error: any) {
        console.error('❌ Failed to generate table thumbnail:', error);
        throw new Error(`Thumbnail generation error: ${error.message}`);
      }
    }
  }
}
