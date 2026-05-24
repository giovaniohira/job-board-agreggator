"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  EyeOff,
  MapPin,
  Building2,
} from "lucide-react";
import { useTransition } from "react";
import type { Job } from "@/lib/types/job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  hideJobAction,
  toggleAppliedAction,
  toggleSavedAction,
} from "@/actions/jobs.actions";

const sourceLabels: Record<Job["source"], string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  glassdoor: "Glassdoor",
};

export function JobCard({ job }: { job: Job }) {
  const [isPending, startTransition] = useTransition();

  const runAction = (action: () => Promise<void>) => {
    startTransition(() => {
      void action();
    });
  };

  return (
    <Card className="group transition-colors hover:border-zinc-700/80">
      <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="text-base font-semibold tracking-tight text-zinc-50">
              {job.title}
            </h3>
            <Badge variant="secondary">{sourceLabels[job.source]}</Badge>
            {job.seniority !== "unknown" && (
              <Badge variant="outline" className="capitalize">
                {job.seniority}
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {job.remoteType}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {job.company}
            </span>
            {job.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            {job.salary && (
              <span className="text-emerald-300/90">{job.salary}</span>
            )}
          </div>

          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.tags.slice(0, 6).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-xs text-zinc-500">
            Scraped{" "}
            {formatDistanceToNow(new Date(job.scrapedAt), { addSuffix: true })}
            {job.postedAt &&
              ` · Posted ${formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}`}
          </p>
        </div>

        <div className="flex flex-row flex-wrap items-start gap-2 lg:flex-col lg:items-end">
          <Button asChild size="sm" variant="secondary">
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
              Apply
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>

          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              disabled={isPending}
              aria-label={job.saved ? "Remove from saved" : "Save job"}
              onClick={() =>
                runAction(() => toggleSavedAction(job.id, !job.saved))
              }
            >
              {job.saved ? (
                <BookmarkCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              disabled={isPending}
              aria-label={job.applied ? "Mark as not applied" : "Mark as applied"}
              onClick={() =>
                runAction(() => toggleAppliedAction(job.id, !job.applied))
              }
            >
              <CheckCircle2
                className={`h-4 w-4 ${job.applied ? "text-emerald-400" : ""}`}
              />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              disabled={isPending}
              aria-label="Hide job"
              onClick={() => runAction(() => hideJobAction(job.id))}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
