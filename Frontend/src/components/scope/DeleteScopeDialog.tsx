import { useState } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/AlertDialog';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteScopeDialogProps {
  projectName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirmDelete: () => Promise<void>;
}

export function DeleteScopeDialog({ 
  projectName, 
  isOpen, 
  setIsOpen,
  onConfirmDelete
}: DeleteScopeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete();
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full dark:bg-red-900/20 dark:text-red-400"
                 style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}>
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Delete Project Scope</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to delete the entire scope for <span className="font-medium">{projectName}</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            disabled={isDeleting}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            style={{ backgroundColor: 'rgb(239, 68, 68)', borderColor: 'rgb(239, 68, 68)' }}
            className="hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Scope
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}