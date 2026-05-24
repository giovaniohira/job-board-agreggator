import type { Page } from "playwright-core";
import type { ScrapedJob } from "@/lib/types/job";
import { BaseScraper, dismissOverlays, scrollPage } from "./base-scraper";
import {
  SEARCH_KEYWORDS,
  SEARCH_LOCATIONS,
  extractTags,
  inferRemoteType,
  inferSeniority,
  isRelevantSeniority,
} from "./utils";

export class LinkedInScraper extends BaseScraper {
  readonly source = "linkedin" as const;

  protected async scrapeWithPage(page: Page): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const seen = new Set<string>();

    for (const keyword of SEARCH_KEYWORDS) {
      for (const location of SEARCH_LOCATIONS) {
        const url = new URL("https://www.linkedin.com/jobs/search");
        url.searchParams.set("keywords", keyword);
        url.searchParams.set("location", location.query);
        url.searchParams.set("f_E", "2,3"); // entry + associate
        url.searchParams.set("f_TPR", "r604800"); // past week

        try {
          await page.goto(url.toString(), {
            waitUntil: "domcontentloaded",
            timeout: 45000,
          });
          await dismissOverlays(page);
          await scrollPage(page, 4);

          const cards = page.locator(".job-search-card, .base-card");
          const count = await cards.count();

          for (let i = 0; i < Math.min(count, 25); i++) {
            const card = cards.nth(i);
            const title =
              (await card.locator(".base-search-card__title").textContent())?.trim() ??
              (await card.locator("h3").textContent())?.trim() ??
              "";
            const company =
              (await card.locator(".base-search-card__subtitle").textContent())?.trim() ??
              "";
            const locationText =
              (await card.locator(".job-search-card__location").textContent())?.trim() ??
              location.label;
            const href =
              (await card.locator("a.base-card__full-link").getAttribute("href")) ??
              (await card.locator("a").first().getAttribute("href")) ??
              "";

            if (!title || !company || !href) continue;

            const applyUrl = href.startsWith("http")
              ? href
              : `https://www.linkedin.com${href}`;
            const combined = `${title} ${locationText}`;
            const seniority = inferSeniority(combined);
            if (!isRelevantSeniority(seniority)) continue;

            const key = `${title}|${company}|${applyUrl}`;
            if (seen.has(key)) continue;
            seen.add(key);

            jobs.push({
              source: "linkedin",
              externalId: applyUrl.split("/").pop() ?? undefined,
              title,
              company,
              location: locationText,
              remoteType: inferRemoteType(`${locationText} ${title}`),
              seniority,
              description: undefined,
              salary: undefined,
              tags: extractTags(`${title} ${keyword}`),
              applyUrl,
              postedAt: null,
            });
          }
        } catch (error) {
          console.error(`LinkedIn scrape failed for ${keyword} @ ${location.label}:`, error);
        }
      }
    }

    return jobs;
  }
}

export async function scrapeLinkedIn() {
  return new LinkedInScraper().run();
}
