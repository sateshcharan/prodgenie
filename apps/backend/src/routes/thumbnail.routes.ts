import express, { Router } from 'express';
import multer from 'multer';

import { validateFileType, asyncHandler } from '../middlewares/index';
import { ThumbnailController } from '../controllers/index';

import { apiRoutes } from '@prodgenie/libs/constant';

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

export { router };
