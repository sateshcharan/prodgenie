import path from 'path';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { json } from 'stream/consumers';

import { FileType } from '@prisma/client';
import { fileProcessingQueue } from '@prodgenie/libs/queues';
import { FileStorageService } from '@prodgenie/libs/supabase';
import { EventStatus, prisma, EventService } from '@prodgenie/libs/db';

import { ThumbnailService } from './thumbnail.service';

const fileStorageService = new FileStorageService();
const thumbnailService = new ThumbnailService();
const eventService = new EventService();

export class FileService {
  async uploadFile(
    filesWithId: any[],
    fileType: string,
    user: any,
    activeWorkspace: any
  ) {
    const savedFiles: any[] = [];
    const workspaceId = activeWorkspace?.workspace?.id;
    const userId = user?.id;
    const folder = activeWorkspace?.workspace?.name.trim();

    if (!folder || !workspaceId || !userId) {
      throw new Error('Workspace or user information is missing');
    }

    for (const file of filesWithId) {
      const extension = file.originalname.split('.').pop();
      const uploadPath = `${folder}/${fileType}/${file.id}.${extension}`;

      await fileStorageService.uploadFile(uploadPath, file, fileType, user);

      const savedFile = await prisma.file.create({
        data: {
          id: file.id,
          name: file.originalname,
          path: uploadPath,
          uploadedBy: userId,
          workspaceId,
          type: fileType as FileType,
        },
      });

      savedFiles.push(savedFile);
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { credits: true },
    });

    // await EventService.record({
    //   userId,
    //   workspaceId,
    //   relatedFileId: savedFiles[0].id,
    //   type: 'FILE_UPLOADED',
    //   details: { filename: 'plan.pdf' },
    //   status: EventStatus.COMPLETED,
    //   reason: 'File uploaded successfully',
    // });

    return savedFiles;
  }

  async handleUpload(
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
    const result = await this.uploadFile(
      filesWithId,
      fileType,
      user,
      activeWorkspace
    );

    // queue thumbnail generation
    for (const file of filesWithId) {
      const screenshotBuffer = await thumbnailService.generate(file, fileType);

      if (screenshotBuffer) {
        const tmpPath = path.join('/tmp', `${file.id}-thumbnail.jpg`);
        await writeFile(tmpPath, screenshotBuffer);

        await thumbnailService.set(
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
      // }

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
        await fileProcessingQueue.add(
          'process-file',
          { file },
          { jobId: file.id }
        );
      }
    }
    const savedFiles = await this.uploadFile(
      filesWithId,
      fileType,
      user,
      activeWorkspace
    );
    return savedFiles;
  }

  async updateFile(fileId: string, data: Record<string, any>) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    const mergedData = { ...(file.data || {}), ...data };

    return prisma.file.update({
      where: { id: fileId },
      data: { data: mergedData },
    });
  }

  async replaceFile(
    fileId: string,
    fileType: string,
    uploadedFiles: any[],
    user: any
  ) {
    const dbFile = await prisma.file.findUnique({ where: { id: fileId } });
    if (!dbFile) throw new Error('File not found');

    const replacement = await fileStorageService.replaceFile(
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

  async listFiles(
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
      where: { workspaceId, type: fileType as FileType },
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

    // 3️⃣ Enrich: signed URLs + optional extraData
    const enriched = await Promise.all(
      files.map(async (file, i) => {
        const thumbnailUrl = file.thumbnail
          ? await fileStorageService.getCachedSignedUrl(file.thumbnail)
          : null;

        const pathUrl = file.path
          ? await fileStorageService.getCachedSignedUrl(file.path)
          : null;

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
      where: { workspaceId, type: fileType as FileType },
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

  async getFileById(fileId: string, workspaceId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId, workspaceId },
    });
    if (!file) return { data: null, error: 'No file found' };

    const signedUrl = await fileStorageService.getCachedSignedUrl(file.path);
    return { data: { ...file, path: signedUrl }, error: null };
  }

  async getFileByName(fileName: string, workspaceId: string) {
    const file = await prisma.file.findFirst({
      where: { name: fileName, workspaceId },
    });
    if (!file) return { data: null, error: 'No file found' };

    const signedUrl = await fileStorageService.getCachedSignedUrl(file.path);
    return { data: { ...file, signedUrl }, error: null };
  }

  async getFileData(fileId: string) {
    const data = await prisma.file.findUnique({
      where: { id: fileId },
      select: { data: true },
    });
    if (!data) return { data: null, error: 'No file found' };
    return data;
  }

  async setFileData(fileId: string, data: any) {
    return prisma.file.update({
      where: { id: fileId },
      data: { data },
    });
  }

  async updateFileData(fileId: string, data: any) {
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

  async getThumbnail(fileId: string, workspaceId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId, workspaceId },
    });
    if (!file) return { data: null, error: 'No file found' };

    const signedUrl = await fileStorageService.getCachedSignedUrl(
      file.thumbnail
    );
    return { data: { ...file, path: signedUrl }, error: null };
  }

  async updateThumbnail(
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

    const newThumb = await fileStorageService.replaceFile(
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

  async duplicateFile(
    fileId: string,
    fileType: string,
    duplicateFileName: string
  ) {
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
        uploadedBy: file.uploadedBy,
        data: file.data,
        thumbnail: file.thumbnail,
      },
    });

    // Duplicate the file in storage
    await fileStorageService.duplicateFile(file.path, fileType, newPath);

    //Duplicate thumbnail entry in database
  }

  async deleteFile(
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

    await fileStorageService.deleteFile(file.path, fileType, user);
    return prisma.file.delete({ where: { id: fileId } });
  }

  async renameFile(fileId: string, newName: string) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    const extension = file.path.split('.').pop();
    const newPath =
      file.path.split('/').slice(0, -1).join('/') + `/${fileId}.${extension}`;

    const newNameWithExtension = newName + '.' + extension;

    await fileStorageService.renameFile(file.path, newPath);

    return prisma.file.update({
      where: { id: fileId },
      data: { name: newNameWithExtension, path: newPath },
    });
  }
}
