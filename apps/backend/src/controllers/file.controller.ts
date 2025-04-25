import { Request, Response } from 'express';
import { FileService } from '../services/file.service';

const filesService = new FileService();

export class FileController {
  constructor(private userId: string, private orgId: string) {}

  static uploadFileController = async (req: Request, res: Response) => {
    const { fileType } = req.params;
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || !files.length) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const result = await filesService.uploadFile(
        files,
        fileType,
        this.userId
      );
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  static listFilesController = async (req: Request, res: Response) => {
    const { fileType } = req.params;
    try {
      const files = await filesService.listFiles(fileType, this.orgId);
      res.status(200).json(files);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  static getPublicUrlController = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const url = await filesService.getPublicUrl(filename);
      res.status(200).json({ url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  static downloadFileController = async (req: Request, res: Response) => {
    const { fileType, fileId } = req.params;

    try {
      const file = await filesService.downloadFile(
        fileType,
        this.userId,
        fileId
      );
      file?.body?.pipe(res);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  static deleteFileController = async (req: Request, res: Response) => {
    const { fileType, fileId } = req.params;
    try {
      const result = await filesService.deleteFile(
        fileId,
        fileType,
        this.userId
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}
