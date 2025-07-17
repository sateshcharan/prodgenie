import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Readable } from 'stream';

import { FileStorageService } from '@prodgenie/libs/supabase';

export class FileHelperService {
  private readonly fileStorageService: FileStorageService;

  constructor() {
    this.fileStorageService = new FileStorageService();
  }

  async fetchJsonFromSignedUrl(path: string): Promise<any> {
    if (!path) throw new Error('Path not provided');
    const url = await this.fileStorageService.getSignedUrl(path);
    const { data } = await axios.get(url);
    return data;
  }

  async downloadToTemp(signedUrl: string, filename: string) {
    const tempDir = './tmp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, filename.toLowerCase());
    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const webStream = response.body;
    if (!webStream) {
      throw new Error('Response body is null');
    }
    // Convert Web Stream -> Node.js Stream
    const nodeStream = Readable.fromWeb(webStream as any);
    const writeStream = fs.createWriteStream(tempFilePath);
    await new Promise<void>((resolve, reject) => {
      nodeStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    return tempFilePath;
  }
}
