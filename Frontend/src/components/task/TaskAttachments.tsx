"use client"

import { FC, useEffect, useState } from 'react'
import { getTaskAttachments, uploadTaskAttachment, deleteAttachment } from '@/api/TaskAPI'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TaskAttachmentsProps {
  taskId: string
}

export const TaskAttachments: FC<TaskAttachmentsProps> = ({ taskId }) => {
  const [attachments, setAttachments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    load()
  }, [taskId])

  const load = async () => {
    const data = await getTaskAttachments(taskId)
    setAttachments(data)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    await uploadTaskAttachment(taskId, file)
    await load()
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await deleteAttachment(id)
    await load()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Attachments</h3>
        <label className="text-sm font-medium cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={loading}
          />
          <span className={cn('text-primary underline', loading && 'opacity-50 cursor-wait')}>Upload</span>
        </label>
      </div>
      <ul className="text-sm space-y-1">
        {attachments.map(file => (
          <li key={file.Id} className="flex justify-between items-center">
            <a
              href={file.Url || file.url || file.FileUrl || '#'}
              className="truncate hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {file.FileName || file.name || 'Attachment'}
            </a>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(file.Id)}>🗑</Button>
          </li>
        ))}
        {attachments.length === 0 && <li className="text-muted-foreground">No attachments</li>}
      </ul>
    </div>
  )
}
