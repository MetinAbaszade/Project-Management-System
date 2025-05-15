import { forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { LoaderCircle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90 shadow-md",
        outline: "border border-border bg-background hover:bg-muted text-foreground",
        ghost: "bg-transparent hover:bg-muted/70 text-foreground",
        subtle: "bg-muted text-foreground hover:bg-muted/80",
        destructive: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
      layout: {
        default: "",
        square: "aspect-square",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      layout: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      layout,
      isLoading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || isLoading

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, layout }), className)}
        aria-busy={isLoading}
        disabled={isDisabled}
        {...props}
      >
        <span className="relative flex items-center justify-center gap-2">
          {isLoading && (
            <LoaderCircle
              className="absolute left-0 mx-auto h-4 w-4 animate-spin text-current"
              aria-hidden="true"
            />
          )}
          <span className={cn("transition-opacity", isLoading && "opacity-0")}>
            {children}
          </span>
        </span>
      </Comp>
    )
  }
)

Button.displayName = "Button"
