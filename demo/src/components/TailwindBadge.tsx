import React from "react";
import { cn } from "../utils";

export interface TailwindBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: "sky" | "violet" | "emerald" | "amber" | "rose" | "indigo";
}

const colorMap = {
  sky: "bg-sky-50 text-sky-700 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
};

export function TailwindBadge({
  children,
  className,
  color = "indigo",
  ...props
}: TailwindBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset select-none shrink min-w-0",
        colorMap[color],
        className
      )}
      {...props}
    >
      <svg className="h-1.5 w-1.5 fill-current" viewBox="0 0 6 6" aria-hidden="true">
        <circle cx={3} cy={3} r={3} />
      </svg>
      {children}
    </span>
  );
}
