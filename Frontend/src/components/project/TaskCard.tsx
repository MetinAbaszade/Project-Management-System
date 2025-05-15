'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: {
    Id: string
    Title: string
    Description?: string
    AssignedToUserId?: string | null
    AssignedToTeamId?: string | null
    Status?: string
  }
  userRole?: string 
  onClick: () => void
}

export function TaskCard({ task, userRole = 'member', onClick }: TaskCardProps) {
  const isTeamTask = !!task.AssignedToTeamId
  const canEdit = userRole === 'Project Owner' || userRole === 'Team Lead'

  return (
    <Card
      className={cn(
        'p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-sm space-y-2 transition-all hover:scale-[1.01]',
        'dark:bg-white/10 dark:border-white/20'
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">{task.Title}</h3>
        <Badge
          className={cn(
            'text-xs',
            task.Status === 'Completed' && 'bg-green-600',
            task.Status === 'In Progress' && 'bg-blue-600',
            task.Status === 'Not Started' && 'bg-zinc-600'
          )}
        >
          {task.Status || 'Not Started'}
        </Badge>
      </div>

      {task.Description && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {task.Description}
        </p>
      )}

      <div className="flex justify-between items-center pt-2">
        <Badge variant="outline" className="text-xs">
          {isTeamTask ? 'Assigned to Team' : 'Assigned to Member'}
        </Badge>

        {canEdit && (
          <Button variant="ghost" size="sm" className="text-xs">
            Manage
          </Button>
        )}
      </div>
    </Card>
  )
}