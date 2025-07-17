import path from 'path';
import { Job } from 'bullmq';
import fs from 'fs/promises';

import { prisma } from '@prodgenie/libs/prisma';
import { PuppeteerService } from '@prodgenie/libs/server-services';

const puppeteerService = new PuppeteerService();
export const processDrawingBom = async (job: Job) => {
  const { file } = job.data;

  // Construct temp file path
  const tempDir = path.resolve(process.cwd(), 'tmp/uploads');
  await fs.mkdir(tempDir, { recursive: true });

  const tempFilePath = path.join(tempDir, `${Date.now()}-${file.originalname}`);

  // Write buffer to temp file
  await fs.writeFile(tempFilePath, Buffer.from(file.buffer.data));

  try {
    // Now pass local file path
    const data = await puppeteerService.extractFromChatGPT(tempFilePath);

    await fs.unlink(tempFilePath);

    try {
      await prisma.file.update({
        where: { id: file.id },
        data: { data: data },
      });
      console.log('✅ File updated:', file.originalname);
    } catch (error) {
      console.error('❌ Error updating file:', error);
    }
  } catch (error) {
    // On error, still clean up
    await fs.unlink(tempFilePath).catch(() => {});
    throw error;
  }
};
