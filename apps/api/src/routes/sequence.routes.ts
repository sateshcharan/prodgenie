import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { validateFileType } from '../middlewares/fileType.middleware';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { SequenceController } from '../controllers/sequence.controller';

const router: Router = express.Router({ mergeParams: true }); // to merge parent params

router.post(
  apiRoutes.sequence.sync,
  // validateFileType,
  asyncHandler(SequenceController.syncAllSequence)
);

router.get(
  apiRoutes.sequence.getJobCardDataFromSequence(':sequence'),
  // validateFileType,
  asyncHandler(SequenceController.getJobCardDataFromSequence)
);

export { router };
