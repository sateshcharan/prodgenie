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
    // const fullPath = `${this.folder}/${filePath}`;
    // const { data } = supabase.storage
    //   .from(this.bucketName)
    //   .getPublicUrl(fullPath);
    // return data.publicUrl;
  }

  async listFiles(): Promise<{ data: any[]; error: any }> {
    // const { data, error }: any = await supabase.storage
    //   .from(this.bucketName)
    //   .list(this.folder, {
    //     limit: 100,
    //     offset: 0,
    //     sortBy: { column: 'name', order: 'asc' },
    //   });

    // if (error) throw error;
    // return data;
    return { data: [], error: null };
  }

  async downloadFile(filePath: string) {
    // const fullPath = `${this.folder}/${filePath}`;
    // const { data, error } = await supabase.storage
    //   .from(this.bucketName)
    //   .download(fullPath);
    // if (error) throw error;
    // return data;
  }

  async deleteFile(filePath: string): Promise<any> {
    // const fullPath = `${this.folder}/${filePath}`;
    // const { data, error } = await supabase.storage
    //   .from(this.bucketName)
    //   .remove([fullPath]);
    // if (error) throw error;
    // return data;
  }
}
