'use client'

import { FC } from 'react'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface TaskOverviewFilterProps {
  filters: {
    time: string
    priority: string
    projectId: string
    search: string
  }
  onChange: (updated: Partial<typeof filters>) => void
  projects: any[]
}

export const TaskOverviewFilter: FC<TaskOverviewFilterProps> = ({ filters, onChange, projects }) => {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs font-medium mb-1">Time</label>
        <Select value={filters.time} onValueChange={v => onChange({ time: v })}>
          <option value="all">All Time</option>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Priority</label>
        <Select value={filters.priority} onValueChange={v => onChange({ priority: v })}>
          <option value="all">All</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Project</label>
        <Select value={filters.projectId} onValueChange={v => onChange({ projectId: v })}>
          <option value="all">All</option>
          {projects.map(p => (
            <option key={p.Id} value={p.Id}>{p.Title}</option>
          ))}
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium mb-1">Search</label>
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={e => onChange({ search: e.target.value })}
        />
      </div>
    </div>
  )
}
