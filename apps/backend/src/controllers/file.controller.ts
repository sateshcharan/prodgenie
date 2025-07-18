import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { writeFile } from 'fs/promises';
import path from 'path';

import { FileService, ThumbnailService } from '../services/index.js';
import { fileProcessingQueue } from '@prodgenie/libs/queues';

const fileService = new FileService();
const thumbnailService = new ThumbnailService();

export class FileController {
  static uploadFileController = async (req: Request, res: Response) => {
    const user = req.user;
    const { fileType } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const filesWithId = files.map((file) => ({
      ...file,
      id: randomUUID(),
    }));

    const result = await fileService.uploadFile(filesWithId, fileType, user);

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
          user
        );
      }
    }

    if (fileType === 'drawing') {
      for (const file of filesWithId) {
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
    const user = req.user;
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

  static listFilesController = async (req: Request, res: Response) => {
    const { fileType } = req.params;
    const orgId = req.user?.orgId;

    const files = await fileService.listFiles(fileType, orgId);
    return res.status(200).json(files);
  };

  static getFileByIdController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const orgId = req.user?.orgId;

    const file = await fileService.getFileById(fileId, orgId);
    return res.status(200).json(file);
  };

  static getFileByNameController = async (req: Request, res: Response) => {
    const { fileName } = req.params;
    const orgId = req.user?.orgId;

    const file = await fileService.getFileByName(fileName, orgId);
    return res.status(200).json(file);
  };

  static getFileDataController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const orgId = req.user?.orgId;

    const file = await fileService.getFileData(fileId, orgId);
    return res.status(200).json(file);
  };

  static getThumbnailController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const orgId = req.user?.orgId;

    const file = await fileService.getThumbnail(fileId, orgId);
    return res.status(200).json(file);
  };

  static updateThumbnailController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const user = req.user;
    const files = req.files as Express.Multer.File[];

    if (!files?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    await fileService.updateThumbnail(files, fileId, user);
    return res.status(200).json({ message: 'Thumbnail updated' });
  };

  static deleteFileController = async (req: Request, res: Response) => {
    const { fileType, fileId } = req.params;
    const user = req.user;

    const result = await fileService.deleteFile(fileId, fileType, user);
    return res.status(200).json(result);
  };

  static renameFileController = async (req: Request, res: Response) => {
    const { newName, fileId } = req.body;

    const result = await fileService.renameFile(fileId, newName);
    return res.status(200).json(result);
  };
}
