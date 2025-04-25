import { Request, Response } from 'express';
import { FileService } from '../services/file.service';

const filesService = new FileService();

export const uploadFileController = async (req: Request, res: Response) => {
  const { fileType } = req.params;
  const userId = req.user?.id;
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || !files.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const result = await filesService.uploadFile(files, fileType, userId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const listFilesController = async (req: Request, res: Response) => {
  const { fileType } = req.params;
  const orgId = req.user?.orgId;
  try {
    const files = await filesService.listFiles(fileType, orgId);
    res.status(200).json(files);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicUrlController = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const url = await filesService.getPublicUrl(filename);
    res.status(200).json({ url });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadFileController = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const file = await filesService.downloadFile(filename);
    file?.body?.pipe(res);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFileController = async (req: Request, res: Response) => {
  const { fileType, fileId } = req.params;
  try {
    const result = await filesService.deleteFile(fileId, fileType);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
