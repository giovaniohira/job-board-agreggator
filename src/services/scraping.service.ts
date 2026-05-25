import { JobsRepository, ScrapingRunsRepository } from "@/repositories/jobs.repository";
import { scrapeLinkedIn } from "@/scrapers/linkedinScraper";
import { scrapeIndeed } from "@/scrapers/indeedScraper";
import { scrapeGlassdoor } from "@/scrapers/glassdoorScraper";
import type { ScraperResult } from "@/scrapers/base-scraper";
import { isAllowedPipelineJob } from "@/scrapers/utils";
import { createAnonServiceClient } from "@/lib/supabase/admin";

type ScrapeSummary = {
  totalFound: number;
  totalInserted: number;
  totalUpdated: number;
  results: ScraperResult[];
  runId: string;
};

export class ScrapingService {
  private jobsRepo = new JobsRepository(createAnonServiceClient());
  private runsRepo = new ScrapingRunsRepository(createAnonServiceClient());

  async runAllScrapers(): Promise<ScrapeSummary> {
    const run = await this.runsRepo.startRun();

    const scrapers = [
      { name: "linkedin", fn: scrapeLinkedIn },
      { name: "indeed", fn: scrapeIndeed },
      { name: "glassdoor", fn: scrapeGlassdoor },
    ] as const;

    const results: ScraperResult[] = [];
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalFound = 0;
    let failedCount = 0;

    for (const scraper of scrapers) {
      try {
        const result = await scraper.fn();
        const allowedJobs = result.jobs.filter((job) => isAllowedPipelineJob(job));
        const filteredResult = { ...result, jobs: allowedJobs };
        results.push(filteredResult);
        totalFound += allowedJobs.length;

        if (allowedJobs.length > 0) {
          const { inserted, updated } = await this.jobsRepo.upsertJobs(allowedJobs);
          totalInserted += inserted;
          totalUpdated += updated;
        }

        if (result.errors.length > 0) {
          failedCount += 1;
        }
      } catch (error) {
        failedCount += 1;
        results.push({
          source: scraper.name,
          jobs: [],
          errors: [error instanceof Error ? error.message : "Unknown error"],
          durationMs: 0,
        });
      }
    }

    const status =
      failedCount === scrapers.length
        ? "failed"
        : failedCount > 0
          ? "partial"
          : "completed";

    await this.runsRepo.finishRun(run.id, {
      status,
      jobsFound: totalFound,
      jobsInserted: totalInserted,
      jobsUpdated: totalUpdated,
      metadata: {
        scrapers: results.map((r) => ({
          source: r.source,
          found: r.jobs.length,
          errors: r.errors,
          durationMs: r.durationMs,
        })),
      },
    });

    return {
      totalFound,
      totalInserted,
      totalUpdated,
      results,
      runId: run.id,
    };
  }
}
