export const SEARCH_KEYWORDS = [
  "software engineer",
  "backend engineer",
  "full stack engineer",
  "frontend engineer",
  "node.js developer",
  "react developer",
] as const;

export const ALLOWED_COUNTRIES = ["us", "canada", "brazil"] as const;
export type AllowedCountry = (typeof ALLOWED_COUNTRIES)[number];

export const SEARCH_LOCATIONS = [
  { label: "United States", query: "United States", country: "us" as const },
  { label: "Canada", query: "Canada", country: "canada" as const },
  { label: "Brazil", query: "Brazil", country: "brazil" as const },
] as const;

const COUNTRY_PATTERNS: Record<AllowedCountry, RegExp[]> = {
  us: [
    /\b(united states|u\.?s\.?a?\.?|usa)\b/i,
    /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/,
    /\b(new york|san francisco|seattle|austin|chicago|boston|denver|atlanta|miami|los angeles|silicon valley)\b/i,
  ],
  canada: [
    /\b(canada|canadian)\b/i,
    /,\s*(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\b/,
    /\b(toronto|vancouver|montreal|calgary|ottawa|edmonton|winnipeg|quebec city|mississauga)\b/i,
  ],
  brazil: [
    /\b(brazil|brasil)\b/i,
    /\b(s[aã]o paulo|rio de janeiro|belo horizonte|curitiba|porto alegre|bras[ií]lia|recife|fortaleza|salvador|manaus|florian[oó]polis|campinas)\b/i,
  ],
};

const EXCLUDED_REGIONS =
  /\b(europe|european|emea|apac|asia|africa|uk|united kingdom|germany|france|spain|india|australia|mexico|argentina|colombia|latam|latin america|worldwide|global)\b/i;

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

export function inferAllowedCountry(
  locationText: string,
  searchCountry?: AllowedCountry
): AllowedCountry | null {
  const text = locationText.trim();
  if (!text) return searchCountry ?? null;

  for (const country of ALLOWED_COUNTRIES) {
    if (COUNTRY_PATTERNS[country].some((pattern) => pattern.test(text))) {
      return country;
    }
  }

  if (EXCLUDED_REGIONS.test(text)) {
    return null;
  }

  if (
    searchCountry &&
    (REMOTE_PATTERNS.remote.test(text) ||
      /^(remote|remoto|work from home|wfh)$/i.test(text))
  ) {
    return searchCountry;
  }

  return null;
}

export function resolveRemoteType(
  remoteType: "remote" | "hybrid" | "on-site" | "unknown",
  text: string
): "remote" | "hybrid" | "on-site" | "unknown" {
  if (remoteType === "hybrid" || remoteType === "on-site") {
    return remoteType;
  }
  if (remoteType === "remote") return "remote";
  return inferRemoteType(text);
}

export function isAllowedPipelineJob(
  job: {
    title: string;
    location?: string;
    remoteType: "remote" | "hybrid" | "on-site" | "unknown";
  },
  searchCountry?: AllowedCountry
): boolean {
  const combined = `${job.title} ${job.location ?? ""}`;
  const effectiveRemote = resolveRemoteType(job.remoteType, combined);

  if (effectiveRemote !== "remote") return false;

  return inferAllowedCountry(job.location ?? "", searchCountry) !== null;
}
