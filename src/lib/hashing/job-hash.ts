import { createHash } from "crypto";
import type { ScrapedJob } from "@/lib/types/job";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildJobHash(job: Pick<ScrapedJob, "source" | "title" | "company" | "location" | "applyUrl">): string {
  const payload = [
    job.source,
    normalize(job.title),
    normalize(job.company),
    normalize(job.location ?? ""),
    normalize(job.applyUrl),
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}
