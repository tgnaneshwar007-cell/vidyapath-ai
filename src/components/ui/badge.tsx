import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-brand-storm-subtle text-brand-storm-dark",
        outline:
          "border border-brand-border bg-transparent text-brand-storm-dark",
        verified:
          "border border-emerald-200 bg-brand-success-subtle text-brand-success font-semibold",
        central:
          "border border-slate-200 bg-slate-100 text-slate-800",
        state:
          "border border-blue-200 bg-blue-50 text-blue-800",
        private:
          "border border-amber-200 bg-amber-50 text-amber-900",
        warning:
          "border border-amber-300 bg-brand-warning-subtle text-brand-warning font-semibold",
        danger:
          "border border-red-200 bg-brand-danger-subtle text-brand-danger font-semibold",
        orange:
          "border border-orange-200 bg-brand-orange-subtle text-brand-orange font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
