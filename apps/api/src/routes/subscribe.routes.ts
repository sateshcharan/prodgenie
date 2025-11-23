import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { asyncHandler } from '../middlewares';
import { SubscribeController } from '../controllers/subscribe.controller';

const router: Router = express.Router();

router.post(
  apiRoutes.subscribe.newsletter,
  asyncHandler(SubscribeController.newsletter)
);

export { router };
