import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Filter,
  Globe2,
  Radar,
  Shield,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const previewJobs = [
  {
    title: "Backend Engineer",
    company: "Acme Labs",
    location: "Remote · United States",
    tags: ["node", "typescript", "postgres"],
  },
  {
    title: "Full Stack Developer",
    company: "Northwind",
    location: "Remote · Canada",
    tags: ["react", "next.js", "aws"],
  },
  {
    title: "Software Engineer Jr",
    company: "Horizon Tech",
    location: "Remote · Brazil",
    tags: ["javascript", "docker"],
  },
];

export function LandingPage() {
  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400/80">
              JobPulse
            </p>
            <p className="text-sm text-zinc-400">Private job aggregation</p>
          </div>
          <Button asChild size="sm">
            <Link href="/login">
              Open dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-zinc-800/80">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_42%)]" />
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:py-24">
            <div className="space-y-6">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
                Remote engineering jobs, scraped, filtered, and tracked in one place.
              </h1>
              <p className="max-w-xl text-base leading-7 text-zinc-400 md:text-lg">
                JobPulse brings junior and mid-level remote software roles from the
                United States, Canada, and Brazil into a single private dashboard —
                updated daily, without repeating the same search across job boards.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg">
                  <Link href="/login">Sign in to dashboard</Link>
                </Button>
              </div>
            </div>

            <Card className="border-zinc-800/80 bg-zinc-950/70 shadow-2xl shadow-emerald-500/5">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-300">Dashboard preview</p>
                  <Badge variant="outline">896 jobs indexed</Badge>
                </div>
                <div className="space-y-3">
                  {previewJobs.map((job) => (
                    <div
                      key={job.title}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-zinc-100">{job.title}</p>
                        <Badge variant="outline">remote</Badge>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">
                        {job.company} · {job.location}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Radar,
                title: "Daily updates",
                body: "Fresh remote listings collected every morning from LinkedIn, Indeed, and Glassdoor.",
              },
              {
                icon: Filter,
                title: "Filtered for you",
                body: "Junior and mid-level roles only — remote, in the US, Canada, or Brazil.",
              },
              {
                icon: Shield,
                title: "Private workspace",
                body: "Sign in to browse, save favorites, and track what you have already applied to.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <Card key={title} className="border-zinc-800/80 bg-zinc-950/50">
                <CardContent className="space-y-3 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <Icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-medium text-zinc-100">{title}</h2>
                  <p className="text-sm leading-6 text-zinc-400">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-zinc-800/80 bg-zinc-950/40">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Globe2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Markets covered</span>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                  Remote-only roles in the United States, Canada, and Brazil. Hybrid,
                  on-site, and out-of-region listings never make it into your feed.
                </p>
                <div className="flex items-center gap-2 text-zinc-500">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm">Updated daily at 9:00 AM Brazil time</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <Bookmark className="h-4 w-4" />
                  <span className="text-sm">Save jobs and mark applications from the dashboard</span>
                </div>
              </div>
              <Button asChild size="lg">
                <Link href="/login">
                  Explore the dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between md:px-6">
          <p>JobPulse · private job aggregator</p>
          <Link href="/login" className="text-zinc-400 transition-colors hover:text-zinc-200">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
