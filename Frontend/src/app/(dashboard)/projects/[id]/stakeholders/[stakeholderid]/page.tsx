'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Calendar,
  Percent,
  PieChart,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { format } from 'date-fns';

// API imports
import { getStakeholderById, updateStakeholder, deleteStakeholder } from '@/api/StakeholderAPI';
import { getProjectById } from '@/api/ProjectAPI';
import { getCurrentUser } from '@/api/UserAPI';

export default function StakeholderDetailPage() {
  const { stakeholderId } = useParams();
  const router = useRouter();
  const [stakeholder, setStakeholder] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editPercentage, setEditPercentage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch stakeholder and project data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch stakeholder details
        const stakeholderData = await getStakeholderById(stakeholderId as string);
        setStakeholder(stakeholderData);
        
        // Initialize edit percentage
        setEditPercentage(stakeholderData.Percentage.toString());
        
        // Fetch associated project
        const projectData = await getProjectById(stakeholderData.ProjectId);
        setProject(projectData);
        
        // Check if current user is the project owner
        const currentUser = getCurrentUser();
        setIsOwner(currentUser?.Id === projectData.OwnerId);
      } catch (error) {
        console.error('Failed to load stakeholder data:', error);
        toast.error('Could not load stakeholder details');
      } finally {
        setLoading(false);
      }
    };
    
    if (stakeholderId) {
      fetchData();
    }
  }, [stakeholderId]);

  // Handle update stakeholder
  const handleUpdateStakeholder = async () => {
    const percentage = parseInt(editPercentage);
    if (isNaN(percentage) || percentage < 1 || percentage > 100) {
      toast.error('Percentage must be between 1 and 100');
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateStakeholder(stakeholderId as string, { Percentage: percentage });
      
      // Update local state
      setStakeholder(prev => ({ ...prev, Percentage: percentage }));
      setIsEditing(false);
      toast.success('Stakeholder updated successfully');
    } catch (error) {
      console.error('Failed to update stakeholder:', error);
      toast.error('Could not update stakeholder');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete stakeholder
  const handleDeleteStakeholder = async () => {
    setIsDeleting(true);
    try {
      await deleteStakeholder(stakeholderId as string);
      toast.success('Stakeholder removed successfully');
      
      // Redirect back to stakeholders list
      router.push(`/projects/${stakeholder.ProjectId}/stakeholders`);
    } catch (error) {
      console.error('Failed to delete stakeholder:', error);
      toast.error('Could not remove stakeholder');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stakeholder || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="bg-card rounded-2xl border border-border p-8 max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Stakeholder Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the stakeholder you're looking for. It may have been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8 flex items-center">
          <button
            onClick={() => router.push(`/projects/${stakeholder.ProjectId}/stakeholders`)}
            className="mr-4 p-2 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted transition-colors"
            aria-label="Back to stakeholders"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Stakeholder Details</h1>
            <p className="text-muted-foreground">
              {project?.Name || 'Loading project'}
            </p>
          </div>
        </div>
        
        {/* Stakeholder Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm mb-6"
        >
          <div className="h-2 w-full bg-gradient-to-r from-primary to-primary-dark"></div>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{stakeholder.UserId}</h2>
                  <p className="text-muted-foreground">Stakeholder ID: {stakeholder.Id.substring(0, 8)}...</p>
                </div>
              </div>
              
              {isOwner && (
                <div className="flex gap-2">
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit className="h-5 w-5 text-primary" />
              </motion.button>
              <motion.button
                onClick={() => setShowDeleteDialog(true)}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="h-5 w-5" />
              </motion.button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-muted/40 p-4 rounded-xl flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created On</p>
                  <p className="font-medium">
                    {format(new Date(stakeholder.CreatedAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/40 p-4 rounded-xl flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(stakeholder.UpdatedAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/40 p-6 rounded-xl mb-6 relative overflow-hidden">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Ownership Stake
              </h3>
              
              {isEditing ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
                  <div className="w-full sm:w-48">
                    <label htmlFor="percentage" className="block text-sm font-medium text-muted-foreground mb-1">
                      Percentage (1-100)
                    </label>
                    <input
                      type="number"
                      id="percentage"
                      value={editPercentage}
                      onChange={(e) => setEditPercentage(e.target.value)}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg"
                    />
                  </div>
                  
                  <div className="flex gap-2 sm:self-end">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditPercentage(stakeholder.Percentage.toString());
                      }}
                      className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateStakeholder}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-4xl font-bold text-primary">
                    {stakeholder.Percentage}%
                  </div>
                  <p className="text-muted-foreground mb-4">
                    This stakeholder owns {stakeholder.Percentage}% of the project.
                  </p>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full"
                style={{ width: `${stakeholder.Percentage}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${stakeholder.Percentage}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-muted/40 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Project Details</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Project Name</p>
                  <p className="font-medium">{project.Name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Project Owner</p>
                  <p className="font-medium">{project.OwnerId}</p>
                </div>
                
                {project.Deadline && (
                  <div>
                    <p className="text-sm text-muted-foreground">Project Deadline</p>
                    <p className="font-medium">
                      {format(new Date(project.Deadline), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <motion.button
                onClick={() => router.push(`/projects/${project.Id}`)}
                className="px-4 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2"
                whileHover={{ scale: 1.05, x: 3 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>View Project Details</span>
              </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
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
            
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="font-medium">{stakeholder.UserId}</p>
              <p className="text-sm text-muted-foreground">
                Current allocation: {stakeholder.Percentage}%
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
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