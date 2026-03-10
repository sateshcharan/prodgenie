import { Request, Response } from 'express';

import { SubscribeService } from '../services/subscribe.service';

export class SubscribeController {
  static async newsletter(req: Request, res: Response) {
    const { email } = req.body;
    const result = await SubscribeService.sendNewsletterEmail(email);
    return res.status(200).json(result);
  }
}
