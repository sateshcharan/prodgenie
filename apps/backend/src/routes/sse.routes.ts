import express, { Router } from 'express';

import { sseServer } from '@prodgenie/libs/sse';
import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.get(`${apiRoutes.sse.stream}`, (req, res) => {
  // todo: authMiddleware should set req.user and verify membership of workspace

  sseServer.subscribe(req, res);
});

export { router };
