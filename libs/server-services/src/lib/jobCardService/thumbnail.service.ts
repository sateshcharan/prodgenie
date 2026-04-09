import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import { fromBuffer } from 'pdf2pic';

import { prisma } from '@prodgenie/libs/db';
import { FileStorageService } from '@prodgenie/libs/supabase';
// import { FileType } from '@prodgenie/libs/prisma';

export class ThumbnailService {
  static async get(fileId: string, workspaceId: string) {
    const dbFile = await prisma.file.findFirst({
      where: { id: fileId, workspaceId },
    });

    if (!dbFile) throw new Error('No file found');

    try {
      // check if thumbnail already exists
      if (dbFile.thumbnail) {
        const signedUrl = await FileStorageService.getSignedUrl(
          dbFile.thumbnail
        );

        return {
          data: {
            ...dbFile,
            path: signedUrl,
          },
          error: null,
        };
      }

      // if no thumbnail, generate one // TODO: buggy need to fix
      // download original file
      const fileBuffer = await FileStorageService.downloadFile(dbFile.path);

      // console.log('fileBuffer type:', typeof fileBuffer);
      // console.log('isBuffer:', Buffer.isBuffer(fileBuffer));
      // console.log(fileBuffer);

      const fileForThumbnail = {
        originalname: dbFile.name ?? dbFile.path.split('/').pop(),
        mimetype: dbFile.type,
        buffer: fileBuffer,
        data: dbFile.data,
      };

      // generate thumbnail
      const thumbnailBuffer = await this.generate(
        fileForThumbnail,
        dbFile.type
      );

      // upload thumbnail buffer directly
      const storageResult = await FileStorageService.uploadFile(
        `${workspaceId}/thumbnail/${dbFile.id}.jpeg`,
        {
          originalname: `thumbnail_${dbFile.id}.jpeg`,
          mimetype: 'image/jpeg',
          buffer: thumbnailBuffer,
        }
      );

      // update DB
      const updated = await prisma.file.update({
        where: { id: dbFile.id },
        data: { thumbnail: storageResult.path },
      });

      const signedUrl = await FileStorageService.getSignedUrl(
        updated.thumbnail as string
      );

      return {
        data: {
          ...updated,
          path: signedUrl,
        },
        error: null,
      };
    } catch (error: any) {
      console.error('Thumbnail generation failed:', error);

      return {
        data: dbFile,
        error: error.message,
      };
    }
  }

  static async set(
    uploadedFile: Express.Multer.File,
    fileId: string,
    user: any,
    activeWorkspace: any
  ) {
    if (!uploadedFile) throw new Error('No file uploaded');

    const storageResult = await FileStorageService.uploadFile(
      `${activeWorkspace.workspace.id}/thumbnail/${fileId}`,
      uploadedFile
      // 'thumbnail',
      // user
    );

    const updated = await prisma.file.update({
      where: { id: fileId },
      data: { thumbnail: storageResult.path },
    });

    return updated;
  }

  static async update(
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
      (m: any) => m.workspace.id === activeWorkspaceId
    );

    let result;
    if (!dbFile?.thumbnail) {
      // No previous thumbnail, upload new
      result = await FileStorageService.uploadFile(
        `${activeWorkspace.workspace.name}/thumbnail/${fileId}`,
        uploadedFile
        // 'thumbnail',
        // user
      );
    } else {
      // Replace old thumbnail
      result = await FileStorageService.replaceFile(
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

  // async generate(file: any, fileType: string): Promise<Buffer> {
  static async generate(file: any, fileType: string): Promise<any> {
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

    // if (fileType === 'template') {
    //   const browser = await puppeteer.launch({
    //     headless: true,
    //     args: [
    //       '--no-sandbox',
    //       '--disable-setuid-sandbox',
    //       '--disable-dev-shm-usage',
    //       '--disable-gpu',
    //       '--single-process',
    //       '--no-zygote',
    //     ],
    //   });

    //   try {
    //     const page = await browser.newPage();

    //     let htmlContent = '';

    //     // ✅ Case 1: If buffer is valid HTML
    //     if (Buffer.isBuffer(file.buffer)) {
    //       htmlContent = file.buffer.toString();
    //     }

    //     // ✅ Case 2: If buffer is object (your current bug)
    //     else if (typeof file.buffer === 'object') {
    //       htmlContent = this.buildTemplatePreviewHTML(file.buffer);
    //     }

    //     // ✅ Case 3: fallback to DB data
    //     else if (file.data) {
    //       htmlContent = this.buildTemplatePreviewHTML(file.data);
    //     }

    //     // ✅ Final fallback
    //     else {
    //       htmlContent = `<html><body><h3>Invalid template</h3></body></html>`;
    //     }

    //     await page.setContent(htmlContent, {
    //       // waitUntil: 'networkidle0',
    //       waitUntil: 'domcontentloaded',
    //     });

    //     return await page.screenshot({
    //       type: 'jpeg',
    //       quality: 80,
    //     });
    //   } finally {
    //     await browser.close();
    //   }
    // }

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

  static async regenerate(fileType: string, user: any, activeWorkspaceId: any) {
    const files = await prisma.file.findMany({
      where: {
        workspaceId: activeWorkspaceId,
        // fileType,
      },
    });

    if (files.length === 0) throw new Error('No files found for regeneration');

    files.forEach(async (dbFile: any) => {
      try {
        // const fileBuffer = await FileStorageService.downloadFile(dbFile.path);
        // const fileForThumbnail = {
        //   originalname: path.basename(dbFile.path),
        //   mimetype: dbFile.mimetype,
        //   buffer: fileBuffer,
        // };
        // const thumbnailBuffer = await this.generate(
        //   fileForThumbnail,
        //   dbFile.type
        // );
        // const storageResult = await FileStorageService.replaceFile(
        //   dbFile.thumbnail!,
        //   {
        //     originalname: `thumbnail_${path.basename(
        //       dbFile.path,
        //       path.extname(dbFile.path)
        //     )}.jpeg`,
        //     mimetype: 'image/jpeg',
        //     buffer: thumbnailBuffer,
        //   },
        //   'thumbnail',
        //   user
        // );
        // await prisma.file.update({
        //   where: { id: dbFile.id },
        //   data: { thumbnail: storageResult.path },
        // });
      } catch (error) {
        console.error(
          `Failed to regenerate thumbnail for file ${dbFile.id}:`,
          error
        );
      }
    });
  }

  // private static buildTemplatePreviewHTML(data: any): string {
  //   return `
  //   <html>
  //     <head>
  //       <style>
  //         body {
  //           font-family: Arial, sans-serif;
  //           padding: 16px;
  //           background: #f4f4f4;
  //         }
  //         .card {
  //           background: white;
  //           border-radius: 8px;
  //           padding: 12px;
  //           margin-bottom: 10px;
  //           box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  //         }
  //         .title {
  //           font-size: 14px;
  //           font-weight: bold;
  //           margin-bottom: 6px;
  //         }
  //         .meta {
  //           font-size: 12px;
  //           color: #666;
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <h2>Template Preview</h2>

  //       ${(data?.jobCardForm?.sections || [])
  //         .map(
  //           (section: any) => `
  //             <div class="card">
  //               <div class="title">📦 ${section.name}</div>
  //               <div class="meta">
  //                 Fields: ${
  //                   section?.jobCardForm?.sections?.flatMap(
  //                     (s: any) => s.fields || []
  //                   ).length || 0
  //                 }
  //               </div>
  //             </div>
  //           `
  //         )
  //         .join('')}

  //     </body>
  //   </html>
  // `;
  // }
}
