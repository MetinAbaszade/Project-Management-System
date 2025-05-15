"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { ButtonHTMLAttributes, ReactNode } from "react"

interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  label?: string
}

export function Fab({
  icon = <Plus className="h-6 w-6" />,
  label = "Create",
  className,
  ...props
}: FabProps) {
  return (
    <motion.button
      type="button"
      role="button"
      aria-label={label}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none transition-all active:scale-95",
        "after:absolute after:inset-0 after:rounded-full after:animate-ping after:bg-primary/20 after:z-[-1]",
        className
      )}
      {...props}
    >
      {icon}
    </motion.button>
  )
}
