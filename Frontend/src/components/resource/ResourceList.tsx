// src/components/resource/ResourceList.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  Filter,
  Users,
  Building,
  BookOpen,
  ListChecks,
  Plus
} from 'lucide-react';
import { deleteResource } from '@/api/ResourceAPI';
import { ResourceDialog } from './ResourceDialog';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface ResourceListProps {
  resources: any[];
  projectId: string;
  isOwner: boolean;
  onResourcesChange?: () => void;
}

export function ResourceList({ resources, projectId, isOwner, onResourcesChange }: ResourceListProps) {
  const [processingResources, setProcessingResources] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [resourceBeingDeleted, setResourceBeingDeleted] = useState<string | null>(null);

  // Get icon based on resource type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Material':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'Equipment':
        return <Building className="h-5 w-5 text-amber-500" />;
      case 'Human':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'Knowledge':
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      default:
        return <ListChecks className="h-5 w-5 text-gray-500" />;
    }
  };

  // Handle resource deletion
  const handleDeleteResource = async (resourceId: string) => {
    if (processingResources[resourceId]) return;
    
    setResourceBeingDeleted(resourceId);
    setProcessingResources(prev => ({ ...prev, [resourceId]: 'deleting' }));
    
    try {
      await deleteResource(resourceId);
      
      toast.success('Resource deleted successfully');
      
      if (onResourcesChange) {
        onResourcesChange();
      }
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast.error('Could not delete resource');
    } finally {
      setProcessingResources(prev => {
        const updated = { ...prev };
        delete updated[resourceId];
        return updated;
      });
      
      setConfirmDelete(null);
      setResourceBeingDeleted(null);
    }
  };

  // Handle resource dialog success
  const handleResourceDialogSuccess = (updatedData?: any) => {
    if (onResourcesChange) {
      onResourcesChange();
    }
    
    setEditingResource(null);
    setIsCreateDialogOpen(false);
  };

  // Handle resource edit
  const handleEditResource = (resource: any) => {
    setEditingResource(resource);
  };

  // Get badge styles based on availability
  const getAvailabilityBadgeStyles = (total: number, available: number) => {
    const ratio = available / (total || 1);
    
    if (ratio === 0) {
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    } else if (ratio < 0.3) {
      return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
    } else {
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  // Empty state
  if (resources.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Filter className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Resources Found</h3>
        <p className="mb-6 text-muted-foreground">
          This project doesn't have any resources yet.
        </p>
        {isOwner && (
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Resource list */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Resources</h2>
          {isOwner && (
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Resource</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {resources.map((resource) => (
              <motion.div
                key={resource.Id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "border rounded-lg p-4 bg-card shadow-sm",
                  processingResources[resource.Id] ? 'opacity-70 pointer-events-none' : ''
                )}
              >
                <div className="flex justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {getTypeIcon(resource.Type)}
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{resource.Name}</h3>
                      
                      {resource.Description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {resource.Description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          {resource.Type}
                        </span>
                        
                        {resource.Unit && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            Unit: {resource.Unit}
                          </span>
                        )}
                        
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getAvailabilityBadgeStyles(resource.Total, resource.Available)}`}>
                          {resource.Available} / {resource.Total} available
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isOwner && (
                    <div className="flex items-start space-x-1">
                      <button
                        onClick={() => handleEditResource(resource)}
                        className="p-1.5 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-md transition-colors"
                        aria-label="Edit resource"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => setConfirmDelete(resource.Id)}
                        className="p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-md transition-colors"
                        aria-label="Delete resource"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Resource Dialog */}
      {editingResource && (
        <ResourceDialog
          isOpen={true}
          onClose={() => setEditingResource(null)}
          projectId={projectId}
          resource={editingResource}
          onSuccess={handleResourceDialogSuccess}
        />
      )}

      {/* Create Resource Dialog */}
      <ResourceDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        projectId={projectId}
        onSuccess={handleResourceDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !resourceBeingDeleted && setConfirmDelete(null)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg relative z-10"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">Delete Resource</h3>
            <p className="mb-6 text-muted-foreground text-center">
              Are you sure you want to delete this resource? This action cannot be undone.
            </p>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => !resourceBeingDeleted && setConfirmDelete(null)}
                className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                disabled={!!resourceBeingDeleted}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteResource(confirmDelete)}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm flex items-center"
                disabled={!!resourceBeingDeleted}
              >
                {resourceBeingDeleted ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}