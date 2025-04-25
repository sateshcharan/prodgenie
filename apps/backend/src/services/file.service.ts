import { FileType } from '@prisma/client';
import { prisma } from '@prodgenie/libs/prisma';
import { supabase } from '@prodgenie/libs/supabase';
import { StorageFileService } from '@prodgenie/libs/supabase';

const storageFileService = new StorageFileService();

export class FileService {
  private readonly bucketName: string = process.env.BUCKET ?? '';

  constructor() {
    if (!process.env.BUCKET) {
      throw new Error('BUCKET env variable is not defined');
    }
    this.bucketName = process.env.BUCKET;
  }

  async uploadFile(
    files: Express.Multer.File[],
    fileType: any,
    userId: string
  ) {
    const savedFileMetadata: any = [];

    const org = await prisma.user.findUnique({
      where: { id: userId },
      select: { org: { select: { name: true, id: true } } },
    });

    const folder = org.org.name.trim();
    const orgId = org.org.id;

    for (const file of files) {
      const uploadPath = `${folder}/${fileType}/${file.originalname}`;
      try {
        // Upload to Supabase Storage
        await storageFileService.uploadFile(uploadPath, file);

        // // Save metadata to database
        const savedFile = await prisma.file.create({
          data: {
            name: file.originalname,
            path: uploadPath,
            userId,
            orgId,
            type: fileType.toUpperCase().slice(0, -1),
          },
        });
        savedFileMetadata.push(savedFile);
      } catch (error) {
        console.error(`Error uploading ${file.originalname}:`, error);
        // Optional: roll back previous uploads or handle partial failure
      }
    }
    return savedFileMetadata;
  }

  async getPublicUrl(filePath: string) {
    return data.publicUrl;
  }

  async listFiles(
    fileType: string,
    orgId: string
  ): Promise<{ data: any[] | null; error: any | null }> {
    const extractedFileType = fileType.toUpperCase().slice(0, -1);
    try {
      // fetch files list from prismsa
      const files = await prisma.file.findMany({
        where: {
          orgId,
          type: extractedFileType as FileType,
        },
      });

      console.log(files);
      if (!files) {
        return { data: null, error: 'No files found' };
      }
      return { data: files, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async downloadFile(filePath: string) {
    if (error) throw error;
    return data;
  }

  async deleteFile(fileId: string, fileType: string) {
    console.log(fileId, fileType);
    // try {
    //   const fullPath = `${fileType}/${fileId}`;
    //   console.log(fullPath);
    //   storageFileService.deleteFile(fullPath);
    //   const result = prisma.file.delete({
    //     where: {
    //       id: fileId,
    //     },
    //   });
    //   return result;
    // } catch (error) {
    //   return error;
    // }
  }
}
