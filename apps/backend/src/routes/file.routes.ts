import express, { Router } from 'express';
import multer from 'multer';

import { validateFileType, asyncHandler } from '../middlewares/index';
import { FileController } from '../controllers/index';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router({ mergeParams: true }); // to merge parent params
const upload = multer();

router.get(
  apiRoutes.files.list(':fileType'),
  // validateFileType,
  asyncHandler(FileController.listFilesController)
);

router.get(
  apiRoutes.files.getById(':fileId'),
  // validateFileType,
  asyncHandler(FileController.getFileByIdController)
);

router.get(
  apiRoutes.files.getFileData(':fileId'),
  // validateFileType,
  asyncHandler(FileController.getFileDataController)
);

router.post(
  apiRoutes.files.setFileData(':fileId'),
  // validateFileType,
  asyncHandler(FileController.setFileDataController)
)

router.get(
  apiRoutes.files.getByName(':fileName'),
  // validateFileType,
  asyncHandler(FileController.getFileByNameController)
);

router.post(
  apiRoutes.files.upload(':fileType'),
  [upload.array('files'), validateFileType],
  asyncHandler(FileController.uploadFileController)
);

router.put(
  apiRoutes.files.rename(':fileType'),
  validateFileType,
  asyncHandler(FileController.renameFileController)
);

router.patch(
  apiRoutes.files.update(':fileId'),
  // validateFileType,
  asyncHandler(FileController.updateFileController)
);

router.post(
  apiRoutes.files.replace(':fileType', ':fileId'),
  // [upload.array('files'), validateFileType],
  [upload.array('files')],
  asyncHandler(FileController.replaceFileController)
);

router.delete(
  apiRoutes.files.delete(':fileType', ':fileId'),
  validateFileType,
  asyncHandler(FileController.deleteFileController)
);

export { router };
