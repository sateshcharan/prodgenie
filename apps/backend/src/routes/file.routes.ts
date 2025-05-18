import multer from 'multer';
import express, { Router } from 'express';

import { validateFileType } from '../middlewares/index';
import { FileController } from '../controllers/index';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router({ mergeParams: true }); // to merge parent params
const upload = multer();

router.post(
  apiRoutes.files.upload(':fileType'),
  [upload.array('files'), validateFileType],
  FileController.uploadFileController
);
router.get(
  apiRoutes.files.list(':fileType'),
  validateFileType,
  FileController.listFilesController
);
router.delete(
  apiRoutes.files.delete(':fileType', ':fileId'),
  validateFileType,
  FileController.deleteFileController
);

export { router };
