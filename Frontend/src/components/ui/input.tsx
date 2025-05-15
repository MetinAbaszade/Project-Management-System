
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
