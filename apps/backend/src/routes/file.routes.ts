import express, { Router } from 'express';
import passport from 'passport';
import multer from 'multer';

import { FileController } from '../controllers/file.controller';

const router: Router = express.Router({ mergeParams: true }); // to merge parent params
const upload = multer();

router.use(passport.authenticate('jwt', { session: false }));

router.post(
  `/upload`,
  upload.array('files'),
  FileController.uploadFileController
);
router.get(`/list`, FileController.listFilesController);
router.get(`/public/:filename`, FileController.getPublicUrlController);
router.get(`/download/:filename`, FileController.downloadFileController);
router.delete(` /:fileId`, FileController.deleteFileController);

export default router;
