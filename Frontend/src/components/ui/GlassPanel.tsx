import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlassPanelProps {
  children: ReactNode
  className?: string
  blurStrength?: "sm" | "md" | "lg"
  padding?: "none" | "sm" | "md" | "lg"
  radius?: "sm" | "md" | "lg"
}

const blurClass = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-xl",
}

const paddingClass = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
}

const radiusClass = {
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
}

export function GlassPanel({
  children,
  className,
  blurStrength = "md",
  padding = "md",
  radius = "md",
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "bg-white/10 dark:bg-black/10 border border-white/10 shadow-lg transition-colors duration-300",
        blurClass[blurStrength],
        paddingClass[padding],
        radiusClass[radius],
        className
      )}
    >
      {children}
    </div>
  )
}
