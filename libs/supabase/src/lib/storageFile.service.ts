import { supabase } from './supabase.js';

export class StorageFileService {
  private readonly bucketName: string = process.env.BUCKET ?? '';

  constructor() {
    if (!process.env.BUCKET) {
      throw new Error('BUCKET env variable is not defined');
    }
    this.bucketName = process.env.BUCKET;
  }

  async uploadFile(uploadPath: string, file: File | Blob) {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(uploadPath, file, { upsert: true });

    if (error) throw error;
    return data;
  }

  async getPublicUrl(filePath: string) {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  async downloadFile(filePath: string) {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .download(filePath);
    if (error) throw error;
    return data;
  }

  async deleteFile(deletePath: string): Promise<any> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .remove([deletePath]);
    if (error) throw error;
    return data;
  }
}
