"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  size?: "sm" | "md" | "lg"
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
}: DialogProps) {
  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <AnimatePresence>
          {open && (
            <>
              <DialogPrimitive.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </DialogPrimitive.Overlay>

              <DialogPrimitive.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 16 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={cn(
                    "fixed left-1/2 top-1/2 z-50 w-full px-4 sm:px-0",
                    "-translate-x-1/2 -translate-y-1/2 rounded-xl bg-background shadow-xl sm:p-6 p-4",
                    sizeMap[size]
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      {title && (
                        <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                          {title}
                        </DialogPrimitive.Title>
                      )}
                      {description && (
                        <DialogPrimitive.Description className="text-sm text-muted-foreground">
                          {description}
                        </DialogPrimitive.Description>
                      )}
                    </div>
                    <DialogPrimitive.Close asChild>
                      <button
                        aria-label="Close dialog"
                        className="text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </DialogPrimitive.Close>
                  </div>

                  <div className="mt-4">{children}</div>
                </motion.div>
              </DialogPrimitive.Content>
            </>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
