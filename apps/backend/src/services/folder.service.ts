import { supabase } from '@prodgenie/libs/supabase';
import { prisma } from '@prodgenie/libs/prisma';

export class FolderService {
  private readonly bucketName: string = process.env.BUCKET ?? '';

  constructor() {
    if (!process.env.BUCKET) {
      throw new Error('BUCKET env variable is not defined');
    }
    this.bucketName = process.env.BUCKET;
  }

  async scaffoldFolder(orgName: string) {
    const existingOrg = await prisma.org.findUnique({
      where: { name: orgName },
    });

    if (existingOrg) {
      return 'Organization already exists contact org admin';
    }

    const paths = [
      `${orgName}/drawings/.init`,
      `${orgName}/templates/.init`,
      `${orgName}/sequences/.init`,
      `${orgName}/job_cards/.init`,
    ];

    for (const path of paths) {
      const { error } = await supabase.storage
        .from(this.bucketName)
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
    await prisma.org.create({
      data: { name: orgName },
    });
  }
}
