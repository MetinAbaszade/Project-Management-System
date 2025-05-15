'use client'

import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { getProjectTeams, getProjectMembers } from '@/api/ProjectAPI'
import { getTaskAttachments, uploadTaskAttachment } from '@/api/TaskAPI'
import { useUser } from '@/hooks/useUser'
import { Paperclip, Plus, Trash2 } from 'lucide-react'
import { DatePicker } from '@/components/ui/DatePicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Tabs } from '@/components/ui/tabs'
import { toast } from '@/lib/toast'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  onDelete?: () => void
  projectId: string
  task?: any
}

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  projectId,
  task,
}: TaskDialogProps) {
  const { user } = useUser() // ✅ FIXED

  const [teams, setTeams] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    Title: '',
    Description: '',
    Priority: 'MEDIUM',
    Status: 'Not Started',
    TeamId: '',
    UserId: '',
    Deadline: null as Date | null,
  })

  useEffect(() => {
    if (task) {
      setForm({
        Title: task.Title || '',
        Description: task.Description || '',
        Priority: task.Priority || 'MEDIUM',
        Status: task.Status || 'Not Started',
        TeamId: task.TeamId || '',
        UserId: task.UserId || '',
        Deadline: task.Deadline ? new Date(task.Deadline) : null,
      })
    } else {
      setForm({
        Title: '',
        Description: '',
        Priority: 'MEDIUM',
        Status: 'Not Started',
        TeamId: '',
        UserId: '',
        Deadline: null,
      })
    }
  }, [task])

  useEffect(() => {
    if (open && projectId) {
      async function fetchData() {
        try {
          const [teamsData, membersData] = await Promise.all([
            getProjectTeams(projectId),
            getProjectMembers(projectId),
          ])
          setTeams(teamsData)
          setMembers(membersData)

          if (task?.Id) {
            const attachmentsData = await getTaskAttachments(task.Id)
            setAttachments(attachmentsData)
          }
        } catch (error) {
          console.error('Failed to load task dialog data:', error)
          toast.error('Failed to load data')
        }
      }

      fetchData()
    }
  }, [open, projectId, task?.Id])

  const handleSubmit = async () => {
    if (!form.Title.trim()) {
      toast.error('Task title is required')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        ...form,
        Deadline: form.Deadline ? form.Deadline.toISOString() : undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !task?.Id) return

    setUploading(true)
    try {
      const newAttachment = await uploadTaskAttachment(task.Id, file)
      setAttachments(prev => [...prev, newAttachment])
      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Failed to upload file:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const priorityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
  ]

  const statusOptions = [
    { label: 'Not Started', value: 'Not Started' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
  ]

  const teamOptions = [
    { label: 'Not Assigned', value: '' },
    ...teams.map(team => ({ label: team.Name, value: team.Id })),
  ]

  const memberOptions = [
    { label: 'Not Assigned', value: '' },
    ...members.map(member => ({
      label: `${member.User?.FirstName || ''} ${member.User?.LastName || ''}`,
      value: member.UserId,
    })),
  ]

  const tabs = [
    { label: 'Details', value: 'details' },
    { label: 'Attachments', value: 'attachments' },
    { label: 'Comments', value: 'comments' },
  ]

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={task ? 'Edit Task' : 'Create Task'}
      description={task ? 'Update task details' : 'Add a new task to this project'}
      size="lg"
    >
      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="mb-4" />

      {activeTab === 'details' && (
        <div className="space-y-4">
          <Input
            placeholder="Task Title"
            value={form.Title}
            onChange={e => setForm({ ...form, Title: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={form.Description}
            onChange={e => setForm({ ...form, Description: e.target.value })}
            rows={3}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dropdown
              value={form.Priority}
              onChange={v => setForm({ ...form, Priority: v })}
              items={priorityOptions}
              trigger={
                <Button variant="outline" className="w-full justify-between">
                  {priorityOptions.find(o => o.value === form.Priority)?.label}
                  <span className="opacity-50">▼</span>
                </Button>
              }
            />
            <Dropdown
              value={form.Status}
              onChange={v => setForm({ ...form, Status: v })}
              items={statusOptions}
              trigger={
                <Button variant="outline" className="w-full justify-between">
                  {statusOptions.find(o => o.value === form.Status)?.label}
                  <span className="opacity-50">▼</span>
                </Button>
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dropdown
              value={form.TeamId}
              onChange={v => setForm({ ...form, TeamId: v, UserId: '' })}
              items={teamOptions}
              trigger={
                <Button variant="outline" className="w-full justify-between">
                  {teamOptions.find(o => o.value === form.TeamId)?.label}
                  <span className="opacity-50">▼</span>
                </Button>
              }
            />
            <Dropdown
              value={form.UserId}
              onChange={v => setForm({ ...form, UserId: v, TeamId: '' })}
              items={memberOptions}
              trigger={
                <Button variant="outline" className="w-full justify-between">
                  {memberOptions.find(o => o.value === form.UserId)?.label}
                  <span className="opacity-50">▼</span>
                </Button>
              }
            />
          </div>
          <DatePicker
            date={form.Deadline}
            onDateChange={d => setForm({ ...form, Deadline: d })}
            displayFormat="PPP"
            placeholder="Set deadline (optional)"
          />
        </div>
      )}

      {activeTab === 'attachments' && task && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Attachments</h3>
            <label className="cursor-pointer">
              <Input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              <Button size="sm" variant="outline" disabled={uploading}>
                <Plus className="h-4 w-4 mr-1" />
                Add file
              </Button>
            </label>
          </div>
          {attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attachments yet.</p>
          ) : (
            <div className="space-y-2">
              {attachments.map(att => (
                <div key={att.Id} className="flex items-center justify-between border rounded-md p-2">
                  <div className="flex items-center">
                    <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{att.FileName}</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && task && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Comments</h3>
          <p className="text-sm text-muted-foreground">Comments functionality coming soon.</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        {onDelete && (
          <Button variant="destructive" onClick={handleDelete} disabled={loading || deleting}>
            {deleting ? 'Deleting...' : 'Delete Task'}
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading || deleting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || deleting}>
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
