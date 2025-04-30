import axios from 'axios';
import { prisma } from '@prodgenie/libs/prisma';
import { FileService } from './file.service';
import { StorageFileService } from '@prodgenie/libs/supabase';

const fileService = new FileService();
const storageFileService = new StorageFileService();

interface JobCardItem {
  description: string;
  qty: number;
  drgPartNo: string;
  poNumber: string;
  preparedBy: string;
  scheduledDate: string;
  // Add more fields as needed
}

interface GenerateJobCardProps {
  bom: JobCardItem[];
  fileId: string;
}

export class JobCardService {
  static async generateJobCard({ bom, fileId }: GenerateJobCardProps) {
    console.log(`🛠 Generating Job Card for File ID: ${fileId}`);

    for (const item of bom) {
      const productInfo = await this.identifyProduct(item);
      if (!productInfo?.sequenceId || !productInfo?.sequencePath) {
        console.warn(`⚠️ Sequence not found for: ${item.description}`);
        continue;
      }

      const { sequencePath } = productInfo;
      const sequenceUrl = await storageFileService.getSignedUrl(sequencePath);
      const { data: sequence } = await axios.get(sequenceUrl);

      const templates: string[] = [];

      for (const section of sequence.sections) {
        const signedUrl = await storageFileService.getSignedUrl(
          `test/${section.path}`
        );
        const rawTemplate = await fileService.downloadToTemp(
          signedUrl,
          section.name
        );
        const populated = this.injectValues(rawTemplate, item);
        templates.push(populated);
      }

      const finalDocument = await this.combineTemplates(templates, sequence);
      const outputPath = await this.saveDocument(finalDocument, fileId, item);

      console.log(
        `✅ Job Card for "${item.description}" saved at: ${outputPath}`
      );
    }

    await this.notifyFrontend(fileId);
  }

  // --- Helper Methods ---

  static async identifyProduct(item: JobCardItem) {
    const keyword = `${item.description.toLowerCase()}.json`;
    try {
      const result = await prisma.file.findFirst({
        where: {
          type: 'sequence',
          name: keyword,
        },
      });

      return {
        sequenceId: result?.id,
        sequencePath: result?.path,
      };
    } catch (error) {
      console.error(`❌ Error identifying product for "${keyword}":`, error);
      return null;
    }
  }

  static injectValues(template: string, item: JobCardItem): string {
    const jsxTemplate = template.replace(
      /\{\{\s*(\w+)\s*\}\}/g,
      (_, key) => `{${key}}`
    );

    const propsList = Object.keys(item).join(', ');
    const finalTemplate = jsxTemplate.replace(
      /const\s+\w+\s*=\s*\(\s*\)\s*=>/,
      `const Component = ({ ${propsList} }) =>`
    );

    return finalTemplate;
  }

  static async combineTemplates(
    templates: string[],
    sequence: any
  ): Promise<string> {
    // For now, we're just joining the JSX strings with page breaks
    return templates.join('\n\n--- Page Break ---\n\n');
  }

  static async saveDocument(
    finalDoc: string,
    fileId: string,
    item: JobCardItem
  ): Promise<string> {
    const outputPath = `/output/jobcards/${fileId}/${item.description}.pdf`;
    // TODO: Implement actual file saving logic here (e.g., PDF generation)
    return outputPath;
  }

  static async notifyFrontend(fileId: string): Promise<void> {
    // Optionally implement websocket or database notification here
    console.log(`📢 Job card generation complete for file: ${fileId}`);
  }
}
