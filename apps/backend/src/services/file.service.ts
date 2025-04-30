import { FileType } from '@prisma/client';
import { prisma } from '@prodgenie/libs/prisma';
import { StorageFileService } from '@prodgenie/libs/supabase';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

const storageFileService = new StorageFileService();

export class FileService {
  private readonly bucketName: string;

  constructor() {
    const bucket = process.env.BUCKET;
    if (!bucket) {
      throw new Error('BUCKET env variable is not defined');
    }
    this.bucketName = bucket;
  }

  async uploadFile(
    files: Express.Multer.File[],
    fileType: string,
    userId: string
  ) {
    const savedFiles: any[] = [];
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { org: { select: { name: true, id: true } } },
    });
    const folder = user?.org?.name.trim();
    const orgId = user?.org?.id;
    if (!folder || !orgId) throw new Error('Organization not found for user');
    for (const file of files) {
      const uploadPath = `${folder}/${fileType}/${file.originalname}`;
      try {
        await storageFileService.uploadFile(uploadPath, file);
        const savedFile = await prisma.file.create({
          data: {
            name: file.originalname,
            path: uploadPath,
            userId,
            orgId,
            type: fileType.slice(0, -1) as FileType,
          },
        });
        savedFiles.push(savedFile);
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        // Optional: Implement rollback logic here if needed
      }
    }
    return savedFiles;
  }

  async listFiles(
    fileType: string,
    orgId: string
  ): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const extractedFileType = fileType.slice(0, -1) as FileType;
      const files = await prisma.file.findMany({
        where: {
          orgId,
          type: extractedFileType,
        },
      });

      if (!files.length) {
        return { data: null, error: 'No files found' };
      }

      const filesWithUrls = await Promise.all(
        files.map(async (file) => ({
          ...file,
          path: await storageFileService.getSignedUrl(file.path),
        }))
      );
      return { data: filesWithUrls, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async deleteFile(fileId: string, fileType: string, userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { org: { select: { name: true } } },
      });
      const folder = user?.org?.name.trim();
      if (!folder) throw new Error('Organization not found for user');
      const file = await prisma.file.findUnique({
        where: { id: fileId },
      });
      if (!file) throw new Error('File not found');
      const fullPath = file.path; // Trust path from database
      await storageFileService.deleteFile(fullPath);
      const deletedFile = await prisma.file.delete({
        where: { id: fileId },
      });
      return deletedFile;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async downloadToTemp(signedUrl: string, filename: string) {
    const tempDir = './tmp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Extract the file extension from the original filename or URL
    const extension = path.extname(filename) || new URL(signedUrl).pathname.split('.').pop() || '';
    const filenameWithExt = extension ? `${filename}${extension.startsWith('.') ? extension : `.${extension}`}` : filename;
    
    const tempFilePath = path.join(tempDir, filenameWithExt);
    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const webStream = response.body;
    if (!webStream) {
      throw new Error('Response body is null');
    }
    // Convert Web Stream -> Node.js Stream
    const nodeStream = Readable.fromWeb(webStream as any);
    const writeStream = fs.createWriteStream(tempFilePath);
    await new Promise<void>((resolve, reject) => {
      nodeStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    return tempFilePath;
  }
}
