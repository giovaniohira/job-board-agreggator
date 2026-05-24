"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function JobFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      startTransition(() => {
        router.push(`/dashboard?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    startTransition(() => router.push("/dashboard"));
  };

  return (
    <div className="grid gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">Source</label>
        <Select
          defaultValue={searchParams.get("source") ?? ""}
          onChange={(e) => updateParam("source", e.target.value)}
        >
          <option value="">All sources</option>
          <option value="linkedin">LinkedIn</option>
          <option value="indeed">Indeed</option>
          <option value="glassdoor">Glassdoor</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">Remote type</label>
        <Select
          defaultValue={searchParams.get("remote") ?? ""}
          onChange={(e) => updateParam("remote", e.target.value)}
        >
          <option value="">Any</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="on-site">On-site</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">Seniority</label>
        <Select
          defaultValue={searchParams.get("seniority") ?? ""}
          onChange={(e) => updateParam("seniority", e.target.value)}
        >
          <option value="">Any</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="unknown">Unspecified</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">Country / location</label>
        <Input
          placeholder="Brazil, Remote..."
          defaultValue={searchParams.get("country") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParam("country", e.currentTarget.value);
            }
          }}
          onBlur={(e) => updateParam("country", e.target.value)}
        />
      </div>

      <div className="space-y-1.5 xl:col-span-2">
        <label className="text-xs font-medium text-zinc-400">Stack keyword</label>
        <Input
          placeholder="react, node, typescript..."
          defaultValue={searchParams.get("stack") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParam("stack", e.currentTarget.value);
            }
          }}
          onBlur={(e) => updateParam("stack", e.target.value)}
        />
      </div>

      <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4 xl:col-span-6">
        <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            className="rounded border-zinc-600 bg-zinc-900"
            defaultChecked={searchParams.get("savedOnly") === "true"}
            onChange={(e) => updateParam("savedOnly", e.target.checked ? "true" : "")}
          />
          Saved only
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            className="rounded border-zinc-600 bg-zinc-900"
            defaultChecked={searchParams.get("applied") === "true"}
            onChange={(e) => updateParam("applied", e.target.checked ? "true" : "")}
          />
          Applied
        </label>
        <Button variant="outline" size="sm" onClick={clearFilters} disabled={isPending}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
