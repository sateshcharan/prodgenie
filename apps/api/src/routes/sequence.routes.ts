import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { SequenceController } from '../controllers/index';
import { validateFileType, asyncHandler } from '../middlewares/index';

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
