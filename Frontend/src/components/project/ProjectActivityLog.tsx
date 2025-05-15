'use client'

import { useEffect, useState } from 'react'
import { getProjectActivityLog, ActivityLog } from '@/api/ActivityAPI'
import { useSession } from 'next-auth/react'

export function ProjectActivityLog({ projectId }: { projectId: string }) {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const res = await getProjectActivityLog(projectId)
      setLogs(res)
      setLoading(false)
    }
    load()
  }, [projectId])

  if (loading) return <p className="text-sm text-muted-foreground">Loading activity...</p>
  if (logs.length === 0) return <p className="text-sm text-muted-foreground">No activity found.</p>

  return (
    <div className="mt-4 space-y-4">
      {logs.map((log) => (
        <div key={log.Id} className="border-l-2 border-muted pl-4 py-2">
          <p className="text-sm text-foreground">
            <span className="font-medium">{log.Action}</span>{' '}
            on <span className="text-muted-foreground">{log.EntityType}</span>
            {log.Details && <> — <span className="italic">{log.Details}</span></>}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(log.Timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
