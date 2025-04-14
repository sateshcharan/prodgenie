import { supabase } from '@prodgenie/libs/supabase';
import { prisma } from '@prodgenie/libs/prisma';

export class FileService {
  private bucket: string;

  constructor(bucketName: string) {
    this.bucket = bucketName;
  }

  async fetchFiles(folder: string) {
    const files = await prisma.file.findMany({
      where: { userId, type: type.toUpperCase().slice(0, type.length - 1) },
    });
  }

  async uploadFile(folder: string, file: Express.Multer.File) {
    const filePath = `${folder}/${file.originalname}`;

    const { error, data } = await supabase.storage
      .from(this.bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw new Error(`Upload failed: ${error.message}`);
    return data;
  }

  async deleteFile(folder: string, fileName: string) {
    const filePath = `${folder}/${fileName}`;
    const { error, data } = await supabase.storage
      .from(this.bucket)
      .remove([filePath]);

    if (error) throw new Error(`Delete failed: ${error.message}`);
    return data;
  }
}
