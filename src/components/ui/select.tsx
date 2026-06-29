import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Native styled <select>. Chosen over Radix Select so values are submitted
 * directly via FormData to Server Actions (progressive enhancement, no JS state).
 */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "border-input focus-visible:ring-ring focus-visible:ring-offset-background flex h-9 w-full appearance-none rounded-md border bg-transparent pr-8 pl-3 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 opacity-50" />
    </div>
  );
});
Select.displayName = "Select";

export { Select };
