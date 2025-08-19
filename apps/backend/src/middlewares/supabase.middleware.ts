import { Request, Response, NextFunction } from 'express';

import { prisma } from '@prodgenie/libs/prisma';
import { supabase } from '@prodgenie/libs/supabase';

const authenticateSupabaseJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).send('No token provided');

    const activeWorkspaceId = req.headers['active-workspace-id'] as string;
    req.activeWorkspaceId = activeWorkspaceId;

    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !supabaseUser) return res.status(401).send('Invalid token');

    const dbUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      include: {
        memberships: {
          include: {
            workspace: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
    });
    if (!dbUser) return res.status(404).send('User not found in database');
    req.user = dbUser;

    next();
  } catch (err) {
    console.error('Supabase auth error:', err);
    res.status(500).send('Authentication failed');
  }
};

export { authenticateSupabaseJWT };
