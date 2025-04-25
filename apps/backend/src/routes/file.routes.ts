import express, { Router } from 'express';
import passport from 'passport';
import multer from 'multer';

import {
  uploadFileController,
  listFilesController,
  getPublicUrlController,
  downloadFileController,
  deleteFileController,
} from '../controllers/file.controller';

const router: Router = express.Router({ mergeParams: true });
const upload = multer();

router.use(passport.authenticate('jwt', { session: false }));

router.post(`/upload`, upload.array('files'), uploadFileController);
router.get(`/list`, listFilesController);
router.get(`/public/:filename`, getPublicUrlController);
router.get(`/download/:filename`, downloadFileController);
router.delete(`/:fileId`, deleteFileController);

export default router;
