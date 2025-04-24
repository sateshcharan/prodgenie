import { prisma } from '@prodgenie/libs/prisma';
import { supabase } from '@prodgenie/libs/supabase';
import { StorageFileService } from '@prodgenie/libs/supabase';

const storageFileService = new StorageFileService();

export class FileService {
  constructor(
    private readonly bucketName: string // private readonly folder: string
  ) {
    this.bucketName = bucketName;
  }

  async uploadFile(filePath: string, file: File | Blob) {
    console.log(filePath, file);
    // const fullPath = `${this.folder}/${filePath}`;
    // storageFileService.uploadFile(fullPath, file);
    // await prisma.file.create({
    //   data: {
    //     name: filePath,
    //     path: fullPath,
    //     userId: '1',
    //   },
    // });
    // if (error) throw error;
    // return data;
  }

  async getPublicUrl(filePath: string) {
    return data.publicUrl;
  }

  async listFiles(
    fileType: string
  ): Promise<{ data: any[] | null; error: any | null }> {
    const extractedFileType = fileType.toUpperCase().slice(0, -1);
    try {
      // fetch files list from prismsa
      const files = await prisma.file.findMany({
        where: {
          // id: '001',
          userId: 'd9ff52e5-7688-4070-a288-c2723e6774df',
          type: extractedFileType,
        },
      });
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
