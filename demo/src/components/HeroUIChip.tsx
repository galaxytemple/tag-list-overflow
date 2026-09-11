import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

export const chipVariants = cva(
  "inline-flex items-center justify-center box-border whitespace-nowrap font-medium rounded-full text-xs px-2.5 py-1 transition-colors select-none shrink min-w-0",
  {
    variants: {
      variant: {
        solid: "text-white shadow-sm",
        flat: "shadow-none",
        bordered: "border bg-transparent",
        dot: "border border-slate-200 bg-white text-slate-800",
      },
      color: {
        default: "bg-slate-200 text-slate-800 border-slate-300",
        primary: "bg-blue-600 border-blue-600",
        secondary: "bg-purple-600 border-purple-600",
        success: "bg-emerald-600 border-emerald-600",
        warning: "bg-amber-500 border-amber-500",
        danger: "bg-rose-600 border-rose-600",
      },
    },
    compoundVariants: [
      // Flat variants
      { variant: "flat", color: "primary", className: "bg-blue-50 text-blue-700" },
      { variant: "flat", color: "secondary", className: "bg-purple-50 text-purple-700" },
      { variant: "flat", color: "success", className: "bg-emerald-50 text-emerald-700" },
      { variant: "flat", color: "warning", className: "bg-amber-50 text-amber-800" },
      { variant: "flat", color: "danger", className: "bg-rose-50 text-rose-700" },

      // Bordered variants
      { variant: "bordered", color: "primary", className: "border-blue-500 text-blue-600" },
      { variant: "bordered", color: "secondary", className: "border-purple-500 text-purple-600" },
      { variant: "bordered", color: "success", className: "border-emerald-500 text-emerald-600" },
      { variant: "bordered", color: "warning", className: "border-amber-500 text-amber-700" },
      { variant: "bordered", color: "danger", className: "border-rose-500 text-rose-600" },
    ],
    defaultVariants: {
      variant: "flat",
      color: "primary",
    },
  }
);

const dotColors: Record<string, string> = {
  default: "bg-slate-400",
  primary: "bg-blue-600",
  secondary: "bg-purple-600",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

export interface HeroUIChipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof chipVariants> {
  startContent?: React.ReactNode;
}

export function HeroUIChip({
  children,
  className,
  variant = "flat",
  color = "primary",
  startContent,
  ...props
}: HeroUIChipProps) {
  const isDot = variant === "dot";
  const activeColor = color ?? "primary";

  return (
    <div
      className={cn(chipVariants({ variant, color: activeColor }), className)}
      {...props}
    >
      {isDot && (
        <span
          className={cn(
            "w-2 h-2 rounded-full mr-1.5 shrink-0",
            dotColors[activeColor] || "bg-blue-600"
          )}
        />
      )}
      {startContent && <span className="mr-1 shrink-0">{startContent}</span>}
      <span>{children}</span>
    </div>
  );
}
