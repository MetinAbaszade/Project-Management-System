'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProjectById, updateProject } from '@/api/ProjectAPI'
import { getProjectTasks } from '@/api/TaskAPI'
import { Tabs } from '@/components/ui/tabs'
import { ProjectScope } from '@/components/project/ProjectScope'
import { ProjectTeam } from '@/components/project/ProjectTeam'
import { ProjectStakeholders } from '@/components/project/ProjectStakeholders'
import { ProjectActivityLog } from '@/components/project/ProjectActivityLog'
import { ProjectAttachments } from '@/components/project/ProjectAttachments'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/hooks/useUser'
import { canEditProject, canCreateTask, canCompleteTask } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { CreateTaskForm } from '@/components/project/CreateTaskForm'
import { MarkTaskComplete } from '@/components/project/MarkTaskComplete'
import { ProjectTasks } from '@/components/project/ProjectTasks'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjectById(id as string)
        const taskData = await getProjectTasks(data.Id)
        setProject(data)
        setTasks(taskData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tab])

  const progress = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.Completed).length
    return total > 0 ? Math.floor((completed / total) * 100) : 0
  }, [tasks])

  const handleSaveProgress = async () => {
    if (project && project.Progress !== progress) {
      await updateProject(project.Id, { ...project, Progress: progress })
      setProject((prev: any) => ({ ...prev, Progress: progress }))
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!project) return <div className="p-6">Project not found.</div>

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Tasks', value: 'tasks' },
    { label: 'Team', value: 'team' },
    { label: 'Stakeholders', value: 'stakeholders' },
    { label: 'Scope', value: 'scope' },
    { label: 'Activity', value: 'activity' },
    { label: 'Files', value: 'attachments' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6 space-y-6"
    >
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{project.Name}</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl">{project.Description}</p>
          </div>
          {canEditProject(user, project) && (
            <Button size="sm" onClick={() => router.push(`/dashboard/projects/${project.Id}/edit`)}>
              Edit
            </Button>
          )}
        </div>
      </GlassPanel>

      <Tabs tabs={tabs} value={tab} onChange={setTab} fullWidth className="mt-4" />

      <div ref={contentRef} className="relative min-h-[360px]">
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              <GlassPanel className="p-4 text-muted-foreground">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p><strong>Progress:</strong> {progress}%</p>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  {canEditProject(user, project) && (
                    <Button size="sm" onClick={handleSaveProgress} disabled={progress === project.Progress}>
                      Save Progress
                    </Button>
                  )}
                </div>
                <p className="mt-4"><strong>Deadline:</strong> {project.Deadline ? new Date(project.Deadline).toLocaleDateString() : '—'}</p>
                <p><strong>Budget:</strong> ${project.TotalBudget?.toLocaleString()}</p>
              </GlassPanel>
            </motion.div>
          )}

          {tab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {canCreateTask(user, project) && (
                <div className="mb-4">
                  <CreateTaskForm projectId={project.Id} />
                </div>
              )}
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.Id} className="border rounded-xl p-4">
                    <div className="font-medium text-base">{task.Title}</div>
                    <p className="text-muted-foreground text-sm">{task.Description}</p>
                    {canCompleteTask(user, task) && !task.Completed && (
                      <div className="mt-2">
                        <MarkTaskComplete taskId={task.Id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'team' && (
            <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectTeam projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'stakeholders' && (
            <motion.div key="stakeholders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectStakeholders projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'scope' && (
            <motion.div key="scope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectScope projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectActivityLog projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'attachments' && (
            <motion.div key="attachments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectAttachments projectId={project.Id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
