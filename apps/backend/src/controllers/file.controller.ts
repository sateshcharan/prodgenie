import { Request, Response } from 'express';

import { FileService } from '../services/index.js';

const fileService = new FileService();

export class FileController {
  constructor(private userId: string, private orgId: string) {}

  static uploadFileController = async (req: Request, res: Response) => {
    try {
      const { fileType } = req.params;
      const userId = req.user?.id;

      const files = req.files as Express.Multer.File[];
      if (!files?.length) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const result = await fileService.uploadFile(files, fileType, userId);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };

  static listFilesController = async (req: Request, res: Response) => {
    try {
      const { fileType } = req.params;
      const orgId = req.user?.orgId;

      const files = await fileService.listFiles(fileType, orgId);
      return res.status(200).json(files);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };

  static deleteFileController = async (req: Request, res: Response) => {
    try {
      const { fileType, fileId } = req.params;
      const userId = req.user?.id;

      const result = await fileService.deleteFile(fileId, fileType, userId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };
}
