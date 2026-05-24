import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium, type Browser, type Page } from "playwright-core";
import type { ScrapedJob } from "@/lib/types/job";

export type ScraperResult = {
  source: ScrapedJob["source"];
  jobs: ScrapedJob[];
  errors: string[];
  durationMs: number;
};

export abstract class BaseScraper {
  abstract readonly source: ScrapedJob["source"];

  protected abstract scrapeWithPage(page: Page): Promise<ScrapedJob[]>;

  async run(): Promise<ScraperResult> {
    const started = Date.now();
    const errors: string[] = [];
    let browser: Browser | null = null;

    try {
      browser = await this.launchBrowser();
      const page = await browser.newPage({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        viewport: { width: 1440, height: 900 },
      });

      await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
      });

      const jobs = await this.scrapeWithPage(page);

      return {
        source: this.source,
        jobs,
        errors,
        durationMs: Date.now() - started,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Unknown scraper error");
      return {
        source: this.source,
        jobs: [],
        errors,
        durationMs: Date.now() - started,
      };
    } finally {
      await browser?.close();
    }
  }

  private async launchBrowser(): Promise<Browser> {
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      return playwrightChromium.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    const { chromium: localChromium } = await import("playwright");
    return localChromium.launch({ headless: true });
  }
}

export async function dismissOverlays(page: Page) {
  const selectors = [
    'button:has-text("Accept")',
    'button:has-text("Aceitar")',
    'button:has-text("Got it")',
    'button:has-text("Close")',
    '[aria-label="Dismiss"]',
  ];

  for (const selector of selectors) {
    try {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 800 })) {
        await button.click({ timeout: 800 });
      }
    } catch {
      // Optional overlay — ignore
    }
  }
}

export async function scrollPage(page: Page, times = 3) {
  for (let i = 0; i < times; i++) {
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(900);
  }
}
