// libs/supabase/src/storage-folder.service.ts
import { supabase } from './supabase.js';

export class StorageFolderService {
  private readonly bucketName: string = process.env.BUCKET ?? '';

  constructor() {
    if (!process.env.BUCKET) {
      throw new Error('BUCKET env variable is not defined');
    }
    this.bucketName = process.env.BUCKET;
  } 

  async createFolder(folderPath: string, contentType = 'text/plain') {
    const path = `${folderPath.replace(/\/$/, '')}/.init`;
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(path, new Blob(['']), {
        upsert: false,
        contentType,
      });

    if (error) throw error;
    return data;
  }

  // async deleteFolder(folderPath: string) {
  //   // Supabase doesn't have recursive folder delete,
  //   // you must list and delete all files under that path
  //   const { data: list, error: listError } = await supabase.storage
  //     .from(this.bucketName)
  //     .list(folderPath, { recursive: true });

  //   if (listError) throw listError;
  //   if (!list || list.length === 0) return [];

  //   const filesToDelete = list.map((file) => `${folderPath}/${file.name}`);
  //   const { data, error } = await supabase.storage
  //     .from(this.bucketName)
  //     .remove(filesToDelete);

  //   if (error) throw error;
  //   return data;
  // }
}
