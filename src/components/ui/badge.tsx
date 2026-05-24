import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "default" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        variant === "secondary" && "border-zinc-600 bg-zinc-800 text-zinc-300",
        variant === "outline" && "border-zinc-600 text-zinc-400",
        variant === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        variant === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-300",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
