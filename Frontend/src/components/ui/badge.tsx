import { cn } from "@/lib/utils"
import { HTMLAttributes, ReactNode } from "react"

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "danger" | "warning" | "info" | "ghost"
  icon?: ReactNode
}

const variantClasses = {
  default: "bg-muted text-foreground",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  ghost: "bg-transparent text-muted-foreground ring-1 ring-muted-foreground/20",
}

export function Badge({
  className,
  variant = "default",
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className
      )}
      role="status"
      {...props}
    >
      {icon && <span className="inline-block">{icon}</span>}
      {children}
    </div>
  )
}
