import { ScrapingService } from "../src/services/scraping.service";

async function main() {
  console.log("Starting manual scrape...");
  const service = new ScrapingService();
  const summary = await service.runAllScrapers();

  console.log("\nScrape complete:");
  console.log(`  Run ID: ${summary.runId}`);
  console.log(`  Found: ${summary.totalFound}`);
  console.log(`  Inserted: ${summary.totalInserted}`);
  console.log(`  Updated: ${summary.totalUpdated}`);

  for (const result of summary.results) {
    console.log(`\n  ${result.source}:`);
    console.log(`    Jobs: ${result.jobs.length}`);
    console.log(`    Duration: ${result.durationMs}ms`);
    if (result.errors.length) {
      console.log(`    Errors: ${result.errors.join(", ")}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
