import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import { fromBuffer } from 'pdf2pic';

import { prisma } from '@prodgenie/libs/prisma';
import { FileStorageService } from '@prodgenie/libs/supabase';
import { FileType } from '@prodgenie/libs/prisma';

const storageFileService = new FileStorageService();

export class ThumbnailService {
  async get(
    fileId: string,
    orgId: string
  ): Promise<{ data: any | null; error: string | null }> {
    const dbFile = await prisma.file.findUnique({
      where: { id: fileId, orgId },
    });

    if (!dbFile) return { data: null, error: 'No file found' };

    const signedUrl = await storageFileService.getSignedUrl(dbFile.thumbnail);

    return {
      data: {
        ...dbFile,
        path: signedUrl,
      },
      error: null,
    };
  }

  async set(uploadedFile: Express.Multer.File, fileId: string, user: any) {
    if (!uploadedFile) throw new Error('No file uploaded');

    const storageResult = await storageFileService.uploadFile(
      `${user.org.name}/thumbnail/${fileId}`,
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

  async update(uploadedFile: Express.Multer.File, fileId: string, user: any) {
    if (!uploadedFile) throw new Error('No file uploaded');

    const dbFile = await prisma.file.findUnique({
      where: { id: fileId },
      select: { thumbnail: true },
    });

    let result;
    if (!dbFile?.thumbnail) {
      // No previous thumbnail, upload new
      result = await storageFileService.uploadFile(
        `${user.org.name}/thumbnail/${fileId}`,
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
          savePath: '/tmp',
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
      console.log('generate thumbnail for config/sequence');
    }

    throw new Error(`Unsupported fileType: ${fileType}`);
  }
}
