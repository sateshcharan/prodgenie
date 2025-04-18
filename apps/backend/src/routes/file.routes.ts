import multer from 'multer';
import express, { Router } from 'express';
import { apiRoutes, fileTypes } from '@prodgenie/libs/constant';
import {
  uploadFileController,
  listFilesController,
  getPublicUrlController,
  downloadFileController,
  deleteFileController,
} from '../controllers/file.controller';

const router: Router = express.Router();
const upload = multer(); // in-memory

fileTypes.map((fileType) => {
  router.post(
    `${apiRoutes.fileRoutes.url}/${fileType}/upload`,
    upload.single('file'),
    uploadFileController
  );
  router.get(
    `${apiRoutes.fileRoutes.url}/${fileType}/list`,
    listFilesController
  );
  router.get(
    `${apiRoutes.fileRoutes.url}/${fileType}/public/:filename`,
    getPublicUrlController
  );
  router.get(
    `${apiRoutes.fileRoutes.url}/${fileType}/download/:filename`,
    downloadFileController
  );
  router.delete(
    `${apiRoutes.fileRoutes.url}/${fileType}/:filename`,
    deleteFileController
  );
});

export default router;
