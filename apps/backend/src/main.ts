import express from 'express';
import * as path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

import { PrismaClient } from '@prisma/client';
// import pdfParse from 'pdf-parse';

dotenv.config();
const app = express();
// const prisma = new PrismaClient();

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/auth', authRoutes);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

// // Upload & Extract BOM
// app.post('/upload', async (req, res) => {
//   try {
//     const { fileUrl, fileName } = req.body;

//     // Fetch PDF file from Supabase Storage
//     const response = await fetch(fileUrl);
//     const arrayBuffer = await response.arrayBuffer();
//     const pdfText = await pdfParse(Buffer.from(arrayBuffer));

//     const extractedData = pdfText.text
//       .split('\n')
//       .filter((line) => line.includes('Part') || line.includes('Qty'));

//     // Store in database
//     const file = await prisma.file.create({
//       data: { name: fileName, url: fileUrl },
//     });

//     await prisma.bom.create({
//       data: { fileId: file.id, data: extractedData },
//     });

//     res.json({ message: 'File processed successfully', extractedData });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to process file' });
//   }
// });

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
