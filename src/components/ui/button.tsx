import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-orange text-white hover:bg-brand-orange-hover shadow-subtle active:scale-[0.99]",
        secondary:
          "bg-brand-black text-white hover:bg-brand-black-soft active:scale-[0.99]",
        outline:
          "border border-brand-border bg-brand-surface text-brand-black hover:bg-brand-storm-subtle hover:border-brand-storm active:scale-[0.99]",
        ghost:
          "text-brand-black hover:bg-brand-storm-subtle hover:text-brand-black active:scale-[0.99]",
        link:
          "text-brand-orange underline-offset-4 hover:underline p-0 h-auto font-normal",
        danger:
          "bg-brand-danger text-white hover:bg-red-700 active:scale-[0.99]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-6 text-base font-medium",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
