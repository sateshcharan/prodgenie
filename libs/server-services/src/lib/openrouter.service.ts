import fs from 'fs';
import path from 'path';
import axios, { type AxiosResponse } from 'axios';

import { extractBOMPrompt } from '@prodgenie/libs/constant';

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content:
    | string
    | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: {
          url: string;
        };
      }>;
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private defaultModel = 'anthropic/claude-3.5-sonnet'; // or any other model you prefer

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error(
        'OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable or pass it to constructor.'
      );
    }
  }

  public async extractFromOpenRouter(
    filePath: string,
    model?: string
  ): Promise<string> {
    try {
      console.log(`Processing file: ${filePath}`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read file and convert to base64
      const fileBuffer = fs.readFileSync(filePath);
      const fileExtension = path.extname(filePath).toLowerCase();
      const mimeType = this.getMimeType(fileExtension);

      if (!mimeType) {
        throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      // Prepare the message with file content
      const messages: OpenRouterMessage[] = [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
            {
              type: 'text',
              text: extractBOMPrompt,
            },
          ],
        },
      ];

      // Make API request
      const response = await this.makeOpenRouterRequest(messages, model);

      // Extract and parse the response
      const assistantMessage = response.choices[0]?.message?.content;
      if (!assistantMessage) {
        throw new Error('No response received from OpenRouter');
      }

      console.log('Raw response:', assistantMessage);

      // Try to extract JSON from the response
      const parsedResult = this.extractJsonFromResponse(assistantMessage);
      return parsedResult;
    } catch (error) {
      console.error('Error in extractFromOpenRouter:', error);
      throw error;
    }
  }

  public async extractFromOpenRouterWithText(
    textContent: string,
    model?: string
  ): Promise<string> {
    try {
      console.log('Processing text content...');

      const messages: OpenRouterMessage[] = [
        {
          role: 'user',
          content: `${extractBOMPrompt}\n\nContent to analyze:\n${textContent}`,
        },
      ];

      const response = await this.makeOpenRouterRequest(messages, model);

      const assistantMessage = response.choices[0]?.message?.content;
      if (!assistantMessage) {
        throw new Error('No response received from OpenRouter');
      }

      console.log('Raw response:', assistantMessage);

      const parsedResult = this.extractJsonFromResponse(assistantMessage);
      return parsedResult;
    } catch (error) {
      console.error('Error in extractFromOpenRouterWithText:', error);
      throw error;
    }
  }

  private async makeOpenRouterRequest(
    messages: OpenRouterMessage[],
    model?: string
  ): Promise<OpenRouterResponse> {
    const requestBody = {
      model: model || this.defaultModel,
      messages,
      max_tokens: 4000,
      temperature: 0.1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    try {
      const response: AxiosResponse<OpenRouterResponse> = await axios.post(
        `${this.baseUrl}/chat/completions`,
        requestBody,
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
        const errorMessage = error.response?.data || error.message;
        throw new Error(
          `OpenRouter API error: ${error.response?.status} - ${JSON.stringify(
            errorMessage
          )}`
        );
      }
      throw error;
    }
  }

  private getMimeType(extension: string): string | null {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.html': 'text/html',
      '.htm': 'text/html',
    };

    return mimeTypes[extension] || null;
  }

  private extractJsonFromResponse(responseText: string): any {
    try {
      // Try to find JSON in the response
      const jsonMatch = responseText.match(/({[\s\S]*})/);
      if (!jsonMatch) {
        // If no JSON brackets found, try parsing the entire response
        return this.parseJsonSafely(responseText);
      }

      return this.parseJsonSafely(jsonMatch[1]);
    } catch (error) {
      console.error('Failed to extract JSON from response:', error);
      throw new Error('No valid JSON found in assistant response');
    }
  }

  private parseJsonSafely(jsonString: string): any {
    try {
      const parsed = JSON.parse(jsonString);
      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      // Try to clean the JSON string
      const cleaned = jsonString
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      try {
        const parsed = JSON.parse(cleaned);
        return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
      } catch (cleanError) {
        console.error('Failed to parse cleaned JSON:', cleanError);
        throw new Error('Invalid JSON format in response');
      }
    }
  }

  // Utility method to list available models
  public async getAvailableModels(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/models`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data || error.message;
        throw new Error(
          `Failed to fetch models: ${error.response?.status} - ${JSON.stringify(
            errorMessage
          )}`
        );
      }
      throw error;
    }
  }

  // Method to set a different model
  public setModel(model: string): void {
    this.defaultModel = model;
  }

  // Method to get current model
  public getCurrentModel(): string {
    return this.defaultModel;
  }
}

// Usage example:
/*
const openRouterService = new OpenRouterService('your-api-key-here');

// Extract from image file
const result = await openRouterService.extractFromOpenRouter('/path/to/file.pdf');

// Extract from text
const textResult = await openRouterService.extractFromOpenRouterWithText('Your text content here');

// Use different model
openRouterService.setModel('anthropic/claude-3-opus');

// Get available models
const models = await openRouterService.getAvailableModels();
*/
