import { Request, Response } from 'express';

import { ThumbnailService } from '../services/index.js';

const thumbnailService = new ThumbnailService();

export class ThumbnailController {
  static getThumbnailController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const orgId = req.user?.orgId;

    const files = await thumbnailService.get(fileId, orgId);
    return res.status(200).json(files);
  };

  static setThumbnailController = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const orgId = req.user?.orgId;

    const files = await thumbnailService.set(fileId, orgId, req.user);
    return res.status(200).json(files);
  };

  static updateThumbnailController = async (req: Request, res: Response) => {
    const { files } = req;
    const file = files[0];
    const { fileId } = req.params;
    const user = req.user;
    const activeWorkspaceId = req.activeWorkspaceId;

    // const orgId = req.user?.orgId;
    // const file = req.files as Express.Multer.File[];
    if (!file) throw new Error('No files uploaded');

    await thumbnailService.update(file, fileId, user, activeWorkspaceId);
    return res.status(200).json('Thumbnail updated');
  };
}
