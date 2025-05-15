import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string
  name?: string
  size?: "sm" | "md" | "lg"
  className?: string
  shape?: "circle" | "square"
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
}

export function Avatar({
  src,
  name = "",
  size = "md",
  className,
  shape = "circle",
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-lg"

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center bg-muted text-foreground/70 ring-1 ring-muted shadow-sm overflow-hidden",
        sizeClasses[size],
        shapeClass,
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name || "User avatar"}
          fill
          className="object-cover"
        />
      ) : (
        <span className="z-10">{initials || "?"}</span>
      )}
    </div>
  )
}
