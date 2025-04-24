import multer from 'multer';
import express, { Router } from 'express';
import { apiRoutes } from '@prodgenie/libs/constant';
import {
  uploadFileController,
  listFilesController,
  getPublicUrlController,
  downloadFileController,
  deleteFileController,
} from '../controllers/file.controller';
import { validateFileType } from '../middlewares/fileType.middleware';

const router: Router = express.Router();
const upload = multer(); // in-memory

router.post(
  `${apiRoutes.fileRoutes.url}/:fileType/upload`,
  upload.single('file'),
  uploadFileController
);
router.get(
  `${apiRoutes.fileRoutes.url}/:fileType/list`,
  validateFileType,
  listFilesController
);
router.get(
  `${apiRoutes.fileRoutes.url}/:fileType/public/:filename`,
  getPublicUrlController
);
router.get(
  `${apiRoutes.fileRoutes.url}/:fileType/download/:filename`,
  downloadFileController
);
router.delete(
  `${apiRoutes.fileRoutes.url}/:fileType/:fileId`,
  deleteFileController
);

export default router;
