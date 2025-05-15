// src/components/project/ProjectAttachments.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { 
  getAttachmentsByEntityType, 
  uploadAttachment, 
  deleteAttachment 
} from '@/api/AttachmentAPI'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/lib/toast'
import { File, Paperclip, Plus, Trash2, Upload } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Attachment {
  Id: string;
  FileName: string;
  FileType: string;
  FileSize: number;
  FilePath: string;
  EntityType: string;
  EntityId: string;
  OwnerId: string;
  UploadedAt: string;
}

export function ProjectAttachments({ projectId }: { projectId: string }) {
  const { user } = useUser()
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // We're using 'Project' as the entity type for project-level attachments
  const entityType = 'Project'

  useEffect(() => {
    async function loadAttachments() {
      setLoading(true)
      try {
        const data = await getAttachmentsByEntityType(projectId, entityType)
        setAttachments(data)
      } catch (error) {
        console.error('Failed to load attachments:', error)
        toast.error('Failed to load attachments')
      } finally {
        setLoading(false)
      }
    }

    loadAttachments()
  }, [projectId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const file = files[0]
      const uploaded = await uploadAttachment(file, entityType, projectId, projectId)
      
      setAttachments(prev => [...prev, uploaded])
      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Failed to upload file:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (attachmentId: string) => {
    try {
      await deleteAttachment(attachmentId)
      setAttachments(prev => prev.filter(att => att.Id !== attachmentId))
      toast.success('File deleted successfully')
    } catch (error) {
      console.error('Failed to delete file:', error)
      toast.error('Failed to delete file')
    }
  }

  // Format file size for display
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <GlassPanel className="p-6">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Project Attachments</h2>
        
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" /> Uploading...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" /> Upload File
              </>
            )}
          </Button>
        </div>
      </div>

      {attachments.length === 0 ? (
        <EmptyState
          title="No attachments yet"
          description="Upload files related to this project to keep everything organized."
          icon={<Paperclip className="h-12 w-12" />}
          action={
            <Button onClick={() => fileInputRef.current?.click()}>
              Upload File
            </Button>
          }
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {attachments.map((attachment, index) => (
            <motion.div
              key={attachment.Id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-white/10 rounded-md text-primary">
                  <File className="h-6 w-6" />
                </div>
                
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{attachment.FileName}</p>
                  <div className="flex text-xs text-muted-foreground space-x-2">
                    <span>{formatFileSize(attachment.FileSize)}</span>
                    <span>•</span>
                    <span>{format(new Date(attachment.UploadedAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary"
                  onClick={() => window.open(attachment.FilePath, '_blank')}
                >
                  Download
                </Button>
                
                {/* Only creator or project owner can delete */}
                {(attachment.OwnerId === user?.Id || true) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(attachment.Id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </GlassPanel>
  )
}