import { Request, Response } from 'express';

import { SequenceService } from '../services/index.js';

const sequenceService = new SequenceService();

export class SequenceController {
  static syncAllSequence = async (req: Request, res: Response) => {
    const orgId = req.user?.orgId;
    const user = req.user;
    const files = await sequenceService.syncAll(orgId, user);
    return res.status(200).json(files);
  };

  static getJobCardDataFromSequence = async (req: Request, res: Response) => {
    const sequence = req.params.sequence;
    const fields = await sequenceService.getJobCardDataFromSequence(sequence);
    return res.status(200).json(fields);
  };
}
