import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jobFiltersSchema } from "@/lib/types/job";
import { JobsService } from "@/services/jobs.service";

const jobsService = new JobsService();

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const raw = Object.fromEntries(searchParams.entries());
  const filters = jobFiltersSchema.parse(raw);

  try {
    const result = await jobsService.listJobs(filters, user.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
