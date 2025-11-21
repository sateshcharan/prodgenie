import { Request, Response } from 'express';

import { FileService } from '../services/index.js';

const fileService = new FileService();

export class FileController {
  static uploadFileController = async (req: Request, res: Response) => {
    const user = req.user!;
    const { fileType } = req.params;
    const activeWorkspaceId = req.activeWorkspaceId!;
    const files = req.files as Express.Multer.File[];

    if (!files?.length) {
      throw new Error('No files uploaded');
    }

    const result = await fileService.handleUpload(
      files,
      fileType,
      user,
      activeWorkspaceId
    );

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
    const { fileType } = req.params;
    const activeWorkspaceId = req.activeWorkspaceId!;
    const { skip, limit, minimal } = req.query;

    const options = {
      minimal: minimal === 'true',
      skip: Number(skip) || 0,
      limit: Number(limit) || 8,
    };

    const result = await fileService.listFiles(
      fileType,
      activeWorkspaceId,
      options
    );

    return res.status(200).json(result);
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

    const result = await fileService.deleteFile(
      fileId,
      fileType,
      user,
      activeWorkspaceId
    );
    return res.status(200).json(result);
  };

  static renameFileController = async (req: Request, res: Response) => {
    const { newName, fileId } = req.body;

    const result = await fileService.renameFile(fileId, newName);
    return res.status(200).json(result);
  };
}
