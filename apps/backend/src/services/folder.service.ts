import { supabase } from '@prodgenie/libs/supabase';
import { prisma } from '@prodgenie/libs/prisma';

export class FolderService {
  private bucket: string;

  constructor(bucketName: string) {
    this.bucket = bucketName;
  }

  async fetchFolder(orgName: string): Promise<any> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .list(`${orgName}/`, {
        limit: 100,
        offset: 0,
        search: '',
      });

    if (error) {
      throw new Error(`Failed to fetch folder: ${error.message}`);
    }

    return data;
  }

  async scafoldFolder(orgName: string) {
    const existingOrg = await prisma.organization.findUnique({
      where: { name: orgName },
    });

    if (existingOrg) {
      return;
    }

    await prisma.organization.create({
      data: { name: orgName },
    });

    const paths = [
      `${orgName}/drawings/.init`,
      `${orgName}/templates/.init`,
      `${orgName}/sequences/.init`,
      `${orgName}/job_cards/.init`,
    ];

    for (const path of paths) {
      const { error } = await supabase.storage
        .from(this.bucket)
        .upload(path, '', {
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
}
