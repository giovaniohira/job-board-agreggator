"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { JobsService } from "@/services/jobs.service";
import { jobFiltersSchema } from "@/lib/types/job";

const jobsService = new JobsService();

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getJobsAction(searchParams: Record<string, string | string[] | undefined>) {
  const userId = await getUserId();
  const raw = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  );
  const filters = jobFiltersSchema.parse(raw);
  return jobsService.listJobs(filters, userId);
}

export async function toggleSavedAction(jobId: string, saved: boolean) {
  const userId = await getUserId();
  await jobsService.toggleSaved(jobId, userId, saved);
  revalidatePath("/dashboard");
}

export async function toggleAppliedAction(jobId: string, applied: boolean) {
  await getUserId();
  await jobsService.setApplied(jobId, applied);
  revalidatePath("/dashboard");
}

export async function hideJobAction(jobId: string) {
  await getUserId();
  await jobsService.hideJob(jobId);
  revalidatePath("/dashboard");
}
