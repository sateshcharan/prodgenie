import path from 'path';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { json } from 'stream/consumers';

import { fileType } from '@prisma/client';
import { fileProcessingQueue } from '@prodgenie/libs/redis';
import { FileStorageService } from '@prodgenie/libs/supabase';
import { status, prisma, EventService } from '@prodgenie/libs/db';

import { ThumbnailService } from './thumbnail.service';

export class FileService {
  static async uploadFile(
    filesWithId: any[],
    fileType: string,
    user: any,
    activeWorkspace: any
  ) {
    const savedFiles: any[] = [];
    const workspaceId = activeWorkspace?.workspace?.id;
    const userId = user?.id;
    // const folder = activeWorkspace?.workspace?.name.trim();
    const folder = workspaceId;

    if (!folder || !workspaceId || !userId) {
      throw new Error('Workspace or user information is missing');
    }

    for (const file of filesWithId) {
      const extension = file.originalname.split('.').pop();
      const uploadPath = `${folder}/${fileType}/${file.id}.${extension}`;

      await FileStorageService.uploadFile(
        uploadPath,
        file
        // fileType, user
      ); // upload to storage

      // save file entry in the database
      const savedFile = await prisma.file.create({
        data: {
          id: file.id,
          name: file.originalname,
          path: uploadPath,
          userId: userId,
          workspaceId,
          type: fileType as fileType,
        },
      });

      savedFiles.push(savedFile);
    }

    // const workspace = await prisma.workspace.findUnique({
    //   where: { id: workspaceId },
    //   select: { credits: true },
    // });

    // await EventService.record({
    //   userId,
    //   workspaceId,
    //   relatedFileId: savedFiles[0].id,
    //   type: 'FILE_UPLOADED',
    //   details: { filename: 'plan.pdf' },
    //   status: status.COMPLETED,
    //   reason: 'File uploaded successfully',
    // });

    return savedFiles;
  }

  static async handleUpload(
    files: any[],
    fileType: string,
    user: any,
    activeWorkspaceId: string
  ) {
    const activeWorkspace = user.memberships.find(
      (m) => m.workspace.id === activeWorkspaceId
    );
    if (!activeWorkspace) {
      return { message: 'Invalid workspace' };
    }

    const filesWithId = files.map((file) => ({
      ...file,
      id: randomUUID(),
    }));

    // upload files
    const savedFiles = await this.uploadFile(
      filesWithId,
      fileType,
      user,
      activeWorkspace
    );

    // queue thumbnail generation
    for (const file of filesWithId) {
      const screenshotBuffer = await ThumbnailService.generate(file, fileType);

      if (screenshotBuffer) {
        const tmpPath = path.join('/tmp', `${file.id}-thumbnail.jpg`);
        await writeFile(tmpPath, screenshotBuffer);

        await ThumbnailService.set(
          {
            ...file,
            buffer: screenshotBuffer,
            originalname: `${file.id}.jpg`,
            mimetype: 'image/jpeg',
          } as any,
          file.id,
          user,
          activeWorkspace
        );
      }

      if (fileType === 'drawing') {
        // add empty file data using the bom.json config
        const { data: bomConfigData } = await prisma.file.findFirst({
          where: {
            workspaceId: activeWorkspaceId,
            type: 'config',
            name: 'bom.json',
          },
          select: { data: true },
        });

        await prisma.file.update({
          where: { id: file.id },
          data: {
            data: Object.keys(bomConfigData).reduce(
              (acc, key) => ({
                ...acc,
                [key]: [],
              }),
              {}
            ),
          },
        });

        // add file to processing queue for data extraction
        // await fileProcessingQueue.add(
        //   'process-file',
        //   { file },
        //   { jobId: file.id }
        // );
      }
    }

    return savedFiles;
  }

  static async updateFile(fileId: string, data: Record<string, any>) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    const mergedData = { ...(file.data || {}), ...data };

    return prisma.file.update({
      where: { id: fileId },
      data: { data: mergedData },
    });
  }

  static async replaceFile(
    fileId: string,
    fileType: string,
    uploadedFiles: any[],
    user: any
  ) {
    const dbFile = await prisma.file.findUnique({ where: { id: fileId } });
    if (!dbFile) throw new Error('File not found');

    const replacement = await FileStorageService.replaceFile(
      dbFile.path,
      uploadedFiles[0],
      fileType,
      user
    );

    return prisma.file.update({
      where: { id: fileId },
      data: { path: replacement.path },
    });
  }

  private static async safeSignedUrl(path?: string | null) {
    if (!path) return null;

    try {
      return await FileStorageService.getSignedUrl(path);
    } catch (err) {
      console.warn('Signed URL failed for:', path);
      return null; // 🔥 DO NOT THROW
    }
  }

  static async listFiles(
    fileType: string,
    workspaceId: string,
    options?: {
      minimal?: boolean;
      skip?: number;
      limit?: number;
    }
  ) {
    const { minimal = false, skip = 0, limit = 20 } = options || {};

    const selectMinimal = {
      id: true,
      name: true,
      thumbnail: true,
      createdAt: true,
      path: true,
    };

    // 1️⃣ Fetch base files (shared logic)
    const files = await prisma.file.findMany({
      where: { workspaceId, type: fileType as fileType },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      ...(minimal ? { select: selectMinimal } : {}),
    });

    if (!files.length) {
      return {
        items: [],
        pageInfo: {
          total: 0,
          page: 1,
          hasMore: false,
        },
      };
    }

    // 2️⃣ Handle special config-file behavior
    let extraData: (any | null)[] = [];

    if (fileType === 'config') {
      extraData = await Promise.all(
        files.map(async (file) => {
          try {
            const config = await this.getFileData(file.id);
            return config?.data || null;
          } catch {
            return null;
          }
        })
      );
    }

    // // 3️⃣ Enrich: signed URLs + optional extraData
    // const enriched = await Promise.all(
    //   files.map(async (file, i) => {
    //     const thumbnailUrl = file.thumbnail
    //       // ? await FileStorageService.getCachedSignedUrl(file.thumbnail) // with caching
    //       ? await FileStorageService.getSignedUrl(file.thumbnail)
    //       : null;

    //     const pathUrl = file.path
    //       // ? await FileStorageService.getCachedSignedUrl(file.path) // with caching
    //       ? await FileStorageService.getSignedUrl(file.path)
    //       : null;

    //     return {
    //       ...file,
    //       thumbnail: thumbnailUrl,
    //       path: pathUrl,
    //       ...(fileType === 'config' ? { data: extraData[i] } : {}),
    //     };
    //   })
    // );

    const enriched = await Promise.all(
      files.map(async (file, i) => {
        const [thumbnailUrl, pathUrl] = await Promise.all([
          this.safeSignedUrl(file.thumbnail),
          this.safeSignedUrl(file.path),
        ]);

        return {
          ...file,
          thumbnail: thumbnailUrl,
          path: pathUrl,
          ...(fileType === 'config' ? { data: extraData[i] } : {}),
        };
      })
    );

    // 4️⃣ Pagination info
    const total = await prisma.file.count({
      where: { workspaceId, type: fileType as fileType },
    });

    return {
      files: enriched,
      pageInfo: {
        total,
        page: Math.floor(skip / limit) + 1,
        hasMore: skip + limit < total,
      },
    };
  }

  static async getFileById(fileId: string, workspaceId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId, workspaceId },
    });
    if (!file) return { data: null, error: 'No file found' };

    // const signedUrl = await FileStorageService.getCachedSignedUrl(file.path);
    const signedUrl = await FileStorageService.getSignedUrl(file.path);
    return { data: { ...file, path: signedUrl }, error: null };
  }

  static async getFileByName(fileName: string, workspaceId: string) {
    const file = await prisma.file.findFirst({
      where: { name: fileName, workspaceId },
    });
    if (!file) return { data: null, error: 'No file found' };

    const signedUrl = await FileStorageService.getCachedSignedUrl(file.path);
    return { data: { ...file, signedUrl }, error: null };
  }

  static async getFileData(fileId: string) {
    const data = await prisma.file.findUnique({
      where: { id: fileId },
      select: { data: true },
    });
    if (!data) return { data: null, error: 'No file found' };
    return data;
  }

  static async setFileData(fileId: string, data: any) {
    return prisma.file.update({
      where: { id: fileId },
      data: { data },
    });
  }

  static async updateFileData(fileId: string, data: any) {
    const { data: existingFileData } = await prisma.file.findUnique({
      where: { id: fileId },
      select: { data: true },
    });

    const updatedFileData = {
      ...existingFileData,
      ...data,
    };

    return prisma.file.update({
      where: { id: fileId },
      data: { data: updatedFileData },
    });
  }

  static async getThumbnail(fileId: string, workspaceId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId, workspaceId },
    });
    if (!file) return { data: null, error: 'No file found' };

    const signedUrl = await FileStorageService.getCachedSignedUrl(
      file.thumbnail
    );
    return { data: { ...file, path: signedUrl }, error: null };
  }

  static async updateThumbnail(
    reqFiles: Express.Multer.File[],
    fileId: string,
    user: any
  ) {
    if (!reqFiles?.length) throw new Error('No files uploaded');
    const uploadedFile = reqFiles[0];

    const dbFile = await prisma.file.findUnique({
      where: { id: fileId },
      select: { thumbnail: true },
    });

    if (!dbFile) throw new Error('File not found');

    const newThumb = await FileStorageService.replaceFile(
      dbFile.thumbnail,
      uploadedFile,
      'thumbnail',
      user
    );

    return prisma.file.update({
      where: { id: fileId },
      data: { thumbnail: newThumb.path },
    });
  }

  static async duplicateFile(
    fileId: string,
    fileType: string,
    duplicateFileName: string
  ) {
    // Check if name already exists in workspace
    // const existing = await prisma.file.findFirst({
    //   where: {
    //     type: fileType as fileType,
    //     name: duplicateFileName,
    //   },
    // });

    // console.log(
    //   'Checking for existing file with name:',
    //   duplicateFileName,
    //   existing
    // );

    // if (existing) {
    //   throw new Error('File with this name already exists');
    // }

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    const duplicateFileId = randomUUID();
    const extension = file.path.split('.').pop();
    const newPath =
      file.path.split('/').slice(0, -1).join('/') +
      `/${duplicateFileId}.${extension}`;

    // Duplicate file entry in the database
    await prisma.file.create({
      data: {
        id: duplicateFileId,
        name: `${duplicateFileName}.${extension}`,
        path: newPath,
        type: file.type,
        workspaceId: file.workspaceId,
        userId: file.userId,
        data: file.data,
        thumbnail: file.thumbnail,
      },
    });

    // Duplicate the file in storage
    await FileStorageService.duplicateFile(file.path, fileType, newPath);

    //Duplicate thumbnail entry in database
  }

  static async deleteFile(
    fileId: string,
    fileType: string,
    user: any,
    activeWorkspaceId: any
  ) {
    const userId = user?.id;
    const activeWorkspace = user.memberships.find(
      (m) => m.workspace.id === activeWorkspaceId
    );
    const folder = activeWorkspace?.workspace.name.trim();

    if (!folder || !userId) {
      throw new Error('User or workspace details missing');
    }

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    await FileStorageService.deleteFile(file.path, fileType, user);
    return prisma.file.delete({ where: { id: fileId } });
  }

  static async renameFile(fileId: string, newName: string) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    const extension = file.path.split('.').pop();
    const newPath =
      file.path.split('/').slice(0, -1).join('/') + `/${fileId}.${extension}`;

    const newNameWithExtension = newName + '.' + extension;

    await FileStorageService.renameFile(file.path, newPath);

    return prisma.file.update({
      where: { id: fileId },
      data: { name: newNameWithExtension, path: newPath },
    });
  }
}
