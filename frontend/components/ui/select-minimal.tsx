"use client";

import * as React from "react";
import { cn } from "@/frontend/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * A "World-Class" minimalist select component for the Artisan design system.
 * Avoids the heavy overhead of specialized libraries while providing a premium, 
 * machine-readable ingestion interface.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        <select
          className={cn(
            "flex h-12 w-full appearance-none rounded-none border border-border/60 bg-transparent px-4 py-2 text-sm font-light ring-offset-background transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none group-focus-within:text-primary/60 transition-colors" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
