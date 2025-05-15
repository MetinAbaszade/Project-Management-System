import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

interface FormInputProps {
  label?: string
  icon?: ReactNode
  rightSlot?: ReactNode
  error?: string
  className?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  id?: string
}

export function FormInput({
  label,
  icon,
  rightSlot,
  error,
  id,
  className,
  inputProps = {},
}: FormInputProps) {
  const inputId = id || inputProps.id || undefined
  const hasLeft = !!icon
  const hasRight = !!rightSlot
  const hasError = !!error

  return (
    <div className={cn("w-full space-y-1", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {hasLeft && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        {hasRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightSlot}
          </div>
        )}
        <Input
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          className={cn(
            hasLeft && "pl-10",
            hasRight && "pr-10",
            hasError && "border-red-500 focus:ring-red-500"
          )}
          {...inputProps}
        />
      </div>

      {hasError && (
        <p id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
