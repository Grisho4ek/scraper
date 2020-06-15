import puppeteer, { Page } from 'puppeteer';
import dotenv from 'dotenv';
dotenv.config();
import { logger } from '../logger';
import UserAgent from 'user-agents';
import { Scraper } from '../Scraper';
import fs from 'fs';
import util from 'util';
import { prepareString } from '../utils/prepareString';

const asyncAppendFile = util.promisify(fs.appendFile);

enum Constants {
  SOURCE_LANG_LIST = '.tlid-open-source-language-list',
  TARGET_LANG_LIST = '.tlid-open-target-language-list',
  LANG_SOURCE_SEARCH = '#sl_list-search-box',
  LANG_TARGET_SEARCH = '#tl_list-search-box',
  LANG_ITEM = '.language_list_item',
  SOURCE = '#source',
  RIGHT_LANG_BTN = '.tl-wrap .jfk-button-collapse-right.jfk-button-checked',
  LEFT_LANG_BTN = '.jfk-button-collapse-left.jfk-button-checked'
}

class GoogleTranslate extends Scraper {
  protected baseUrl = 'https://translate.google.com/';
  protected tag = 'GoogleTranslate';

  constructor(private sourceWords: string[]) {
    super();
  }

  protected async setup() {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      userDataDir: './data/words',
      // args: ['--start-maximized'],
      executablePath: process.env.path || undefined,
      defaultViewport: null
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    await page.setUserAgent(userAgent.toString());

    return { browser, page };
  }

  private async chooseLangs(page: Page) {
    const sourceLang = process.env.sourceLang
      ? prepareString(process.env.sourceLang)
      : 'English';
    const targetLang = process.env.targetLang
      ? prepareString(process.env.targetLang)
      : 'Russian';

    await page.waitFor(Constants.SOURCE_LANG_LIST);
    const leftLangBtn = await page.$(Constants.LEFT_LANG_BTN);
    const leftLangBtnText = await page.evaluate(
      element => element.textContent,
      leftLangBtn
    );
    if (leftLangBtnText !== sourceLang) {
      await page.click(Constants.SOURCE_LANG_LIST);
      await page.click(Constants.LANG_SOURCE_SEARCH);
      await page.keyboard.type(sourceLang);
      await page.keyboard.press('Enter');
    }
    const rightLangBtn = await page.$(Constants.RIGHT_LANG_BTN);
    const rightLangBtnText = await page.evaluate(
      element => element.textContent,
      rightLangBtn
    );

    if (rightLangBtnText !== targetLang) {
      await page.click(Constants.TARGET_LANG_LIST);
      await page.click(Constants.LANG_TARGET_SEARCH);
      await page.keyboard.type(targetLang);
      await page.keyboard.press('Enter');
    }
  }

  private async getTranslatedWords(page: Page) {
    let targetWords = '';

    for (let sourceWord of this.sourceWords) {
      await page.evaluate(SOURCE => {
        document.querySelector(SOURCE).value = '';
      }, Constants.SOURCE);
      await page.click(Constants.SOURCE);
      await page.keyboard.type(sourceWord);
      await page.keyboard.press('Enter');
      await page.waitFor(1000);

      targetWords = await page.evaluate(() => {
        const words: string[] = [];
        const resultDiv = document.querySelector(
          '.result-shield-container'
        ) as HTMLElement;
        resultDiv.innerText && words.push(resultDiv.innerText);
        const spans = document.querySelectorAll(
          '.gt-baf-entry span.gt-baf-cell'
        );
        Array.from(spans)
          .slice(1)
          .forEach(span => {
            span.textContent && words.push(span.textContent);
          });

        return words.join(', ');
      });
      await asyncAppendFile(
        'vocabulary.txt',
        `${sourceWord}: ${targetWords}\n\n`
      );
    }
  }

  public async run() {
    logger.info(`${this.tag}: `, `Start translating..`);
    const { page, browser } = await this.setup();
    await page.goto(this.baseUrl);
    await this.chooseLangs(page);
    await this.getTranslatedWords(page);
    await browser.close();
    logger.info(`${this.tag}: `, `Translating finished..`);
  }
}

export { GoogleTranslate };
