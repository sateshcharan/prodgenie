import { supabase } from './supabase.js';

import { HistoryService } from '@prodgenie/libs/db';

export class FileStorageService {
  private readonly bucketName: string;

  constructor() {
    const bucket = process.env.BUCKET;
    if (!bucket) {
      throw new Error('BUCKET env variable is not defined');
    }
    this.bucketName = bucket;
  }

  async uploadFile(uploadPath: string, file: any, fileType: any, user: any) {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(uploadPath, file.buffer, {
        upsert: true,
        contentType: file.mimetype,
      });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const userId = user.id;
    const orgId = user.org.id;

    HistoryService.record({
      userId: userId,
      orgId: orgId,
      action: `${fileType} uploaded`,
      details: fileType,
    });

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

  async deleteFile(
    filePath: string,
    fileType: string,
    user: any
  ): Promise<any> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) throw new Error(`Delete failed: ${error.message}`);

    const userId = user.id;
    const orgId = user.org.id;

    HistoryService.record({
      userId: userId,
      orgId: orgId,
      action: `${fileType} deleted`,
      details: fileType,
    });

    return data;
  }

  async renameFile(
    oldPath: string,
    newPath: string
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .move(oldPath, newPath);

    if (error) {
      console.error('Rename failed:', error.message);
    }

    return { data, error };
  }
}
