'use client'

import { useState } from 'react'
import { markTaskComplete } from '@/api/TaskAPI'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'

interface Props {
  taskId: string
  userId: string
  assignedToUserId: string
  isCompleted: boolean
}

export function MarkTaskComplete({ taskId, userId, assignedToUserId, isCompleted }: Props) {
  const [loading, setLoading] = useState(false)

  const canMark = userId === assignedToUserId && !isCompleted

  const handleClick = async () => {
    setLoading(true)
    try {
      await markTaskComplete(taskId)
      toast.success('Task marked as complete.')
    } catch {
      toast.error('Failed to complete task.')
    } finally {
      setLoading(false)
    }
  }

  if (!canMark) return null

  return (
    <Button size="sm" onClick={handleClick} isLoading={loading}>
      Mark Complete
    </Button>
  )
}
