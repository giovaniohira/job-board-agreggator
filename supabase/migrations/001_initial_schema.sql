-- Job aggregation platform schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('linkedin', 'indeed', 'glassdoor')),
  external_id TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote_type TEXT NOT NULL DEFAULT 'unknown' CHECK (remote_type IN ('remote', 'hybrid', 'on-site', 'unknown')),
  seniority TEXT NOT NULL DEFAULT 'unknown' CHECK (seniority IN ('junior', 'mid', 'senior', 'unknown')),
  description TEXT,
  salary TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  apply_url TEXT NOT NULL,
  posted_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hash TEXT NOT NULL UNIQUE,
  hidden BOOLEAN NOT NULL DEFAULT FALSE,
  applied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_source ON public.jobs (source);
CREATE INDEX IF NOT EXISTS idx_jobs_remote_type ON public.jobs (remote_type);
CREATE INDEX IF NOT EXISTS idx_jobs_seniority ON public.jobs (seniority);
CREATE INDEX IF NOT EXISTS idx_jobs_hidden ON public.jobs (hidden);
CREATE INDEX IF NOT EXISTS idx_jobs_applied ON public.jobs (applied);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs (posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_scraped_at ON public.jobs (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON public.jobs USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs (location);

CREATE TABLE IF NOT EXISTS public.scraping_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  source TEXT CHECK (source IN ('linkedin', 'indeed', 'glassdoor')),
  jobs_found INTEGER NOT NULL DEFAULT 0,
  jobs_inserted INTEGER NOT NULL DEFAULT 0,
  jobs_updated INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_scraping_runs_started_at ON public.scraping_runs (started_at DESC);

CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs (user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_set_updated_at ON public.jobs;
CREATE TRIGGER jobs_set_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role manages jobs"
  ON public.jobs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read scraping runs"
  ON public.scraping_runs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages scraping runs"
  ON public.scraping_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users manage own saved jobs"
  ON public.saved_jobs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
