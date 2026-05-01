import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { extractBOMPrompt } from '@prodgenie/libs/constant';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
// Use Gemini 3 Flash for reliable multimodal extraction
const defaultModel = 'gemini-3-flash-preview'; 

export class GeminiService {
  static async extract(input: string, modelName: string = defaultModel) {
    try {
      console.log(`🔍 Extracting using Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // We use an array of Parts. Putting the file first often improves attention.
      let parts: (string | Part)[] = [];

      // Resolve absolute path to ensure fs.existsSync doesn't fail silently
      const absolutePath = path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);

      // ---- Case 1: URL (Images/PDFs) ----
      if (input.startsWith('http')) {
        const response = await fetch(input);
        const buffer = await response.arrayBuffer();
        parts.push({
          inlineData: {
            data: Buffer.from(buffer).toString('base64'),
            mimeType: response.headers.get('content-type') || 'application/pdf',
          },
        });
        parts.push(extractBOMPrompt);
      }

      // ---- Case 2: Local file ----
      else if (fs.existsSync(absolutePath)) {
        const fileBuffer = fs.readFileSync(absolutePath);
        const mimeType = this.getMimeType(path.extname(absolutePath).toLowerCase());
        
        parts.push({
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: mimeType,
          },
        });
        // Adding a clear instruction to reference the attached file
        parts.push(`${extractBOMPrompt}\n\nPlease extract the data from the attached document.`);
      }

      // ---- Case 3: Plain text ----
      else {
        console.warn('⚠️ Input not found as file, treating as raw text.');
        parts.push(extractBOMPrompt);
        parts.push(`\n\nInput Content:\n${input}`);
      }

      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      if (!text) throw new Error('No response received');

      return this.extractJsonFromResponse(text);
    } catch (error) {
      console.error('❌ Extraction failed:', error);
      throw error;
    }
  }

  static getMimeType(ext: string): string {
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    return map[ext] || 'application/octet-stream';
  }

  static extractJsonFromResponse(responseText: string): any {
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                     responseText.match(/{[\s\S]*}/);

    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;

    try {
      return JSON.parse(jsonString.trim());
    } catch {
      console.warn('⚠️ Could not parse JSON. Returning empty defaults.');
      return { bom: [], titleBlock: {}, printingDetails: [] };
    }
  }
}