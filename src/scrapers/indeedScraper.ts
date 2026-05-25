import type { Page } from "playwright-core";
import type { ScrapedJob } from "@/lib/types/job";
import { BaseScraper, dismissOverlays, scrollPage } from "./base-scraper";
import {
  SEARCH_KEYWORDS,
  SEARCH_LOCATIONS,
  extractTags,
  inferRemoteType,
  inferSeniority,
  isAllowedPipelineJob,
  isRelevantSeniority,
} from "./utils";

export class IndeedScraper extends BaseScraper {
  readonly source = "indeed" as const;

  protected async scrapeWithPage(page: Page): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const seen = new Set<string>();

    for (const keyword of SEARCH_KEYWORDS) {
      for (const location of SEARCH_LOCATIONS) {
        const url = new URL("https://www.indeed.com/jobs");
        url.searchParams.set("q", keyword);
        url.searchParams.set("l", location.query);
        url.searchParams.set("fromage", "7");
        url.searchParams.set("explvl", "ENTRY_LEVEL,MID_LEVEL");
        url.searchParams.set("remotejob", "1");

        try {
          await page.goto(url.toString(), {
            waitUntil: "domcontentloaded",
            timeout: 45000,
          });
          await dismissOverlays(page);
          await scrollPage(page, 4);

          const cards = page.locator(".job_seen_beacon, .resultContent, .jobsearch-ResultsList > li");
          const count = await cards.count();

          for (let i = 0; i < Math.min(count, 25); i++) {
            const card = cards.nth(i);
            const title =
              (await card.locator("h2.jobTitle span").textContent())?.trim() ??
              (await card.locator("h2").textContent())?.trim() ??
              "";
            const company =
              (await card.locator('[data-testid="company-name"]').textContent())?.trim() ??
              (await card.locator(".companyName").textContent())?.trim() ??
              "";
            const locationText =
              (await card.locator('[data-testid="text-location"]').textContent())?.trim() ??
              (await card.locator(".companyLocation").textContent())?.trim() ??
              location.label;
            const salary =
              (await card.locator(".salary-snippet, .metadata.salary-snippet-container").textContent())?.trim() ??
              undefined;
            const href =
              (await card.locator("h2.jobTitle a").getAttribute("href")) ??
              (await card.locator("a.jcs-JobTitle").getAttribute("href")) ??
              "";

            if (!title || !company || !href) continue;

            const applyUrl = href.startsWith("http")
              ? href
              : `https://www.indeed.com${href}`;
            const combined = `${title} ${locationText}`;
            const seniority = inferSeniority(combined);
            if (!isRelevantSeniority(seniority)) continue;

            const remoteType = inferRemoteType(combined);
            if (
              !isAllowedPipelineJob(
                { title, location: locationText, remoteType },
                location.country
              )
            ) {
              continue;
            }

            const key = `${title}|${company}|${applyUrl}`;
            if (seen.has(key)) continue;
            seen.add(key);

            jobs.push({
              source: "indeed",
              externalId: applyUrl.match(/jk=([a-f0-9]+)/i)?.[1],
              title,
              company,
              location: locationText,
              remoteType: "remote",
              seniority,
              description: undefined,
              salary,
              tags: extractTags(`${title} ${keyword}`),
              applyUrl,
              postedAt: null,
            });
          }
        } catch (error) {
          console.error(`Indeed scrape failed for ${keyword} @ ${location.label}:`, error);
        }
      }
    }

    return jobs;
  }
}

export async function scrapeIndeed() {
  return new IndeedScraper().run();
}
