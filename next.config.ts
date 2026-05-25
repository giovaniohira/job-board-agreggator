import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "@sparticuz/chromium",
  ],
  // Playwright needs browsers.json at runtime; Vercel file tracing omits it by default.
  outputFileTracingIncludes: {
    "/api/cron/scrape": [
      "./node_modules/playwright-core/**/*",
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

export default nextConfig;
