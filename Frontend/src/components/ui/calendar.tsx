
'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { cn } from '@/lib/utils'

export interface CalendarProps {
  className?: string
  selected?: Date
  onSelect: (date?: Date) => void
  disabled?: boolean
  mode?: 'single' | 'multiple' | 'range'
}

export function Calendar({
  className,
  selected,
  onSelect,
  disabled,
  mode = 'single'
}: CalendarProps) {
  return (
    <DayPicker
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      className={cn('rounded-xl border bg-background p-4 shadow-sm', className)}
      modifiersClassNames={{
        selected: 'bg-primary text-primary-foreground',
        today: 'border border-accent'
      }}
      showOutsideDays
      classNames={{
        caption: 'flex justify-center py-2 font-medium',
        nav: 'flex items-center justify-between',
        head_row: 'flex text-xs text-muted-foreground',
        row: 'flex w-full mt-1',
        cell: 'w-9 h-9 flex items-center justify-center text-sm hover:bg-muted rounded-md transition-colors',
      }}
    />
  )
}
