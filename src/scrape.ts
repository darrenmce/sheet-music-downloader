import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

puppeteer.use(StealthPlugin());

const scoreRegex = /(score_\d+(\.png|\.svg))(?![@]\d+x\d+)/

export async function scrape(musescoreUrl: string, name: string, headless: false | 'new' = 'new') {
  const browser = await puppeteer.launch({
    headless, args: [
      '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1900, height: 1080 })

  await setupDownloadListener(page, scoreRegex, name);

  await page.goto(musescoreUrl, { waitUntil: 'networkidle2' });
  // get page title
  const scrollableDivSelector = 'div#jmuse-scroller-component';
  await page.waitForSelector(scrollableDivSelector, { timeout: 3000 });

  // scroll through the page to load all the images
  const scrollAmount = 100;
  let currentScroll = 0;
  const scrollHeight = await page.$eval(scrollableDivSelector, (div) => div.scrollHeight);
  while (currentScroll < scrollHeight) {
    await page.$eval(scrollableDivSelector, (div, scrollAmount) => {
      div.scrollTop += scrollAmount;
    }, scrollAmount);
    currentScroll += scrollAmount;
    const jitter = Math.floor(Math.random() * 50) + 75;
    await new Promise((r) => setTimeout(r, jitter));
  }

  await browser.close();
}

async function setupDownloadListener(page: Page, urlspec: RegExp, dir = 'images') {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    request.continue();
  });
  page.on('response', async (response) => {
    const url = response.url();
    const match = urlspec.exec(url);
    if (match) {
      const filename = match[1];
      console.log('Downloading image:', filename, 'from: ', url);
      try {
        const buffer = await response.buffer(); // Get image data as buffer

        // Save the image buffer to a file
        fs.writeFileSync(path.resolve(dir, filename), buffer);
        console.log(`Image downloaded successfully to ${filename}`);
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    }
  });
}
