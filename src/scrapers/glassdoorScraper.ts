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

export class GlassdoorScraper extends BaseScraper {
  readonly source = "glassdoor" as const;

  protected async scrapeWithPage(page: Page): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const seen = new Set<string>();

    for (const keyword of SEARCH_KEYWORDS) {
      for (const location of SEARCH_LOCATIONS) {
        const slug = encodeURIComponent(keyword);
        const locSlug = encodeURIComponent(location.query);
        const url = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${slug}&locT=N&locId=1&locKeyword=${locSlug}&fromAge=7&remoteWorkType=1`;

        try {
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 45000,
          });
          await dismissOverlays(page);
          await scrollPage(page, 4);

          const cards = page.locator('[data-test="jobListing"], .react-job-listing, li.JobsList_jobListItem__JBBUV');
          const count = await cards.count();

          for (let i = 0; i < Math.min(count, 25); i++) {
            const card = cards.nth(i);
            const title =
              (await card.locator('[data-test="job-title"]').textContent())?.trim() ??
              (await card.locator("a.JobCard_jobTitle__GLyJ1").textContent())?.trim() ??
              "";
            const company =
              (await card.locator('[data-test="employer-name"]').textContent())?.trim() ??
              (await card.locator(".EmployerProfile_employerName__Xemli").textContent())?.trim() ??
              "";
            const locationText =
              (await card.locator('[data-test="emp-location"]').textContent())?.trim() ??
              location.label;
            const salary =
              (await card.locator('[data-test="detailSalary"]').textContent())?.trim() ??
              undefined;
            const href =
              (await card.locator('[data-test="job-link"]').getAttribute("href")) ??
              (await card.locator("a").first().getAttribute("href")) ??
              "";

            if (!title || !company || !href) continue;

            const applyUrl = href.startsWith("http")
              ? href
              : `https://www.glassdoor.com${href}`;
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
              source: "glassdoor",
              externalId: applyUrl.split("jobListingId=")[1]?.split("&")[0],
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
          console.error(`Glassdoor scrape failed for ${keyword} @ ${location.label}:`, error);
        }
      }
    }

    return jobs;
  }
}

export async function scrapeGlassdoor() {
  return new GlassdoorScraper().run();
}
