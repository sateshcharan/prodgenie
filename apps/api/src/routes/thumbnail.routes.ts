import multer from 'multer';
import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { ThumbnailController } from '../controllers/thumbnail.controller';
import { validateFileType } from '../middlewares/fileType.middleware';

const router: Router = express.Router({ mergeParams: true }); // to merge parent params
const upload = multer();

router.get(
  apiRoutes.thumbnail.get(':fileId'),
  // validateFileType,
  asyncHandler(ThumbnailController.getThumbnailController)
);
router.post(
  apiRoutes.thumbnail.set(':fileId'),
  // validateFileType,
  asyncHandler(ThumbnailController.setThumbnailController)
);
router.post(
  apiRoutes.thumbnail.update(':fileId'),
  [
    upload.array('files'),
    // validateFileType
  ],
  asyncHandler(ThumbnailController.updateThumbnailController)
);
router.post(
  apiRoutes.thumbnail.regenerate(':fileType'),
  // validateFileType,
  asyncHandler(ThumbnailController.regenerateThumbnailController)
);

export { router };
