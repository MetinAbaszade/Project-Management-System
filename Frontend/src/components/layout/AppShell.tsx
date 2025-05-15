'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed] = useLocalStorage('sidebar-collapsed', false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-background/90 text-foreground transition-colors duration-500">
      <Sidebar />

      <div className="flex flex-col flex-1 min-h-screen transition-all duration-200 ease-out">
        <Topbar />

        <motion.main
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="p-4 sm:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
