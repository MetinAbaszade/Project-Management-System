'use client'

import { useState } from 'react'
import { createTeam } from '@/api/TeamAPI'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'

interface Props {
  projectId: string
  userRole: string
}

export function CreateTeamForm({ projectId, userRole }: Props) {
  const [form, setForm] = useState({
    Name: '',
    Description: '',
    ColorIndex: 0
  })
  const [loading, setLoading] = useState(false)

  const canCreate = userRole === 'Project Owner'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.Name) {
      toast.error('Team name is required.')
      return
    }

    setLoading(true)
    try {
      await createTeam({ ...form, ProjectId: projectId })
      toast.success('Team created.')
      setForm({ Name: '', Description: '', ColorIndex: 0 })
    } catch {
      toast.error('Failed to create team.')
    } finally {
      setLoading(false)
    }
  }

  if (!canCreate) return null

  return (
    <div className="space-y-4 p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md max-w-xl">
      <h3 className="text-base font-semibold">Create Team</h3>
      <Input
        name="Name"
        value={form.Name}
        onChange={handleChange}
        placeholder="Team Name"
      />
      <Input
        name="Description"
        value={form.Description}
        onChange={handleChange}
        placeholder="Description"
      />
      <Input
        type="number"
        name="ColorIndex"
        value={form.ColorIndex}
        onChange={handleChange}
        placeholder="Color Index (0–9)"
      />
      <Button onClick={handleSubmit} isLoading={loading}>
        Create Team
      </Button>
    </div>
  )
}
