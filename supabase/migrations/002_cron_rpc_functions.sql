-- Cron-safe RPC functions for scraping without service role key on Vercel

CREATE OR REPLACE FUNCTION public.upsert_jobs_from_cron(jobs_payload jsonb, cron_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job jsonb;
  inserted_count integer := 0;
  updated_count integer := 0;
  row_hash text;
  existed boolean;
BEGIN
  IF cron_key IS NULL OR length(cron_key) < 16 THEN
    RAISE EXCEPTION 'Invalid cron key';
  END IF;

  FOR job IN SELECT * FROM jsonb_array_elements(jobs_payload)
  LOOP
    row_hash := job->>'hash';
    SELECT EXISTS(SELECT 1 FROM public.jobs WHERE hash = row_hash) INTO existed;

    INSERT INTO public.jobs (
      source,
      external_id,
      title,
      company,
      location,
      remote_type,
      seniority,
      description,
      salary,
      tags,
      apply_url,
      posted_at,
      scraped_at,
      hash
    ) VALUES (
      job->>'source',
      NULLIF(job->>'external_id', ''),
      job->>'title',
      job->>'company',
      NULLIF(job->>'location', ''),
      COALESCE(job->>'remote_type', 'unknown'),
      COALESCE(job->>'seniority', 'unknown'),
      NULLIF(job->>'description', ''),
      NULLIF(job->>'salary', ''),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(job->'tags')), '{}'),
      job->>'apply_url',
      NULLIF(job->>'posted_at', '')::timestamptz,
      COALESCE((job->>'scraped_at')::timestamptz, NOW()),
      row_hash
    )
    ON CONFLICT (hash) DO UPDATE SET
      title = EXCLUDED.title,
      company = EXCLUDED.company,
      location = EXCLUDED.location,
      remote_type = EXCLUDED.remote_type,
      seniority = EXCLUDED.seniority,
      description = EXCLUDED.description,
      salary = EXCLUDED.salary,
      tags = EXCLUDED.tags,
      apply_url = EXCLUDED.apply_url,
      posted_at = EXCLUDED.posted_at,
      scraped_at = EXCLUDED.scraped_at;

    IF existed THEN
      updated_count := updated_count + 1;
    ELSE
      inserted_count := inserted_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('inserted', inserted_count, 'updated', updated_count);
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_jobs_from_cron(jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_jobs_from_cron(jsonb, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.start_scraping_run(cron_key text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  run_id uuid;
BEGIN
  IF cron_key IS NULL OR length(cron_key) < 16 THEN
    RAISE EXCEPTION 'Invalid cron key';
  END IF;
  INSERT INTO public.scraping_runs (status) VALUES ('running') RETURNING id INTO run_id;
  RETURN run_id;
END;
$$;

REVOKE ALL ON FUNCTION public.start_scraping_run(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_scraping_run(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.finish_scraping_run(
  run_id uuid,
  cron_key text,
  run_status text,
  jobs_found integer,
  jobs_inserted integer,
  jobs_updated integer,
  error_message text DEFAULT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF cron_key IS NULL OR length(cron_key) < 16 THEN
    RAISE EXCEPTION 'Invalid cron key';
  END IF;
  UPDATE public.scraping_runs
  SET
    finished_at = NOW(),
    status = run_status,
    jobs_found = finish_scraping_run.jobs_found,
    jobs_inserted = finish_scraping_run.jobs_inserted,
    jobs_updated = finish_scraping_run.jobs_updated,
    error_message = finish_scraping_run.error_message,
    metadata = finish_scraping_run.metadata
  WHERE id = run_id;
END;
$$;

REVOKE ALL ON FUNCTION public.finish_scraping_run(uuid, text, text, integer, integer, integer, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finish_scraping_run(uuid, text, text, integer, integer, integer, text, jsonb) TO anon, authenticated, service_role;
