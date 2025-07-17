import { Request, Response, NextFunction } from 'express';

import { supabase } from '@prodgenie/libs/supabase';

const authenticateSupabase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).send('No token');

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).send('Invalid token');

  req.user = user;
  next();
};

export { authenticateSupabase };
