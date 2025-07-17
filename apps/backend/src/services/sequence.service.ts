import axios from 'axios';

import { prisma } from '@prodgenie/libs/prisma';
import { FileStorageService } from '@prodgenie/libs/supabase';
import { FileType } from '@prodgenie/libs/prisma';
import { FileHelperService } from '@prodgenie/libs/server-services';

import { FileService } from './file.service';
import e from 'express';

const storageFileService = new FileStorageService();
const fileHelperService = new FileHelperService();
const fileService = new FileService();

export class SequenceService {
  async syncAll(orgId: string, user: any) {
    // 1. Get all template file details
    const templateDetails = await prisma.file.findMany({
      where: { orgId, type: 'template' },
      select: { name: true, path: true },
    });

    // Preprocess template paths to match stripped format
    const normalizedTemplates = templateDetails.map((template) => ({
      name: template.name.split('.')[0],
      path: template.path.split('/').slice(1).join('/'),
    }));

    // 2. Get all sequence files
    const sequenceFiles = await prisma.file.findMany({
      where: { orgId, type: 'sequence' },
      select: { id: true, name: true, path: true },
    });

    for (const sequence of sequenceFiles) {
      try {
        // 3. Get the signed URL to download the sequence file
        const signedUrl = await storageFileService.getSignedUrl(sequence.path);
        const { data } = await axios.get(signedUrl);
        const json = typeof data === 'string' ? JSON.parse(data) : data;

        let hasChanges = false;

        // 4. Compare and update section paths if needed
        const updatedSections = json.sections.map((section: any) => {
          const matchingTemplate = normalizedTemplates.find(
            (tmpl) => tmpl.name === section.name
          );

          if (!matchingTemplate) return section;

          const isPathMismatch = section.path !== matchingTemplate.path;

          if (isPathMismatch) {
            hasChanges = true;
            return { ...section, path: matchingTemplate.path };
          }

          return section;
        });

        if (hasChanges) {
          const updatedContent = JSON.stringify({
            ...json,
            sections: updatedSections,
          });

          const buffer = Buffer.from(updatedContent, 'utf-8');

          const fileForUpload = {
            originalname: sequence.name,
            mimetype: 'application/json',
            buffer: buffer,
            size: buffer.length,
          };

          await storageFileService.replaceFile(
            sequence.path,
            fileForUpload,
            'sequence',
            user
          );

          console.log(`✅ Synced sequence: ${sequence.name}`);
        }
      } catch (err) {
        console.error(`❌ Failed syncing ${sequence.name}`, err);
      }
    }
  }

  async getJobCardDataFromSequence(sequence: string) {
    // find the sequence file
    const file = await prisma.file.findFirst({
      where: { name: `${sequence.toLowerCase()}.json`, type: 'sequence' },
      select: { path: true },
    });

    // get json from sequence file
    const json = await fileHelperService.fetchJsonFromSignedUrl(
      `${file?.path}`
    );

    // get jobcarddata from the templates in json
    const jobCardData = await Promise.all(
      json.sections.map(async (section: any) => {
        try {
          return section.jobCardData;
        } catch (err) {
          console.error(
            'Failed to get jobcard data for section:',
            section,
            err
          );
          return null;
        }
      })
    );

    const consolidatedData = jobCardData
      .map((data) => data.formFields)
      .filter((fields) => fields !== undefined); // filter out undefined values
    // add logic to reduce duplicates

    return consolidatedData;
  }
}
