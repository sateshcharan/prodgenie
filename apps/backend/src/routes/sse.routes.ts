import express, { Router } from 'express';

import { subscribe } from '@prodgenie/libs/sse';
import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

// subscribe to workspace stream
router.get(`${apiRoutes.sse.stream}`, (req, res) => {
  // authMiddleware should set req.user and verify membership of workspace
  const workspaceId = req.activeWorkspaceId!;
  const user = (req as any).user;

  // security: ensure user is member of workspace (implement check)
  const member = user.memberships?.find((m) => m.workspace.id === workspaceId);

  if (!member) return res.status(403).end();

  subscribe(req, res);
});

export { router };
