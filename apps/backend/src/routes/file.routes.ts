import express, { Router } from 'express';
import passport from '../middlewares/passport.middleware';
import prisma from '../utils/prisma';
import { supabase } from '@prodgenie/libs/supabase';

import { createOrganizationFolders } from '../lib/storage';

const router: Router = express.Router();

router.get(
  '/drawings',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = (req.user as any).id;

      // 1. Fetch file records from Prisma
      const drawings = await prisma.file.findMany({
        where: { userId, type: 'drawing' },
      });

      //   // 2. Generate signed URLs from Supabase
      //   const signedFiles = await Promise.all(
      //     files.map(async (file) => {
      //       const { data: urlData, error } = await supabase.storage
      //         .from('prodgenie')
      //         .createSignedUrl(file.path, 60 * 60); // 1 hour

      //       if (error) throw new Error(error.message);

      //       return {
      //         name: file.name,
      //         url: urlData?.signedUrl,
      //       };
      //     })
      //   );

      return res.json({ success: true, drawings: drawings });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch drawings.' });
    }
  }
);

router.post('/create-org', async (req, res) => {
  const { orgName } = req.body;

  try {
    // Save org to DB here...

    await createOrganizationFolders(orgName);

    res
      .status(200)
      .json({ message: 'Organization created and folders initialized.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create organization folders' });
  }
});

export default router;
