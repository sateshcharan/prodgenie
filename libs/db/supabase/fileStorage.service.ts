import { cache } from '@prodgenie/libs/redis';
// import { createClient } from '@supabase/supabase-js';

import { supabase } from './supabase.js';

const BUCKET = process.env.BUCKET!;
// const supabaseUrl = process.env.SUPABASE_URL!;
// const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// const supabase = createClient(supabaseUrl, serviceRoleKey); // only seperate client here works for upload without error

export class FileStorageService {
  static async uploadFile(uploadPath: string, file: any) {
    if (!file || !file.buffer || !Buffer.isBuffer(file.buffer))
      throw new Error('Invalid file provided for upload');

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(uploadPath, file.buffer, {
        upsert: true,
        contentType: file.mimetype,
      });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    return data;
  }

  static async downloadFile(
    filePath: string
  ): Promise<{ data: Buffer; contentType: string }> {
    if (!filePath) throw new Error('File path not provided');

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(filePath);

    if (error) throw new Error(`Download failed: ${error.message}`);
    if (!data) throw new Error('No data received from download');

    const contentType = data.type || 'application/octet-stream';
    const buffer = Buffer.from(await data.arrayBuffer());

    return { data: buffer, contentType };
  }

  static async getSignedUrl(filePath: string): Promise<string> {
    if (!filePath) throw new Error('File path not provided');

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 60 * 60);

    if (error)
      throw new Error(`Get signed URL failed: ${filePath} ${error.message}`);
    if (!data?.signedUrl) throw new Error('Signed URL not generated');

    return data.signedUrl;
  }

  static async getCachedSignedUrl(filePath: string) {
    return cache.getOrSet(`signedurl:${filePath}`, 55 * 60, async () => {
      return await this.getSignedUrl(filePath);
    });
  }

  static async deleteFile(
    filePath: string,
    fileType?: string,
    user?: any
  ): Promise<any> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .remove([filePath]);

    if (error) throw new Error(`Delete failed: ${error.message}`);

    return data;
  }

  static async listFiles(workspaceId: string): Promise<any> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(`${workspaceId}/`);

    if (error) throw new Error(`List failed: ${error.message}`);

    return data;
  }

  static async renameFile(
    oldPath: string,
    newPath: string
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .move(oldPath, newPath);

    if (error) throw new Error('Supabase rename error:', error);

    return { data, error };
  }

  static async replaceFile(
    oldPath: string,
    newFile: any,
    fileType: string,
    user: any
  ): Promise<{ path: string }> {
    await this.deleteFile(oldPath, fileType, user);

    const { path } = await this.uploadFile(oldPath, newFile);

    return { path };
  }

  static async duplicateFile(
    oldPath: string,
    fileType: string,
    newPath: string
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .copy(oldPath, newPath);

    if (error) throw new Error('Supabase duplicate error:', error);

    return { data, error };
  }
}
