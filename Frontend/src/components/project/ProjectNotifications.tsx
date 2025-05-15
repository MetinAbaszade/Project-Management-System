'use client'

import { useEffect, useState } from 'react'
import { getNotificationsForProject } from '@/api/NotificationAPI'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/lib/toast'

interface Props {
  projectId: string
}

export function ProjectNotifications({ projectId }: Props) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getNotificationsForProject(projectId)
        setNotifications(res)
      } catch {
        toast.error('Failed to load notifications.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [projectId])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl w-full" />
        ))}
      </div>
    )
  }

  if (!notifications.length) {
    return <p className="text-sm text-muted-foreground">No notifications yet.</p>
  }

  return (
    <ul className="space-y-2">
      {notifications.map((n) => (
        <li
          key={n.Id}
          className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <p className="text-sm">{n.Content}</p>
          <p className="text-xs text-muted-foreground mt-1">{new Date(n.CreatedAt).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  )
}
