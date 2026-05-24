import { z } from "zod";

export const jobSourceSchema = z.enum(["linkedin", "indeed", "glassdoor"]);
export type JobSource = z.infer<typeof jobSourceSchema>;

export const remoteTypeSchema = z.enum([
  "remote",
  "hybrid",
  "on-site",
  "unknown",
]);
export type RemoteType = z.infer<typeof remoteTypeSchema>;

export const senioritySchema = z.enum(["junior", "mid", "senior", "unknown"]);
export type Seniority = z.infer<typeof senioritySchema>;

export const scrapedJobSchema = z.object({
  source: jobSourceSchema,
  externalId: z.string().optional(),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  remoteType: remoteTypeSchema.default("unknown"),
  seniority: senioritySchema.default("unknown"),
  description: z.string().optional(),
  salary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  applyUrl: z.string().url(),
  postedAt: z.string().datetime().optional().nullable(),
});

export type ScrapedJob = z.infer<typeof scrapedJobSchema>;

export const jobSchema = scrapedJobSchema.extend({
  id: z.string().uuid(),
  hash: z.string(),
  hidden: z.boolean().default(false),
  applied: z.boolean().default(false),
  scrapedAt: z.string().datetime(),
  saved: z.boolean().optional(),
});

export type Job = z.infer<typeof jobSchema>;

export const jobFiltersSchema = z.object({
  source: jobSourceSchema.optional(),
  remote: remoteTypeSchema.optional(),
  seniority: senioritySchema.optional(),
  country: z.string().optional(),
  stack: z.string().optional(),
  savedOnly: z.coerce.boolean().optional(),
  applied: z.coerce.boolean().optional(),
  hidden: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type JobFilters = z.infer<typeof jobFiltersSchema>;

export const scrapingRunSchema = z.object({
  id: z.string().uuid(),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
  status: z.enum(["running", "completed", "failed", "partial"]),
  source: jobSourceSchema.nullable(),
  jobsFound: z.number().int(),
  jobsInserted: z.number().int(),
  jobsUpdated: z.number().int(),
  errorMessage: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type ScrapingRun = z.infer<typeof scrapingRunSchema>;
