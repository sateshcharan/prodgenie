import { fileType } from '@prisma/client';

import { supabase } from './supabase.js';

const BUCKET = process.env.BUCKET!;

export class FolderService {
  static async scaffoldFolder(workspaceId: string) {
    // Generate folder paths
    const paths: string[] = [];
    for (const ft of Object.values(fileType)) {
      paths.push(`${workspaceId}/${ft}/.init`);
    }
    // extra paths
    paths.push(`${workspaceId}/thumbnail/.init`);

    // create folders
    for (const path of paths) {
      const { error } = await supabase.storage.from(BUCKET).upload(path, '', {
        upsert: false,
        contentType: 'application/octet-stream',
      });

      if (error && error.message !== 'The resource already exists') {
        throw new Error(
          `Failed to create folder for ${path}: ${error.message}`
        );
      }
    }
  }

  static async deleteFolderRecursive(prefix: string) {
    if (prefix && !prefix.endsWith('/')) prefix = prefix + '/';

    // console.log(prefix); // debug

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 1000 });

    // if (error || !data) return;
    if (error) {
      console.error(
        `Failed to list items for prefix ${prefix}: ${error.message}`
      );
      return;
    }

    const files: string[] = [];
    const folders: string[] = [];

    for (const item of data) {
      if (item.id === null) {
        folders.push(prefix + item.name); // it's a folder
      } else {
        files.push(prefix + item.name); // it's a file
      }
    }

    if (files.length > 0) {
      await supabase.storage.from(BUCKET).remove(files);
    }

    for (const folder of folders) {
      await this.deleteFolderRecursive(folder);
    }
  }
}
