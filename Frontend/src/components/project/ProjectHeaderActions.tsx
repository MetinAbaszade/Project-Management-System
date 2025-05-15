'use client'

import { FC } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DeleteProjectButton } from './DeleteProjectButton'

interface ProjectHeaderActionsProps {
  userId: string
  ownerId: string
  projectId: string
}

export const ProjectHeaderActions: FC<ProjectHeaderActionsProps> = ({
  userId,
  ownerId,
  projectId
}) => {
  const router = useRouter()

  if (userId !== ownerId) return null

  return (
    <div className="flex gap-2 mt-4">
      <Button size="sm" onClick={() => router.push(`/dashboard/projects/${projectId}/edit`)}>
        Edit Project
      </Button>
      <DeleteProjectButton projectId={projectId} />
    </div>
  )
}
