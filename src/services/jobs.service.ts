import { JobsRepository, SavedJobsRepository } from "@/repositories/jobs.repository";
import type { JobFilters } from "@/lib/types/job";
import { createClient } from "@/lib/supabase/server";

export class JobsService {
  private async getUserClient() {
    return createClient();
  }

  async listJobs(filters: JobFilters, userId?: string) {
    const supabase = await this.getUserClient();
    const jobsRepo = new JobsRepository(supabase);
    return jobsRepo.findMany(filters, userId);
  }

  async toggleSaved(jobId: string, userId: string, saved: boolean) {
    const supabase = await this.getUserClient();
    const savedRepo = new SavedJobsRepository(supabase);
    return savedRepo.toggleSaved(jobId, userId, saved);
  }

  async setApplied(jobId: string, applied: boolean) {
    const supabase = await this.getUserClient();
    const jobsRepo = new JobsRepository(supabase);
    return jobsRepo.updateJob(jobId, { applied });
  }

  async hideJob(jobId: string) {
    const supabase = await this.getUserClient();
    const jobsRepo = new JobsRepository(supabase);
    return jobsRepo.updateJob(jobId, { hidden: true });
  }
}
