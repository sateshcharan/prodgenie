import express, { Router } from 'express';

import { UserController } from '../controllers/index.js';
import { asyncHandler } from '../middlewares/index.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

// create a user
router.post(apiRoutes.users.create, asyncHandler(UserController.createUser));

// delete user
router.delete(
  // apiRoutes.users.delete(':userId'),
  apiRoutes.users.delete,
  asyncHandler(UserController.deleteUser)
);

// get profile
router.get(
  // apiRoutes.users.getProfile(':userId'),
  apiRoutes.users.getProfile,
  asyncHandler(UserController.getProfile)
);

// update profile
router.patch(
  // apiRoutes.users.updateProfile(':userId'),
  apiRoutes.users.updateProfile,
  asyncHandler(UserController.updateProfile)
);

// invite user to workspace
// router.post(
//   apiRoutes.users.invite(':workspaceId'),
//   asyncHandler(UserController.inviteUser)
// );

// list users
// router.get(
//   apiRoutes.users.list(':workspaceId'),
//   asyncHandler(UserController.listUsers)
// );

// remove user from workspace
// router.patch(
//   apiRoutes.users.remove(':workspaceId'),
//   asyncHandler(UserController.removeUserFromWorkspace)
// );

export { router };
