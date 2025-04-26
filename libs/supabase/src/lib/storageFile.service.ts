import { supabase } from './supabase.js';

export class StorageFileService {
  private readonly bucketName: string;

  constructor() {
    const bucket = process.env.BUCKET;
    if (!bucket) {
      throw new Error('BUCKET env variable is not defined');
    }
    this.bucketName = bucket;
  }

  async uploadFile(uploadPath: string, file: any) {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(uploadPath, file.buffer, {
        upsert: true,
        contentType: file.mimetype,
      });

    if (error) throw new Error(`Upload failed: ${error.message}`);
    return data;
  }

  async getSignedUrl(filePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, 60 * 60);

    if (error) throw new Error(`Get signed URL failed: ${error.message}`);
    if (!data?.signedUrl) throw new Error('Signed URL not generated');

    return data.signedUrl;
  }

  async deleteFile(filePath: string): Promise<any> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) throw new Error(`Delete failed: ${error.message}`);
    return data;
  }
}
