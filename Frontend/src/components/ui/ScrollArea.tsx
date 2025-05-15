
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useScrollShadow } from "@/hooks/useScrollShadow";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
}

export function ScrollArea({ children, className }: ScrollAreaProps) {
  const { ref, showTop, showBottom } = useScrollShadow<HTMLDivElement>();

  return (
    <div className="relative overflow-hidden">
      {showTop && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent z-10" />
      )}

      <div
        ref={ref}
        className={cn("max-h-[500px] overflow-y-auto pr-2", className)}
      >
        {children}
      </div>

      {showBottom && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent z-10" />
      )}
    </div>
  );
}
