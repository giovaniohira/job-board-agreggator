export const SEARCH_KEYWORDS = [
  "software engineer",
  "backend engineer",
  "full stack engineer",
  "frontend engineer",
  "node.js developer",
  "react developer",
] as const;

export const SEARCH_LOCATIONS = [
  { label: "Brazil", query: "Brazil" },
  { label: "Remote", query: "Remote" },
  { label: "Worldwide Remote", query: "Worldwide" },
] as const;

export const SENIORITY_PATTERNS = {
  junior: /\b(junior|jr\.?|entry[- ]level|estagi[aá]rio|trainee)\b/i,
  mid: /\b(mid[- ]level|pleno|semi[- ]senior|intermediate)\b/i,
  senior: /\b(senior|sr\.?|s[eê]nior|staff|lead|principal)\b/i,
} as const;

export const REMOTE_PATTERNS = {
  remote: /\b(remote|remoto|work from home|wfh|anywhere|worldwide)\b/i,
  hybrid: /\b(hybrid|h[ií]brido)\b/i,
  onSite: /\b(on[- ]site|presencial|in[- ]office)\b/i,
} as const;

export const STACK_KEYWORDS = [
  "react",
  "node",
  "typescript",
  "javascript",
  "python",
  "java",
  "go",
  "rust",
  "aws",
  "docker",
  "kubernetes",
  "postgres",
  "mongodb",
  "next.js",
  "vue",
  "angular",
] as const;

export function inferSeniority(text: string): "junior" | "mid" | "senior" | "unknown" {
  if (SENIORITY_PATTERNS.junior.test(text)) return "junior";
  if (SENIORITY_PATTERNS.mid.test(text)) return "mid";
  if (SENIORITY_PATTERNS.senior.test(text)) return "senior";
  return "unknown";
}

export function inferRemoteType(text: string): "remote" | "hybrid" | "on-site" | "unknown" {
  if (REMOTE_PATTERNS.remote.test(text)) return "remote";
  if (REMOTE_PATTERNS.hybrid.test(text)) return "hybrid";
  if (REMOTE_PATTERNS.onSite.test(text)) return "on-site";
  return "unknown";
}

export function extractTags(text: string): string[] {
  const lower = text.toLowerCase();
  return STACK_KEYWORDS.filter((tag) => lower.includes(tag));
}

export function isRelevantSeniority(seniority: ReturnType<typeof inferSeniority>): boolean {
  return seniority === "junior" || seniority === "mid" || seniority === "unknown";
}
