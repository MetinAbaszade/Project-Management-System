'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProject } from '@/api/ProjectAPI'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'
import { toast } from '@/lib/toast'

interface DeleteProjectButtonProps {
  projectId: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

export function DeleteProjectButton({ 
  projectId, 
  variant = 'default', 
  size = 'sm' 
}: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const confirmDelete = async () => {
    if (confirmText !== 'delete') return;
    
    setDeleting(true)
    try {
      await deleteProject(projectId)
      setOpen(false)
      toast.success('Project deleted successfully')
      router.push('/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast.error('Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        size={size}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-1.5" /> Delete
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this project?"
        description="This action cannot be undone. This will permanently delete the project and all associated data."
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Please type <strong className="text-foreground">delete</strong> to confirm deletion
          </p>
          
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type 'delete'"
            autoFocus
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleting || confirmText !== 'delete'}
          >
            {deleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </div>
      </Dialog>
    </>
  )
}