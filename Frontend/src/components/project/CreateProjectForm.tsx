'use client'

import { useState } from 'react'
import { createProject } from '@/api/project'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'

export function CreateProjectForm() {
  const [form, setForm] = useState({
    Name: '',
    Description: '',
    Deadline: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.Name) {
      toast.error('Project name is required.')
      return
    }

    setLoading(true)
    try {
      await createProject(form)
      toast.success('Project created.')
      setForm({ Name: '', Description: '', Deadline: '' })
    } catch {
      toast.error('Failed to create project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md max-w-xl">
      <h3 className="text-base font-semibold">Create Project</h3>
      <Input
        name="Name"
        value={form.Name}
        onChange={handleChange}
        placeholder="Project Name"
      />
      <textarea
        name="Description"
        value={form.Description}
        onChange={handleChange}
        placeholder="Description"
        rows={3}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
      <Input
        type="date"
        name="Deadline"
        value={form.Deadline}
        onChange={handleChange}
      />
      <Button onClick={handleSubmit} isLoading={loading}>
        Create Project
      </Button>
    </div>
  )
}
