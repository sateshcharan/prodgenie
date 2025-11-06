import express, { Router } from 'express';

import { validateFileType, asyncHandler } from '../middlewares/index';
import { SequenceController } from '../controllers/index';

import { apiRoutes } from '@prodgenie/libs/constant';

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
