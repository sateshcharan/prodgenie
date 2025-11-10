import { randomUUID } from 'crypto';
import { json } from 'stream/consumers';

import { FileType } from '@prisma/client';
import { EventStatus, prisma, EventService } from '@prodgenie/libs/db';
import { FileStorageService } from '@prodgenie/libs/supabase';

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

      try {
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
      } catch (err) {
        console.error(`Upload failed for ${file.originalname}:`, err);
      }
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

  async listFiles(fileType: string, activeWorkspaceId: string) {
    const files = await prisma.file.findMany({
      where: { workspaceId: activeWorkspaceId, type: fileType as FileType },
    });

    if (!files.length) return { data: null, error: 'No files found' };

    const data = await Promise.all(
      files.map(async (file) => ({
        ...file,
        path: await fileStorageService.getSignedUrl(file.path),
      }))
    );

    return { data, error: null };
  }

  async getFileById(fileId: string, workspaceId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId, workspaceId },
    });
    if (!file) return { data: null, error: 'No file found' };

    const signedUrl = await fileStorageService.getSignedUrl(file.path);
    return { data: { ...file, path: signedUrl }, error: null };
  }

  async getFileByName(fileName: string, workspaceId: string) {
    const file = await prisma.file.findFirst({
      where: { name: fileName, workspaceId },
    });
    if (!file) return { data: null, error: 'No file found' };

    const signedUrl = await fileStorageService.getSignedUrl(file.path);
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

    const signedUrl = await fileStorageService.getSignedUrl(file.thumbnail);
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
    activeWorkspace: any
  ) {
    const userId = user?.id;
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
