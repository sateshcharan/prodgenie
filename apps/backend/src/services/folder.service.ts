import { supabase } from '@prodgenie/libs/supabase';

export class FolderService {
  private bucket: string;

  constructor(bucketName: string) {
    this.bucket = bucketName;
  }

  async scafoldFolder(folder: string) {
    const paths = [
      `${folder}/drawings/.init`,
      `${folder}/templates/.init`,
      `${folder}/job_cards/.init`,
    ];

    for (const path of paths) {
      const { error } = await supabase.storage
        .from(this.bucket)
        .upload(path, '', {
          upsert: false,
          contentType: 'application/octet-stream',
        });

      if (error && error.message !== 'The resource already exists') {
        throw new Error(`Failed to create folder ${path}: ${error.message}`);
      }
    }
  }
}
