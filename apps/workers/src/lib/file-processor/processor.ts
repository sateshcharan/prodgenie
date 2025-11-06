import path from 'path';
import fs from 'fs/promises';
import { Job } from 'bullmq';

import { prisma } from '@prodgenie/libs/prisma';
import { FileStorageService } from '@prodgenie/libs/supabase';
import {
  // PuppeteerService,
  OpenRouterService,
} from '@prodgenie/libs/server-services';

// const puppeteerService = new PuppeteerService();
const openRouterService = new OpenRouterService();
const fileStorageService = new FileStorageService();

export const processDrawingBom = async (job: Job) => {
  const { file } = job.data;

  const tempDir = path.resolve(process.cwd(), 'tmp/uploads');
  const tempFilePath = path.join(tempDir, `${Date.now()}-${file.originalname}`);

  await fs.mkdir(tempDir, { recursive: true });
  await fs.writeFile(tempFilePath, Buffer.from(file.buffer.data));

  const filePath = await prisma.file.findFirst({
    where: { id: file.id },
    select: { path: true },
  });

  const fileSignedUrl = await fileStorageService.getSignedUrl(
    filePath?.path || ''
  );

  try {
    // const data = await puppeteerService.extractFromChatGPT(tempFilePath);
    const data = await openRouterService.extract(fileSignedUrl); // args: signedUrl | tempFilePath
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
    await fs.unlink(tempFilePath).catch(() => {});
    throw error;
  }
};
