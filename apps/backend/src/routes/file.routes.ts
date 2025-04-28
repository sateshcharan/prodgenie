import express, { Router } from 'express';
import passport from 'passport';
import multer from 'multer';
import { validateFileType } from '../middlewares/fileType.middleware';
import { FileController } from '../controllers/file.controller';

const router: Router = express.Router({ mergeParams: true }); // to merge parent params
const upload = multer();

router.use(passport.authenticate('jwt', { session: false }));

router.post(
  `/:fileType/upload`,
  [upload.array('files'), validateFileType],
  FileController.uploadFileController
);
router.get(
  `/:fileType/list`,
  validateFileType,
  FileController.listFilesController
);
router.delete(
  `/:fileType/:fileId`,
  validateFileType,
  FileController.deleteFileController
);

export default router;
