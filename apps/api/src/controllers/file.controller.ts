import path from 'path';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { Request, Response } from 'express';

import { prisma } from '@prodgenie/libs/prisma';
import { fileProcessingQueue } from '@prodgenie/libs/queues';

import { FileService, ThumbnailService } from '../services/index.js';

const fileService = new FileService();
const thumbnailService = new ThumbnailService();

export class FileController {
  static uploadFileController = async (req: Request, res: Response) => {
    const user = req.user!;
    const { fileType } = req.params;
    const activeWorkspaceId = req.activeWorkspaceId!;
    const files = req.files as Express.Multer.File[];

    if (!files?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const activeWorkspace = user.memberships.find(
      (m) => m.workspace.id === activeWorkspaceId
    );
    if (!activeWorkspace) {
      return res.status(403).json({ message: 'Invalid workspace' });
    }

    const filesWithId = files.map((file) => ({
      ...file,
      id: randomUUID(),
    }));

    // upload files
    const result = await fileService.uploadFile(
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

    return res.status(201).json(result);
  };

  static updateFileController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const data = req.body;

    if (!data) {
      return res.status(400).json({ message: 'No data provided' });
    }

    const result = await fileService.updateFile(fileId, data);
    return res.status(200).json(result);
  };

  static replaceFileController = async (req: Request, res: Response) => {
    const user = req.user!;
    const { fileId, fileType } = req.params;
    const uploadedFiles = req.files as Express.Multer.File[];

    if (!uploadedFiles?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const result = await fileService.replaceFile(
      fileId,
      fileType,
      uploadedFiles,
      user
    );
    return res.status(200).json(result);
  };

  static duplicateFileController = async (req: Request, res: Response) => {
    const { fileType } = req.params;
    const { fileId, duplicateFileName } = req.body;

    const result = await fileService.duplicateFile(
      fileId,
      fileType,
      duplicateFileName
    );
    return res.status(200).json(result);
  };

  static listFilesController = async (req: Request, res: Response) => {
    try {
      const { fileType } = req.params;
      const activeWorkspaceId = req.activeWorkspaceId!;

      if (fileType === 'config') {
        const configFiles = await prisma.file.findMany({
          where: { type: 'config', workspaceId: activeWorkspaceId },
        });

        // fetch file data for all config files in parallel
        const fileData = await Promise.all(
          configFiles.map((file) => fileService.getFileData(file.id))
        );

        const filesWithData = configFiles.map((file, index) => ({
          ...file,
          data: fileData[index].data,
        }));

        return res.status(200).json({ data: filesWithData });
      }

      const files = await fileService.listFiles(fileType, activeWorkspaceId);
      return res.status(200).json(files);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to list files' });
    }
  };

  static getFileByIdController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const activeWorkspaceId = req.activeWorkspaceId!;

    const file = await fileService.getFileById(fileId, activeWorkspaceId);
    return res.status(200).json(file);
  };

  static getFileByNameController = async (req: Request, res: Response) => {
    const { fileName } = req.params;
    const activeWorkspaceId = req.activeWorkspaceId!;

    const file = await fileService.getFileByName(fileName, activeWorkspaceId);
    return res.status(200).json(file);
  };

  static getFileDataController = async (req: Request, res: Response) => {
    const { fileId } = req.params;

    const file = await fileService.getFileData(fileId);
    return res.status(200).json(file);
  };

  static setFileDataController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const data = req.body;

    const file = await fileService.setFileData(fileId, data);
    return res.status(200).json(file);
  };

  static updateFileDataController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const data = req.body;

    const file = await fileService.updateFileData(fileId, data);
    return res.status(200).json(file);
  };

  static getThumbnailController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const activeWorkspaceId = req.activeWorkspaceId!;

    const file = await fileService.getThumbnail(fileId, activeWorkspaceId);
    return res.status(200).json(file);
  };

  static updateThumbnailController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const user = req.user!;
    const files = req.files as Express.Multer.File[];

    if (!files?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    await fileService.updateThumbnail(files, fileId, user);
    return res.status(200).json({ message: 'Thumbnail updated' });
  };

  static deleteFileController = async (req: Request, res: Response) => {
    const user = req.user!;
    const { fileType, fileId } = req.params;
    const activeWorkspaceId = req.activeWorkspaceId!;

    const activeWorkspace = user.memberships.find(
      (m) => m.workspace.id === activeWorkspaceId
    );

    const result = await fileService.deleteFile(
      fileId,
      fileType,
      user,
      activeWorkspace
    );
    return res.status(200).json(result);
  };

  static renameFileController = async (req: Request, res: Response) => {
    const { newName, fileId } = req.body;
    const result = await fileService.renameFile(fileId, newName);
    return res.status(200).json(result);
  };
}
