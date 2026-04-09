import { Request, Response } from 'express';

import { SequenceService } from '../services/sequence.service';

export class SequenceController {
  static syncAllSequence = async (req: Request, res: Response) => {
    const workspaceId = req.activeWorkspaceId;
    const user = req.user;

    const files = await SequenceService.syncAll(workspaceId, user);
    return res.status(200).json(files);
  };

  static getJobCardDataFromSequence = async (req: Request, res: Response) => {
    const sequence = req.params.sequence;
    const workspaceId = req.activeWorkspaceId;

    const fields = await SequenceService.getJobCardDataFromSequence(sequence, workspaceId);
    return res.status(200).json(fields);
  };
}
