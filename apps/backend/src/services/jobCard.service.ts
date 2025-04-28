import { prisma } from '@prodgenie/libs/prisma';

interface JobCardItem {
  description: string;
  qty: number;
  drgPartNo: string;
  poNumber: string;
  preparedBy: string;
  scheduledDate: string;
  // ... other fields you have
}

interface GenerateJobCardProps {
  bom: JobCardItem[];
  fileId: string;
}

export class JobCardService {
  static async generateJobCard({ bom, fileId }: GenerateJobCardProps) {
    console.log(`Starting Job Card generation for File ID: ${fileId}`);

    for (const item of bom) {
      console.log(`Processing item: ${item.description}`);

      // Step 1: Identify Product Type
      const productType = await this.identifyProduct(item);
      console.log(`Identified product: ${productType}`);

      // Step 2: Fetch Sequence for Product
      const sequence = await this.fetchSequence(productType);
      // console.log(`Fetched sequence: ${JSON.stringify(sequence)}`);

      // Step 3: Fetch Associated Templates
      const templates = await this.fetchTemplates(productType);
      // console.log(`Fetched ${templates.length} templates`);

      // Step 4: Inject values into copies of templates
      const populatedTemplates = templates.map((template) =>
        this.injectValues(template, item)
      );

      // Step 5: Combine templates based on sequence
      const finalDocument = await this.combineTemplates(
        populatedTemplates,
        sequence
      );

      // Step 6: Save the final document
      const outputPath = await this.saveDocument(finalDocument, fileId, item);

      // console.log(`Saved Job Card for ${item.description} at ${outputPath}`);
    }

    // Step 7: (Optional) Notify frontend or update database
    await this.notifyFrontend(fileId);
  }

  // ---------- Helper methods ----------

  static async identifyProduct(item: JobCardItem) {
    const keyword = item.description.toLowerCase() + '.json';
    let sequenceId: string | null = null;
    try {
      const result = await prisma.file.findFirst({
        where: {
          type: 'sequence',
          name: keyword,
        },
      });
      sequenceId = result?.id;
    } catch (error) {
      console.error(`Error finding sequence for keyword "${keyword}":`, error);
    }
    return sequenceId;
  }

  static async fetchSequence(productType: string) {
    // fetch sequence from database or config
    return ['Template1', 'Template2', 'Template3'];
  }

  static async fetchTemplates(productType: string) {
    // fetch templates from storage/database
    return ['TemplateContent1', 'TemplateContent2'];
  }

  static injectValues(template: string, item: JobCardItem) {
    // simple string replace, or you can use something like handlebars/mustache templates
    return template.replace(/\{\{description\}\}/g, item.description);
  }

  static async combineTemplates(templates: string[], sequence: string[]) {
    // Combine into a single document (PDF/HTML/Docx)
    return templates.join('\n\n--- Page Break ---\n\n');
  }

  static async saveDocument(
    finalDoc: string,
    fileId: string,
    item: JobCardItem
  ) {
    const path = `/output/jobcards/${fileId}/${item.description}.pdf`;
    // actually save the file
    return path;
  }

  static async notifyFrontend(fileId: string) {
    // emit WebSocket event, or set a "job complete" flag in database
    console.log(`Notifying frontend for file ${fileId}`);
  }
}
