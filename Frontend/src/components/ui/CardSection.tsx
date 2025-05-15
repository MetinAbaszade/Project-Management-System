import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  tight?: boolean
}

export function CardSection({
  title,
  description,
  children,
  className,
  tight = false,
}: CardSectionProps) {
  return (
    <section
      className={cn("flex flex-col", tight ? "gap-2" : "gap-4", className)}
      aria-labelledby={title ? `section-${title.replace(/\s+/g, "-").toLowerCase()}` : undefined}
    >
      {(title || description) && (
        <div className="space-y-0.5">
          {title && (
            <h3
              id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
              className="text-base font-semibold text-foreground"
            >
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
    </section>
  )
}
