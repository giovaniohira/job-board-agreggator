import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobPulse — Remote Job Aggregator",
  description:
    "Private dashboard for remote junior and mid-level software roles in the United States, Canada, and Brazil.",
  openGraph: {
    title: "JobPulse — Remote Job Aggregator",
    description:
      "Remote engineering jobs, filtered and tracked in one private dashboard.",
    url: "https://job-board-pulse.vercel.app",
    siteName: "JobPulse",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
