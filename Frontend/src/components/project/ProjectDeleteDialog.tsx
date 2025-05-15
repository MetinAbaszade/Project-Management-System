import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

import { deleteProject } from '@/api/ProjectAPI';
import { toast } from '@/lib/toast';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProjectDeleteDialogProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDeleteDialog({
  projectId,
  projectName,
  isOpen,
  onClose,
}: ProjectDeleteDialogProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'delete') return;

    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      toast.success('Project successfully deleted');
      router.push('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title="Delete Project"
      description={`This will permanently delete "${projectName}" and all associated data.`}
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Type <span className="font-bold">delete</span> to confirm.
        </div>

        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type 'delete' to confirm"
          className="mt-1"
          autoComplete="off"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== 'delete' || isDeleting}
            className="gap-1"
          >
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
