import { NextResponse } from "next/server";
import { ScrapingService } from "@/services/scraping.service";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const token = authHeader?.replace("Bearer ", "");
    if (token !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const service = new ScrapingService();
    const summary = await service.runAllScrapers();

    return NextResponse.json({
      ok: true,
      runId: summary.runId,
      totalFound: summary.totalFound,
      totalInserted: summary.totalInserted,
      totalUpdated: summary.totalUpdated,
      scrapers: summary.results.map((r) => ({
        source: r.source,
        found: r.jobs.length,
        errors: r.errors,
        durationMs: r.durationMs,
      })),
    });
  } catch (error) {
    console.error("Cron scrape failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Scrape failed",
      },
      { status: 500 }
    );
  }
}
