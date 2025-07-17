import express, { Router } from 'express';

import { UserController } from '../controllers/index.js';
import { asyncHandler } from '../middlewares/index.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.post(apiRoutes.users.create, asyncHandler(UserController.createUser));
router.get(
  apiRoutes.users.list(':orgId'),
  asyncHandler(UserController.listUsers)
);
router.get(
  apiRoutes.users.update(':userId'),
  asyncHandler(UserController.updateProfile)
);
router.get(
  apiRoutes.users.delete(':userId'),
  asyncHandler(UserController.deleteUser)
);
router.get(
  apiRoutes.users.getProfile(':userId'),
  asyncHandler(UserController.getProfile)
);

export { router };
