import { Request, Response, NextFunction } from 'express';

import { prisma } from '@prodgenie/libs/db';
import { supabase } from '@prodgenie/libs/supabase';

import jwt from 'jsonwebtoken';

const authenticateSupabaseJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // supabase auth token
  // const token = req.headers.authorization?.split('Bearer ')[1];
  // if (!token) return res.status(401).send('No token provided');

  // supabase auth cookie
  const token = req.cookies['sb-access-token'];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
    req.user = payload;

    // user and workspace data
    const activeWorkspaceId = req.headers['active-workspace-id'] as string;

    // 🔥 NEW — Read workspaceId from query OR params, not header
    // const activeWorkspaceId =
    //   (req.query.workspaceId as string) ||
    //   (req.params.workspaceId as string) ||
    //   null;

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
