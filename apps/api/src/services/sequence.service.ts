import axios from 'axios';

import { prisma, FileType } from '@prodgenie/libs/db';
import { FileStorageService } from '@prodgenie/libs/supabase';
import { FileHelperService } from '@prodgenie/libs/server-services';

import { FileService } from './file.service';
import e from 'express';
import { isDeepStrictEqual } from 'util';

const storageFileService = new FileStorageService();
const fileHelperService = new FileHelperService();
const fileService = new FileService();

export class SequenceService {
  async syncAll(workspaceId: string, user: any) {
    // 1. Get all template file details
    const templateDetails = await prisma.file.findMany({
      where: { workspaceId, type: 'template' },
      select: { name: true, path: true, data: true },
    });

    // Preprocess template paths to match stripped format
    const normalizedTemplates = templateDetails.map((template) => ({
      name: template.name.split('.')[0],
      path: template.path.split('/').slice(1).join('/'),
      data: template.data,
    }));

    // 2. Get all sequence files
    const sequenceFiles = await prisma.file.findMany({
      where: { workspaceId, type: 'sequence' },
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

          const needsUpdate =
            section.path !== matchingTemplate.path ||
            !isDeepStrictEqual(section.jobCardForm, matchingTemplate.data);

          if (needsUpdate) {
            hasChanges = true;
            return {
              ...section,
              path: matchingTemplate.path,
              jobCardForm: matchingTemplate.data.jobCardForm,
            };
          }

          // const isPathMismatch = section.path !== matchingTemplate.path;

          // if (isPathMismatch) {
          //   hasChanges = true;
          //   return { ...section, path: matchingTemplate.path };
          // }

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
    // Normalize input: lowercase + remove spaces, underscores, and dashes
    const normalizedSeq = sequence
      .toLowerCase()
      .replace(/\s+|_|-/g, '') // remove spaces, underscores, and dashes
      .trim();

    // Fetch all sequence files
    const files = await prisma.file.findMany({
      where: { type: 'sequence' },
      select: { name: true, path: true },
    });

    // Find the file whose name matches the normalized sequence
    const matchedFile = files.find((file) => {
      const fileBase = file.name
        .toLowerCase()
        .replace('.json', '') // remove extension
        .replace(/\s+|_|-/g, ''); // remove formatting
      return (
        normalizedSeq.includes(fileBase) || fileBase.includes(normalizedSeq)
      );
    });

    if (!matchedFile) {
      throw new Error(`Sequence file not found for: ${sequence}`);
    }

    // Fetch JSON content from the file
    const json = await fileHelperService.fetchJsonFromSignedUrl(
      matchedFile.path
    );

    // get jobcarddata from the templates in json
    const jobCardData = await Promise.all(
      json.sections.map(async (section: any) => {
        try {
          // return section.jobCardForm;
          return { name: section.name, sections: section.jobCardForm.sections };
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

    // // Flatten the nested array and filter out falsy values (undefined, null, empty object, etc.)
    // const allData = jobCardData
    //   .flat()
    //   .filter(
    //     (item) =>
    //       item &&
    //       Object.keys(item).length > 0 &&
    //       Array.isArray(item.sections) &&
    //       item.sections.length > 0
    //   );

    // // Combine all sections
    // const allSections = allData.flatMap((item) => item.sections);

    // // Remove duplicates based on section name
    // const uniqueSectionsMap = new Map<string, any>();

    // allSections.forEach((section) => {
    //   if (!uniqueSectionsMap.has(section.name)) {
    //     uniqueSectionsMap.set(section.name, section);
    //   }
    // });

    // const uniqueSections = Array.from(uniqueSectionsMap.values());

    // return uniqueSections;

    return jobCardData.filter((item) => item.sections.length > 0);
  }
}
