import { Request, Response } from 'express';
import { FileService } from '../services/file.service';

const folder = 'your-folder';

const filesService = new FileService(folder);

export const uploadFileController = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file provided' });

    const result = await filesService.uploadFile(
      file.originalname,
      file.buffer
    );
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const listFilesController = async (req: Request, res: Response) => {
  const fileType = req.params.fileType;
  try {
    const files = await filesService.listFiles(fileType);
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
  const fileType = req.params.fileType;
  try {
    const { fileId } = req.params;
    const result = await filesService.deleteFile(fileId, fileType);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
