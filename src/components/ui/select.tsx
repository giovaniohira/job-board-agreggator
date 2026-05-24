import * as React from "react";
import { cn } from "@/lib/utils";

function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
