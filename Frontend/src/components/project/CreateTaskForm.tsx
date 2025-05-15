'use client'

import { useState } from 'react'
import { createTask } from '@/api/TaskAPI'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'

interface Props {
  projectId: string
  teamId?: string
  userRole: string
}

export function CreateTaskForm({ projectId, teamId, userRole }: Props) {
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    Priority: 'Medium'
  })
  const [loading, setLoading] = useState(false)

  const canCreate = userRole === 'Project Owner' || userRole === 'Team Lead'

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.Title) {
      toast.error('Task title is required.')
      return
    }

    setLoading(true)
    try {
      await createTask({ ...form, ProjectId: projectId, TeamId: teamId })
      toast.success('Task created.')
      setForm({ Title: '', Description: '', Priority: 'Medium' })
    } catch {
      toast.error('Failed to create task.')
    } finally {
      setLoading(false)
    }
  }

  if (!canCreate) return null

  return (
    <div className="space-y-4 p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
      <h3 className="text-base font-semibold">Create Task</h3>
      <Input
        name="Title"
        value={form.Title}
        onChange={handleChange}
        placeholder="Task Title"
      />
      <textarea
        name="Description"
        value={form.Description}
        onChange={handleChange}
        placeholder="Description"
        rows={4}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
      <select
        name="Priority"
        value={form.Priority}
        onChange={handleChange}
        className="text-sm rounded-md px-3 py-2 border bg-background"
      >
        <option value="Low">Low Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="High">High Priority</option>
      </select>
      <Button onClick={handleSubmit} isLoading={loading}>
        Create Task
      </Button>
    </div>
  )
}
