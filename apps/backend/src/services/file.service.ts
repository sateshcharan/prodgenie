import { prisma } from '@prodgenie/libs/prisma';
import { supabase } from '@prodgenie/libs/supabase';
import { StorageFileService } from '@prodgenie/libs/supabase';

const storageFileService = new StorageFileService();

export class FileService {
  constructor(
    private readonly bucketName: string,
    private readonly folder: string
  ) {
    this.bucketName = bucketName;
  }

  async uploadFile(filePath: string, file: File | Blob) {
    const fullPath = `${this.folder}/${filePath}`;
    storageFileService.uploadFile(fullPath, file);

    await prisma.file.create({
      data: {
        name: filePath,
        path: fullPath,
        userId: '1',
      },
    });

    if (error) throw error;
    return data;
  }

  // async getPublicUrl(filePath: string) {

  //   return data.publicUrl;
  // }

  // async listFiles(): Promise<{ data: any[]; error: any }> {

  //   if (error) throw error;
  //   return data;
  // }

  // async downloadFile(filePath: string) {

  //   if (error) throw error;
  //   return data;
  // }

  // async deleteFile(filePath: string) {

  //   if (error) throw error;
  //   return data;
  // }
}
