import type { SupabaseClient } from "@supabase/supabase-js";
import type { Job, JobFilters, ScrapedJob } from "@/lib/types/job";
import { buildJobHash } from "@/lib/hashing/job-hash";
import { createServiceClient, getCronKey } from "@/lib/supabase/admin";

type DbJobRow = {
  id: string;
  source: Job["source"];
  external_id: string | null;
  title: string;
  company: string;
  location: string | null;
  remote_type: Job["remoteType"];
  seniority: Job["seniority"];
  description: string | null;
  salary: string | null;
  tags: string[] | null;
  apply_url: string;
  posted_at: string | null;
  scraped_at: string;
  hash: string;
  hidden: boolean;
  applied: boolean;
};

function mapRow(row: DbJobRow): Job {
  return {
    id: row.id,
    source: row.source,
    externalId: row.external_id ?? undefined,
    title: row.title,
    company: row.company,
    location: row.location ?? undefined,
    remoteType: row.remote_type,
    seniority: row.seniority,
    description: row.description ?? undefined,
    salary: row.salary ?? undefined,
    tags: row.tags ?? [],
    applyUrl: row.apply_url,
    postedAt: row.posted_at,
    scrapedAt: row.scraped_at,
    hash: row.hash,
    hidden: row.hidden,
    applied: row.applied,
  };
}

export class JobsRepository {
  constructor(private supabase: SupabaseClient = createServiceClient()) {}

  async upsertJobs(jobs: ScrapedJob[]) {
    if (jobs.length === 0) {
      return { inserted: 0, updated: 0 };
    }

    const cronKey = getCronKey();
    const payload = jobs.map((job) => ({
      source: job.source,
      external_id: job.externalId ?? "",
      title: job.title,
      company: job.company,
      location: job.location ?? "",
      remote_type: job.remoteType,
      seniority: job.seniority,
      description: job.description ?? "",
      salary: job.salary ?? "",
      tags: job.tags,
      apply_url: job.applyUrl,
      posted_at: job.postedAt ?? "",
      scraped_at: new Date().toISOString(),
      hash: buildJobHash(job),
    }));

    const { data, error } = await this.supabase.rpc("upsert_jobs_from_cron", {
      jobs_payload: payload,
      cron_key: cronKey,
    });

    if (error) {
      throw new Error(`Failed to upsert jobs: ${error.message}`);
    }

    const result = (data ?? { inserted: 0, updated: 0 }) as {
      inserted: number;
      updated: number;
    };

    return {
      inserted: result.inserted ?? 0,
      updated: result.updated ?? 0,
    };
  }

  async findMany(filters: JobFilters, userId?: string) {
    const { page, limit, hidden, applied, savedOnly, ...rest } = filters;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let savedJobIds: string[] = [];
    if (userId) {
      const { data: savedRows } = await this.supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", userId);
      savedJobIds = (savedRows ?? []).map((row) => row.job_id);
    }

    if (savedOnly && userId && savedJobIds.length === 0) {
      return { jobs: [], total: 0, page, limit, totalPages: 0 };
    }

    let query = this.supabase.from("jobs").select("*", { count: "exact" });

    if (rest.source) query = query.eq("source", rest.source);
    if (rest.remote) query = query.eq("remote_type", rest.remote);
    if (rest.seniority) query = query.eq("seniority", rest.seniority);
    if (rest.country) {
      query = query.ilike("location", `%${rest.country}%`);
    }
    if (rest.stack) {
      query = query.or(
        `title.ilike.%${rest.stack}%,description.ilike.%${rest.stack}%`
      );
    }
    if (typeof applied === "boolean") query = query.eq("applied", applied);
    query = query.eq("hidden", hidden ?? false);

    if (savedOnly && userId) {
      query = query.in("id", savedJobIds);
    }

    const { data, error, count } = await query
      .order("posted_at", { ascending: false, nullsFirst: false })
      .order("scraped_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    const savedSet = new Set(savedJobIds);

    return {
      jobs: (data as DbJobRow[]).map((row) => ({
        ...mapRow(row),
        saved: savedSet.has(row.id),
      })),
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  }

  async updateJob(
    jobId: string,
    updates: Partial<Pick<Job, "hidden" | "applied">>
  ) {
    const { error } = await this.supabase
      .from("jobs")
      .update({
        hidden: updates.hidden,
        applied: updates.applied,
      })
      .eq("id", jobId);

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }
  }
}

export class SavedJobsRepository {
  constructor(private supabase: SupabaseClient = createServiceClient()) {}

  async toggleSaved(jobId: string, userId: string, saved: boolean) {
    if (saved) {
      const { error } = await this.supabase.from("saved_jobs").upsert(
        { job_id: jobId, user_id: userId },
        { onConflict: "job_id,user_id" }
      );
      if (error) throw new Error(error.message);
      return;
    }

    const { error } = await this.supabase
      .from("saved_jobs")
      .delete()
      .eq("job_id", jobId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }
}

export class ScrapingRunsRepository {
  constructor(private supabase: SupabaseClient = createServiceClient()) {}

  async startRun() {
    const cronKey = getCronKey();
    const { data, error } = await this.supabase.rpc("start_scraping_run", {
      cron_key: cronKey,
    });

    if (error) throw new Error(error.message);
    return { id: data as string };
  }

  async finishRun(
    runId: string,
    payload: {
      status: "completed" | "failed" | "partial";
      jobsFound: number;
      jobsInserted: number;
      jobsUpdated: number;
      errorMessage?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    const cronKey = getCronKey();
    const { error } = await this.supabase.rpc("finish_scraping_run", {
      run_id: runId,
      cron_key: cronKey,
      run_status: payload.status,
      jobs_found: payload.jobsFound,
      jobs_inserted: payload.jobsInserted,
      jobs_updated: payload.jobsUpdated,
      error_message: payload.errorMessage ?? null,
      metadata: payload.metadata ?? {},
    });

    if (error) throw new Error(error.message);
  }

  async getRecent(limit = 10) {
    const { data, error } = await this.supabase
      .from("scraping_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data ?? [];
  }
}
