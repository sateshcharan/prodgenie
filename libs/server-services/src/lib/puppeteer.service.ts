import fs from 'fs';
import path from 'path';
import type { Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import type { PuppeteerExtra } from 'puppeteer-extra';
// import type { Page, ElementHandle } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { extractBOMPrompt } from '@prodgenie/libs/constant';

const puppeteer = puppeteerExtra as unknown as PuppeteerExtra;
puppeteer.use(StealthPlugin());

export class PuppeteerService {
  private openaiIds = {
    url: 'https://chat.openai.com/',
    fileUploadButton: '#upload-file-btn',
    fileUploadMenu: '[role="menuitem"]',
    fileUploadMenuAddPhotos: 'Add photos & files',
    promptBox: '#prompt-textarea',
    textAreaSubmitButton: '#composer-submit-button',
    chatResponse: '[data-message-author-role="assistant"]',
    deleteMenuButton: '[data-testid="conversation-options-button"]',
    deleteConfirmButton:
      'button[data-testid="delete-conversation-confirm-button"]',
  };

  private userDataDir = path.resolve(process.cwd(), 'puppeteer-session');
  private singletonLockPath = path.join(this.userDataDir, 'SingletonLock');

  public async extractFromChatGPT(filePath: string): Promise<string> {
    const browser = await this.launchBrowser();

    // console.log(filePath);

    try {
      const page = await browser.newPage();
      await page.goto(this.openaiIds.url, { waitUntil: 'networkidle2' });

      // upload file gpt-4
      // const uploadButton = await page.$('#upload-file-btn');
      // if (!uploadButton) throw new Error('Upload button not found');
      // await uploadButton.click();

      // const menuItems = await page.$$('[role="menuitem"]');
      // let uploadFileButton: ElementHandle<Element> | undefined;

      // for (const el of menuItems) {
      //   const text = await el.evaluate((node: any) => node.textContent || '');
      //   if (text.includes('Add photos & files')) {
      //     uploadFileButton = el;
      //     break;
      //   }
      // }

      // if (!uploadFileButton) throw new Error('Upload button not found');

      // // Handle file chooser
      // const [fileChooser] = await Promise.all([
      //   page.waitForFileChooser(),
      //   uploadFileButton.click(),
      // ]);

      // gpt-5
      await page.keyboard.press('/');

      const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.keyboard.press('Enter'),
      ]);

      await fileChooser.accept([filePath]);

      await this.delay(10000); // wait for file to upload
      await this.typePrompt(page, extractBOMPrompt);
      const parsedResult = await this.extractAssistantResponse(page);

      // await this.deleteLastChat(page);
      await this.delay(10000);
      await this.deleteCurrentChat(page);
      return parsedResult;
    } finally {
      await browser.close();
    }
  }

  private async delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  private async launchBrowser() {
    if (fs.existsSync(this.singletonLockPath)) {
      fs.unlinkSync(this.singletonLockPath);
    }
    return puppeteer.launch({
      // needed for docker environment
      // executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',

      headless: false,
      // userDataDir: this.userDataDir,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        // '--single-process',
        // '--no-zygote',
      ],
    });
  }

  private async parseJsonSafely(jsonString: string) {
    try {
      const parsed = JSON.parse(jsonString);
      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return null;
    }
  }

  private async typePrompt(page: Page, prompt: string) {
    const promptBox = await page.$(this.openaiIds.promptBox);
    if (!promptBox) throw new Error('Prompt textarea not found');

    // await page.evaluate((text: string) => {
    //   const el = document.querySelector(this.openaiIds.promptBox);
    //   if (el) el.textContent = text;
    // }, prompt);

    await page.evaluate(
      (selector: string, text: string) => {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) el.textContent = text;
      },
      this.openaiIds.promptBox,
      prompt
    );

    const submitButton = await page.$(this.openaiIds.textAreaSubmitButton);
    if (!submitButton) throw new Error('Submit button not found');
    await submitButton.click();
  }

  private async extractAssistantResponse(page: Page): Promise<any> {
    await this.delay(30000);
    // await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 });

    const extractedText = await page.evaluate((selector) => {
      const blocks = Array.from(
        document.querySelectorAll(selector)
      ) as HTMLElement[];
      const lastBlock = blocks.at(-1);
      return lastBlock?.textContent || null;
    }, this.openaiIds.chatResponse);

    console.log('Extracted text:', extractedText);

    // const extractedText = await page.evaluate(() => {
    //   const blocks = Array.from(
    //     document.querySelectorAll(this.openaiIds.chatResponse)
    //   );
    //   const lastBlock = blocks.at(-1);
    //   // return lastBlock?.innerText || null;
    //   return lastBlock?.textContent || null;
    // });

    // console.log(extractedText);

    if (!extractedText) throw new Error('No assistant response found');

    const jsonMatch = extractedText.match(/({[\s\S]*})/);
    if (!jsonMatch)
      throw new Error('No JSON object found in assistant response');

    return this.parseJsonSafely(jsonMatch[1]);
  }

  private async deleteCurrentChat(page: Page) {
    const deleteMenuButton = await page.$(this.openaiIds.deleteMenuButton);
    if (!deleteMenuButton) throw new Error('Delete menu button not found');

    await deleteMenuButton.click();
    await this.delay(1000);
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await this.delay(1000);
    const deleteConfirmButton = await page.$(
      this.openaiIds.deleteConfirmButton
    );
    if (!deleteConfirmButton)
      throw new Error('Delete confirm button not found');
    await deleteConfirmButton?.click();
  }

  // private async deleteLastChat(page: Page) {
  //   const firstChat = await page.$('#history aside a');
  //   if (!firstChat) throw new Error('No chat history item found');

  //   await firstChat.hover();
  //   const menuButton = await firstChat.$('button[aria-haspopup="menu"]');
  //   if (!menuButton) throw new Error('No menu button found');
  //   await menuButton.click();

  //   return;

  // await page.waitForSelector('[data-radix-popper-content-wrapper]', {
  //   visible: true,
  // });

  // const buttons = await page.$$('[data-radix-popper-content-wrapper] *');
  // for (const btn of buttons) {
  //   const text = await page.evaluate((el: any) => el.textContent, btn);
  //   if (text?.trim().toLowerCase() === 'delete') {
  //     await btn.click();
  //     console.log('Chat deleted');
  //     return;
  //   }
  // }

  // throw new Error('Delete button not found or not visible');
  // }
}
