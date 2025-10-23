import fs from 'fs';
import path from 'path';
import axios, { type AxiosResponse } from 'axios';

import { extractBOMPrompt } from '@prodgenie/libs/constant';

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content:
    | string
    | Array<{
        type: 'text' | 'image_url' | 'file';
        text?: string;
        image_url?: { url: string };
        file?: { file_data: string };
      }>;
}

interface OpenRouterResponse {
  choices: Array<{
    message: { role: string; content: string };
  }>;
}

export class OpenRouterService {
  private apiKey = process.env.OPENROUTER_API_KEY || '';
  private baseUrl = 'https://openrouter.ai/api/v1';
  private defaultModel = 'anthropic/claude-3.5-sonnet'; // openai/gpt-5-nano

  // unified extract method for both signed URL and local file
  public async extract(
    input: string,
    model: string = this.defaultModel
  ): Promise<any> {
    try {
      console.log(`🔍 Extracting using model: ${model}`);

      let messages: OpenRouterMessage[];

      if (input.startsWith('http')) {
        // Handle signed URL
        messages = [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: extractBOMPrompt,
              },
              {
                type: 'file',
                file: {
                  file_data: input,
                },
              },
            ],
          },
        ];
        console.log(messages);
      } else if (fs.existsSync(input)) {
        // Handle local file
        const fileBuffer = fs.readFileSync(input);
        const mimeType = this.getMimeType(path.extname(input).toLowerCase());
        const base64 = fileBuffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;

        messages = [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              { type: 'text', text: extractBOMPrompt },
            ],
          },
        ];
      } else {
        // Handle plain text
        messages = [
          {
            role: 'user',
            content: `${extractBOMPrompt}\n\n${input}`,
          },
        ];
      }

      const response = await this.makeRequest(messages, model);
      const assistantMessage = response.choices[0]?.message?.content;

      if (!assistantMessage) throw new Error('No response received');

      console.log('🧠 Raw response:', assistantMessage);
      return this.extractJsonFromResponse(assistantMessage);
    } catch (error) {
      console.error('❌ Extraction failed:', error);
      throw error;
    }
  }

  // ---- Core API call ----
  private async makeRequest(
    messages: OpenRouterMessage[],
    model: string
  ): Promise<OpenRouterResponse> {
    const url = `${this.baseUrl}/chat/completions`;

    try {
      const response: AxiosResponse<OpenRouterResponse> = await axios.post(
        url,
        { model, messages, temperature: 0.1, max_tokens: 4000 },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer':
              process.env.YOUR_SITE_URL || 'http://localhost:3000',
            'X-Title': process.env.YOUR_APP_NAME || 'BOM Extractor',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `OpenRouter API error: ${error.response?.status} - ${JSON.stringify(
            error.response?.data
          )}`
        );
      }
      throw error;
    }
  }

  // ---- Helper: MIME detection ----
  private getMimeType(ext: string): string {
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    return map[ext] || 'application/octet-stream';
  }

  // ---- Helper: JSON parsing ----
  private extractJsonFromResponse(responseText: string): any {
    const jsonMatch =
      responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      responseText.match(/{[\s\S]*}/);

    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;

    try {
      const parsed = JSON.parse(jsonString);
      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch {
      console.warn('⚠️ Could not parse JSON. Returning empty defaults.');
      return { bom: [], titleBlock: [], printingDetails: [] };
    }
  }

  // ---- Utility: Fetch available models ----
  public async listModels(): Promise<string[]> {
    try {
      const res = await axios.get(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return res.data?.data?.map((m: any) => m.id) || [];
    } catch (e) {
      console.error('Failed to list models:', e);
      return [];
    }
  }
}
