import { prisma } from '@prodgenie/libs/db';
import { supabaseAdmin } from '@prodgenie/libs/supabase';

import { FileType } from '@prisma/client';

export class FolderService {
  private readonly bucketName: string = process.env.BUCKET ?? '';

  constructor() {
    if (!process.env.BUCKET) {
      throw new Error('BUCKET env variable is not defined');
    }
    this.bucketName = process.env.BUCKET;
  }

  async scaffoldFolder(workspaceName: string, planId: string) {
    const existingOrg = await prisma.workspace.findFirst({
      where: { name: workspaceName },
    });

    if (existingOrg) {
      return 'Organization already exists contact org admin';
    }

    const paths: string[] = [];
    for (const fileType of Object.values(FileType)) {
      paths.push(`${workspaceName}/${fileType}/.init`);
    }

    //other than filetype
    paths.push(`${workspaceName}/thumbnail/.init`);

    for (const path of paths) {
      const { error } = await supabaseAdmin.storage
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
    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,

        //default plan
        credits: 100,
        planId,
      },
    });
    return workspace;
  }
}
