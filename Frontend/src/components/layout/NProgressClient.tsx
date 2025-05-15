'use client'

import { ReactNode } from 'react'
import { useNProgress } from '@/hooks/useNProgress'

interface NProgressClientProps {
  children: ReactNode
}

export function NProgressClient({ children }: NProgressClientProps) {
  useNProgress()
  return <>{children}</>
}
