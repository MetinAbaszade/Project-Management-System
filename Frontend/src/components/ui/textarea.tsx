
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  resize?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, resize = true, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
        !resize && 'resize-none',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'
