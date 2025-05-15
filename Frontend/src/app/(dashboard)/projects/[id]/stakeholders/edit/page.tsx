'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Users,
  Percent,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectStakeholders, deleteStakeholder, updateStakeholder } from '@/api/StakeholderAPI';
import { getCurrentUser } from '@/api/UserAPI';

export default function EditStakeholdersPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [stakeholderToDelete, setStakeholderToDelete] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editPercentage, setEditPercentage] = useState<string>('');
  
  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingStakeholder, setDeletingStakeholder] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);

  // Fetch stakeholders and project data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch stakeholders and project data in parallel
        const [stakeholdersData, projectData] = await Promise.all([
          getProjectStakeholders(id as string),
          getProjectById(id as string)
        ]);
        
        setStakeholders(stakeholdersData);
        setProject(projectData);
        
        // Calculate total percentage
        const total = stakeholdersData.reduce((acc: number, curr: any) => acc + curr.Percentage, 0);
        setTotalPercentage(total);

        // Check if current user is the project owner
        const currentUser = getCurrentUser();
        setIsOwner(currentUser?.Id === projectData.OwnerId);
        
        // If not owner, redirect back
        if (currentUser?.Id !== projectData.OwnerId) {
          toast.error('Only project owners can edit stakeholders');
          router.push(`/projects/${id}/stakeholders`);
        }
      } catch (error) {
        console.error('Failed to load stakeholders data:', error);
        toast.error('Could not load stakeholders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, router]);

  // Handle delete stakeholder
  const handleDeleteStakeholder = async () => {
    if (!deletingStakeholder) return;
    
    setIsDeleting(true);
    try {
      await deleteStakeholder(deletingStakeholder.Id);
      
      // Update local state
      setStakeholders(prev => prev.filter(s => s.Id !== deletingStakeholder.Id));
      
      // Recalculate total percentage
      const updatedStakeholders = stakeholders.filter(s => s.Id !== deletingStakeholder.Id);
      const total = updatedStakeholders.reduce((acc, curr) => acc + curr.Percentage, 0);
      setTotalPercentage(total);
      
      toast.success('Stakeholder removed successfully');
    } catch (error) {
      console.error('Failed to delete stakeholder:', error);
      toast.error('Could not remove stakeholder');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeletingStakeholder(null);
    }
  };

  // Handle update stakeholder percentage
  const handleUpdatePercentage = async (stakeholderId: string) => {
    const percentage = parseInt(editPercentage);
    if (isNaN(percentage) || percentage < 1 || percentage > 100) {
      toast.error('Percentage must be between 1 and 100');
      return;
    }
    
    setIsEditing(true);
    try {
      await updateStakeholder(stakeholderId, { Percentage: percentage });
      
      // Update local state
      setStakeholders(prev => 
        prev.map(s => s.Id === stakeholderId ? { ...s, Percentage: percentage } : s)
      );
      
      // Recalculate total percentage
      const updatedStakeholders = stakeholders.map(s => 
        s.Id === stakeholderId ? { ...s, Percentage: percentage } : s
      );
      const total = updatedStakeholders.reduce((acc, curr) => acc + curr.Percentage, 0);
      setTotalPercentage(total);
      
      setEditMode(null);
      toast.success('Stakeholder updated successfully');
    } catch (error) {
      console.error('Failed to update stakeholder:', error);
      toast.error('Could not update stakeholder');
    } finally {
      setIsEditing(false);
    }
  };

  // Check if we're over 100%
  const isOverAllocated = totalPercentage > 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8 flex items-center">
          <motion.button
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push(`/projects/${id}/stakeholders`)}
            className="mr-4 p-2 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted transition-colors"
            aria-label="Back to stakeholders"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Stakeholders</h1>
            <p className="text-muted-foreground">
              {project?.Name || 'Loading project'}
            </p>
          </div>
        </div>
        
        {/* Allocation summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-card rounded-2xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Current Allocation
            </h2>
            <div className={cn(
              "text-sm font-medium px-3 py-1 rounded-full",
              isOverAllocated 
                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" 
                : totalPercentage === 100 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
            )}>
              {totalPercentage}% Allocated
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                isOverAllocated ? "bg-red-500" : 
                totalPercentage >= 80 ? "bg-amber-500" : 
                totalPercentage >= 50 ? "bg-yellow-500" : 
                "bg-green-500"
              )}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>
          
          {isOverAllocated && (
            <div className="flex items-center gap-2 mt-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Allocation exceeds 100%. Consider adjusting stakeholder percentages.
              </span>
            </div>
          )}
        </motion.div>
        
        {/* Stakeholders List */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : stakeholders.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted flex items-center justify-center rounded-full mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Stakeholders</h3>
            <p className="text-muted-foreground mb-6">
              This project doesn't have any stakeholders yet.
            </p>
            <button
              onClick={() => router.push(`/projects/${id}/stakeholders/create`)}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Add Stakeholder
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Stakeholders</h2>
              <p className="text-sm text-muted-foreground">
                Adjust percentages or remove stakeholders
              </p>
            </div>
            
            <ul>
              <AnimatePresence>
                {stakeholders.map((stakeholder, index) => (
                  <motion.li 
                    key={stakeholder.Id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "px-6 py-4 flex items-center justify-between",
                      index !== stakeholders.length - 1 && "border-b border-border"
                    )}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{stakeholder.UserId}</p>
                        <p className="text-sm text-muted-foreground">
                          Added on {new Date(stakeholder.CreatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {editMode === stakeholder.Id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editPercentage}
                            onChange={(e) => setEditPercentage(e.target.value)}
                            min="1"
                            max="100"
                            className="w-16 px-2 py-1 border border-border rounded bg-muted text-foreground"
                          />
                          <button
                            onClick={() => handleUpdatePercentage(stakeholder.Id)}
                            disabled={isEditing}
                            className="p-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditMode(null);
                              setEditPercentage('');
                            }}
                            className="p-1 rounded-full bg-muted hover:bg-muted/80"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setEditMode(stakeholder.Id);
                              setEditPercentage(stakeholder.Percentage.toString());
                            }}
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            {stakeholder.Percentage}%
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.2, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setDeletingStakeholder(stakeholder);
                              setShowDeleteDialog(true);
                            }}
                            className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
        
        {/* Add button */}
        <div className="mt-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/projects/${id}/stakeholders/create`)}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Add New Stakeholder
          </motion.button>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-xl"
          >
            <div className="mb-4 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 flex items-center justify-center rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Remove Stakeholder</h3>
              <p className="text-muted-foreground">
                Are you sure you want to remove this stakeholder? This action cannot be undone.
              </p>
            </div>
            
            {deletingStakeholder && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{deletingStakeholder.UserId}</p>
                <p className="text-sm text-muted-foreground">
                  Current allocation: {deletingStakeholder.Percentage}%
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingStakeholder(null);
                }}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStakeholder}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}