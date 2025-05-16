'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Edit,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { updateTask, deleteTask, createTask } from '@/api/TaskAPI';

interface TaskSubtasksProps {
  taskId: string;
  projectId: string;
  isOwner: boolean;
}

export function TaskSubtasks({ taskId, projectId, isOwner }: TaskSubtasksProps) {
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [processingSubtasks, setProcessingSubtasks] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    Priority: 'MEDIUM'
  });
  
  // Fetch subtasks
  useEffect(() => {
    const fetchSubtasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, try to get from local storage (temporary solution)
        const storedSubtasks = localStorage.getItem('task-subtasks');
        if (storedSubtasks) {
          try {
            const allSubtasks = JSON.parse(storedSubtasks);
            const taskSubtasks = allSubtasks.filter(sub => sub.ParentTaskId === taskId);
            setSubtasks(taskSubtasks);
          } catch (e) {
            console.error('Failed to parse stored subtasks:', e);
          }
        }

        // If API endpoint is implemented, fetch from API
        // const response = await api.get(`/tasks/${taskId}/subtasks`);
        // setSubtasks(response.data);
        
      } catch (err: any) {
        console.error('Error fetching subtasks:', err);
        setError('Failed to load subtasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubtasks();
  }, [taskId]);
  
  // Save subtasks to local storage
  const saveSubtasks = (newSubtasks: any[]) => {
    const storedSubtasks = localStorage.getItem('task-subtasks');
    let allSubtasks = [];
    
    if (storedSubtasks) {
      try {
        allSubtasks = JSON.parse(storedSubtasks);
        // Filter out subtasks for this task
        allSubtasks = allSubtasks.filter(sub => sub.ParentTaskId !== taskId);
      } catch (error) {
        console.error('Failed to parse stored subtasks:', error);
      }
    }
    
    // Combine with new subtasks
    allSubtasks = [...allSubtasks, ...newSubtasks];
    localStorage.setItem('task-subtasks', JSON.stringify(allSubtasks));
    
    // Update state
    setSubtasks(newSubtasks);
  };
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  
  // Add a new subtask
  const handleAddSubtask = async () => {
    if (!form.Title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    setShowAddForm(false);
    
    // First update local state for immediate feedback
    const newSubtask = {
      Id: `subtask-${Date.now()}`,
      Title: form.Title,
      Description: form.Description,
      Priority: form.Priority,
      Status: 'Not Started',
      ParentTaskId: taskId,
      ProjectId: projectId,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      Completed: false
    };
    
    const newSubtasks = [...subtasks, newSubtask];
    saveSubtasks(newSubtasks);
    
    // Reset form
    setForm({
      Title: '',
      Description: '',
      Priority: 'MEDIUM'
    });
    
    toast.success('Subtask added successfully');
    
    // If API endpoint is implemented, create subtask via API
    // try {
    //   const data = {
    //     Title: form.Title,
    //     Description: form.Description,
    //     Priority: form.Priority,
    //     Status: 'Not Started',
    //     ParentTaskId: taskId,
    //     ProjectId: projectId
    //   };
    //   
    //   const response = await createTask(data);
    //   
    //   // Update the ID with the real one from the API
    //   const updatedSubtasks = subtasks.map(st => 
    //     st.Id === newSubtask.Id ? { ...response.data } : st
    //   );
    //   
    //   saveSubtasks(updatedSubtasks);
    // } catch (error) {
    //   console.error('Failed to create subtask via API:', error);
    //   toast.error('Failed to save subtask to server');
    // }
  };
  
  // Update a subtask
  const handleUpdateSubtask = async (id: string) => {
    if (!form.Title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    setProcessingSubtasks(prev => ({ ...prev, [id]: 'updating' }));
    
    // Update local state first
    const updatedSubtasks = subtasks.map(subtask => {
      if (subtask.Id === id) {
        return {
          ...subtask,
          Title: form.Title,
          Description: form.Description,
          Priority: form.Priority,
          UpdatedAt: new Date().toISOString()
        };
      }
      return subtask;
    });
    
    saveSubtasks(updatedSubtasks);
    setEditingSubtaskId(null);
    
    // If API endpoint is implemented, update subtask via API
    // try {
    //   await updateTask(id, {
    //     Title: form.Title,
    //     Description: form.Description,
    //     Priority: form.Priority
    //   });
    // } catch (error) {
    //   console.error('Failed to update subtask via API:', error);
    //   toast.error('Failed to update subtask on server');
    // }
    
    setProcessingSubtasks(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    
    toast.success('Subtask updated successfully');
  };
  
  // Complete a subtask
  const handleCompleteSubtask = async (id: string) => {
    setProcessingSubtasks(prev => ({ ...prev, [id]: 'completing' }));
    
    // Update local state first
    const updatedSubtasks = subtasks.map(subtask => {
      if (subtask.Id === id) {
        return {
          ...subtask,
          Status: 'Completed',
          Completed: true,
          UpdatedAt: new Date().toISOString()
        };
      }
      return subtask;
    });
    
    saveSubtasks(updatedSubtasks);
    
    // If API endpoint is implemented, mark as complete via API
    // try {
    //   await markTaskComplete(id);
    // } catch (error) {
    //   console.error('Failed to complete subtask via API:', error);
    //   toast.error('Failed to mark subtask as complete on server');
    // }
    
    setProcessingSubtasks(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    
    toast.success('Subtask marked as complete');
  };
  
  // Delete a subtask
  const handleDeleteSubtask = async (id: string) => {
    setProcessingSubtasks(prev => ({ ...prev, [id]: 'deleting' }));
    
    // Update local state first
    const updatedSubtasks = subtasks.filter(subtask => subtask.Id !== id);
    saveSubtasks(updatedSubtasks);
    
    try {
      // Only attempt to delete if it's not a local-only ID (check if the ID starts with "subtask-")
      if (!id.startsWith('subtask-')) {
        await deleteTask(id);
      }
      toast.success('Subtask deleted successfully');
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      toast.error('Failed to delete subtask');
      
      // Restore the subtask if deletion failed
      if (!id.startsWith('subtask-')) {
        saveSubtasks([...updatedSubtasks, subtasks.find(st => st.Id === id)]);
      }
    } finally {
      setProcessingSubtasks(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };
  
  // Start editing a subtask
  const startEditing = (subtask: any) => {
    setForm({
      Title: subtask.Title,
      Description: subtask.Description || '',
      Priority: subtask.Priority || 'MEDIUM'
    });
    
    setEditingSubtaskId(subtask.Id);
  };

  // Get priority styling
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'LOW':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-lg font-semibold flex items-center"
        >
          {expanded ? (
            <ChevronDown className="h-5 w-5 mr-2" />
          ) : (
            <ChevronUp className="h-5 w-5 mr-2" />
          )}
          Subtasks
        </button>
        
        {isOwner && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Subtask</span>
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Add Subtask Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-4 border rounded-lg bg-card shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Add New Subtask</h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-1 hover:bg-muted rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="Title" className="block text-sm font-medium">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="Title"
                        name="Title"
                        value={form.Title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                        placeholder="Enter subtask title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="Description" className="block text-sm font-medium">
                        Description
                      </label>
                      <textarea
                        id="Description"
                        name="Description"
                        value={form.Description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                        placeholder="Enter description (optional)"
                      ></textarea>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="Priority" className="block text-sm font-medium">
                        Priority
                      </label>
                      <select
                        id="Priority"
                        name="Priority"
                        value={form.Priority}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSubtask}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Subtask</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Subtasks List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading subtasks...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 border rounded-lg border-dashed">
                <p className="text-muted-foreground">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-primary hover:underline text-sm"
                >
                  Try again
                </button>
              </div>
            ) : subtasks.length === 0 ? (
              <div className="text-center py-8 border rounded-lg border-dashed border-muted-foreground/30">
                <p className="text-muted-foreground">No subtasks yet</p>
                {isOwner && !showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Subtask</span>
                  </button>
                )}
              </div>
            ) : (
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {subtasks.map((subtask) => (
                    <motion.li
                      key={subtask.Id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 border rounded-lg bg-card shadow-sm"
                    >
                      {editingSubtaskId === subtask.Id ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Edit Subtask</h4>
                            <button
                              onClick={() => setEditingSubtaskId(null)}
                              className="p-1 hover:bg-muted rounded-full"
                              disabled={processingSubtasks[subtask.Id]}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label htmlFor="edit-title" className="block text-sm font-medium">
                                Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="edit-title"
                                name="Title"
                                value={form.Title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="edit-description" className="block text-sm font-medium">
                                Description
                              </label>
                              <textarea
                                id="edit-description"
                                name="Description"
                                value={form.Description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                              ></textarea>
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="edit-priority" className="block text-sm font-medium">
                                Priority
                              </label>
                              <select
                                id="edit-priority"
                                name="Priority"
                                value={form.Priority}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleUpdateSubtask(subtask.Id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors shadow-sm"
                              disabled={processingSubtasks[subtask.Id] === 'updating'}
                            >
                             {processingSubtasks[subtask.Id] === 'updating' ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-1" />
                                  <span>Save Changes</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between">
                            <div className={`${subtask.Completed ? 'opacity-50' : ''}`}>
                              <h4 className={`font-medium ${subtask.Completed ? 'line-through' : ''}`}>
                                {subtask.Title}
                              </h4>
                              
                              {subtask.Description && (
                                <p className="mt-1 text-muted-foreground text-sm">
                                  {subtask.Description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityStyles(subtask.Priority)}`}>
                                  {subtask.Priority} Priority
                                </span>
                                
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  subtask.Completed || subtask.Status === 'Completed'
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    : subtask.Status === 'In Progress'
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                  {subtask.Completed ? 'Completed' : subtask.Status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-2">
                              {!subtask.Completed && isOwner && (
                                <button
                                  onClick={() => handleCompleteSubtask(subtask.Id)}
                                  className="p-1.5 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400 rounded-md transition-colors"
                                  disabled={processingSubtasks[subtask.Id]}
                                >
                                  {processingSubtasks[subtask.Id] === 'completing' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                              
                              {isOwner && (
                                <>
                                  <button
                                    onClick={() => startEditing(subtask)}
                                    className="p-1.5 hover:bg-muted rounded-md transition-colors"
                                    disabled={processingSubtasks[subtask.Id]}
                                  >
                                    <Edit className="h-4 w-4 text-blue-500" />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteSubtask(subtask.Id)}
                                    className="p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-md transition-colors"
                                    disabled={processingSubtasks[subtask.Id]}
                                  >
                                    {processingSubtasks[subtask.Id] === 'deleting' ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}