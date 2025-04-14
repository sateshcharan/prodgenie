import express, { Router } from 'express';
import multer from 'multer';

import { prisma } from '@prodgenie/libs/prisma';
import { supabase } from '@prodgenie/libs/supabase';
import passport from '../middlewares/passport.middleware';

import { FileService, FolderService } from '../services';

const router: Router = express.Router();

const fileService = new FileService('prodgenie');
const folderService = new FolderService('prodgenie');

const fileTypes = ['drawings', 'templates', 'job_cards', 'sequences'];

const storage = multer.memoryStorage();
const upload = multer({ storage });

// read files from supabase
fileTypes.map((type) => {
  router.get(
    `/files/${type}`,
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
      try {
        const userId = (req.user as any).id;

        // 1. Fetch file records from Prisma
        const files = await prisma.file.findMany({
          where: { userId, type: type.toUpperCase().slice(0, type.length - 1) },
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

        return res.json({ success: true, files: files });
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .json({ success: false, message: 'Failed to fetch files.' });
      }
    }
  );
});

// upload file to supabase
router.post('/upload-file/:folder', upload.single('file'), async (req, res) => {
  const { folder } = req.params;
  const file = req.file;

  console.log(folder);

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const filePath = `${folder}/${file.originalname}`;

    const { data, error } = await supabase.storage
      .from('prodgenie') // Replace with your actual bucket name
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false, // optional: overwrites if file exists
      });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Upload failed' });
    }

    res
      .status(200)
      .json({ message: 'File uploaded successfully', path: data.path });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unexpected error uploading file' });
  }
});

router.delete('/delete-file/:folder/:filename', async (req, res) => {
  const { folder, filename } = req.params;
  const filePath = `${folder}/${filename}`;

  try {
    const { data, error } = await supabase.storage
      .from('your-bucket-name') // 🔁 Replace with your actual bucket name
      .remove([filePath]);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete file' });
    }

    res.status(200).json({ message: 'File deleted successfully', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unexpected error while deleting file' });
  }
});

// create folder scafolding in supabase
router.post('/create-org', async (req, res) => {
  const { orgName } = req.body;

  try {
    // Save org to DB here...

    await folderService.scafoldFolder(orgName);
    res
      .status(200)
      .json({ message: 'Organization created and folders initialized.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create organization folders' });
  }
});

export default router;
