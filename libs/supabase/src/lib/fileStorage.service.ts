// import { createClient } from '@supabase/supabase-js';

import { cache } from '@prodgenie/libs/redis';

// const supabaseAdmin = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

import { supabaseAdmin } from './supabase.js';

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
    if (!file || !file.buffer || !Buffer.isBuffer(file.buffer)) {
      console.error('Invalid file buffer:', file);
      throw new Error('Invalid file provided for upload');
    }

    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .upload(uploadPath, file.buffer, {
          upsert: true,
          contentType: file.mimetype,
        });

      if (error) {
        console.error('Supabase upload error:', error.message);
        throw new Error(`Upload failed: ${error.message}`);
      }

      return data;
    } catch (err: any) {
      console.error('Upload operation failed:', err.code || '', err.message);
      throw err;
    }
  }

  async getSignedUrl(filePath: string): Promise<string> {
    if (!filePath) throw new Error('File path not provided');
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, 60 * 60);

      if (error) {
        console.error('Supabase signed URL error:', error.message);
        throw new Error(`Get signed URL failed: ${error.message}`);
      }

      if (!data?.signedUrl) throw new Error('Signed URL not generated');

      return data.signedUrl;
    } catch (err: any) {
      console.error('Get signed URL failed:', err.code || '', err.message);
      throw err;
    }
  }

  async getCachedSignedUrl(filePath: string) {
    if (!filePath) throw new Error('File path missing');

    const cacheKey = `signedurl:${filePath}`;

    return cache.getOrSet(cacheKey, 55 * 60, async () => {
      return await this.getSignedUrl(filePath);
    });
  }

  async deleteFile(
    filePath: string,
    fileType?: string,
    user?: any
  ): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error.message);
        throw new Error(`Delete failed: ${error.message}`);
      }

      return data;
    } catch (err: any) {
      console.error('Delete operation failed:', err.code || '', err.message);
      throw err;
    }
  }

  async listFiles(WorkspaceId: string): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .list(`${WorkspaceId}/`);

      if (error) {
        console.error('Supabase list error:', error.message);
        throw new Error(`List failed: ${error.message}`);
      }

      return data;
    } catch (err: any) {
      console.error('List operation failed:', err.code || '', err.message);
      throw err;
    }
  }

  async renameFile(
    oldPath: string,
    newPath: string
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .move(oldPath, newPath);

      if (error) {
        console.error('Supabase rename error:', error.message);
      }

      return { data, error };
    } catch (err: any) {
      console.error('Rename operation failed:', err.code || '', err.message);
      throw err;
    }
  }

  async replaceFile(
    oldPath: string,
    newFile: any,
    fileType: string,
    user: any
  ): Promise<{ path: string }> {
    try {
      // Delete the old file from storage
      await this.deleteFile(oldPath, fileType, user);

      // Upload the new file and get its new path
      const { path } = await this.uploadFile(oldPath, newFile, fileType, user);

      // Return only what the caller expects
      return { path };
    } catch (err: any) {
      console.error(
        '❌ Replace operation failed:',
        err.code || '',
        err.message
      );
      throw new Error('Failed to replace file');
    }
  }

  async duplicateFile(
    oldPath: string,
    fileType: string,
    newPath: string
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .copy(oldPath, newPath);

      if (error) {
        console.error('Supabase duplicate error:', error.message);
      }

      return { data, error };
    } catch (err: any) {
      console.error('Duplicate operation failed:', err.code || '', err.message);
      throw err;
    }
  }
}
