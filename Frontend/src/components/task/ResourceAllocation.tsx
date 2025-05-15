// src/components/task/ResourceAllocation.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  User,
  Edit,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/lib/toast';

interface Resource {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  hours: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface ResourceAllocationProps {
  taskId: string;
  isOwner: boolean;
  projectMembers: any[];
}

export function ResourceAllocation({ taskId, isOwner, projectMembers = [] }: ResourceAllocationProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    userId: '',
    hours: 8,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: ''
  });
  
  // Load resources from local storage
  useEffect(() => {
    const storedResources = localStorage.getItem('task-resources');
    if (storedResources) {
      try {
        const allResources = JSON.parse(storedResources);
        const taskResources = allResources.filter(res => res.taskId === taskId);
        setResources(taskResources);
      } catch (error) {
        console.error('Failed to parse stored resources:', error);
      }
    }
  }, [taskId]);
  
  // Save resources to local storage
  const saveResources = (newResources: Resource[]) => {
    const storedResources = localStorage.getItem('task-resources');
    let allResources = [];
    
    if (storedResources) {
      try {
        allResources = JSON.parse(storedResources);
        // Filter out resources for this task
        allResources = allResources.filter(res => res.taskId !== taskId);
      } catch (error) {
        console.error('Failed to parse stored resources:', error);
      }
    }
    
    // Combine with new resources
    allResources = [...allResources, ...newResources];
    localStorage.setItem('task-resources', JSON.stringify(allResources));
    
    // Update state
    setResources(newResources);
  };
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  
  // Add a new resource
  const handleAddResource = () => {
    if (!form.userId) {
      toast.error('Please select a team member');
      return;
    }
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const member = projectMembers.find(m => m.UserId === form.userId);
      
      const newResource: Resource = {
        id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        taskId: taskId,
        userId: form.userId,
        userName: member?.User?.FirstName 
          ? `${member.User.FirstName} ${member.User.LastName || ''}`
          : `User ${form.userId.substring(0, 8)}`,
        hours: parseFloat(form.hours.toString()),
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        createdAt: new Date().toISOString()
      };
      
      const newResources = [...resources, newResource];
      saveResources(newResources);
      
      // Reset form
      setForm({
        userId: '',
        hours: 8,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: ''
      });
      
      setShowAddForm(false);
      setLoading(false);
      toast.success('Resource allocated successfully');
    }, 800);
  };
  
  // Update a resource
  const handleUpdateResource = (id: string) => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newResources = resources.map(res => {
        if (res.id === id) {
          return {
            ...res,
            hours: parseFloat(form.hours.toString()),
            startDate: form.startDate,
            endDate: form.endDate || undefined
          };
        }
        return res;
      });
      
      saveResources(newResources);
      setEditingResourceId(null);
      setLoading(false);
      toast.success('Resource updated');
    }, 800);
  };
  
  // Delete a resource
  const handleDeleteResource = (id: string) => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newResources = resources.filter(res => res.id !== id);
      saveResources(newResources);
      setLoading(false);
      toast.success('Resource allocation removed');
    }, 500);
  };
  
  // Start editing a resource
  const startEditing = (resource: Resource) => {
    setForm({
      userId: resource.userId,
      hours: resource.hours,
      startDate: resource.startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: resource.endDate || ''
    });
    
    setEditingResourceId(resource.id);
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
          Resource Allocation
        </button>
        
        {isOwner && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Allocate Resources</span>
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
          >
            {/* Add Resource Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-4 border rounded-lg bg-card"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Allocate Team Member</h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-1 hover:bg-muted rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label htmlFor="userId" className="block text-sm font-medium">
                        Team Member <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <select
                          id="userId"
                          name="userId"
                          value={form.userId}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                          required
                        >
                          <option value="">Select a team member...</option>
                          {projectMembers.length === 0 ? (
                            <option value="" disabled>No members available</option>
                          ) : (
                            projectMembers.map(member => (
                              <option key={member.UserId} value={member.UserId}>
                                {member.User?.FirstName 
                                  ? `${member.User.FirstName} ${member.User.LastName || ''}` 
                                  : `User ${member.UserId.substring(0, 8)}`}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="hours" className="block text-sm font-medium">
                        Hours Allocated
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          type="number"
                          id="hours"
                          name="hours"
                          value={form.hours}
                          onChange={handleChange}
                          min="1"
                          step="0.5"
                          className="w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label htmlFor="startDate" className="block text-sm font-medium">
                        Start Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={form.startDate}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="endDate" className="block text-sm font-medium">
                        End Date (Optional)
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={form.endDate}
                          onChange={handleChange}
                          min={form.startDate}
                          className="w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddResource}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                      disabled={!form.userId || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Allocating...</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          <span>Allocate</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {resources.length === 0 ? (
              <div className="text-center py-8 border rounded-lg border-dashed border-muted-foreground/30">
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground">No resources allocated yet</p>
                {isOwner && !showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Allocate Resources</span>
                  </button>
                )}
              </div>
            ) : (
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {resources.map((resource) => (
                    <motion.li
                      key={resource.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 border rounded-lg bg-card"
                    >
                      {editingResourceId === resource.id ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{resource.userName}</h4>
                            <button
                              onClick={() => setEditingResourceId(null)}
                              className="p-1 hover:bg-muted rounded-full"
                              disabled={loading}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label htmlFor="edit-hours" className="block text-sm font-medium">
                                Hours Allocated
                              </label>
                              <input
                                type="number"
                                id="edit-hours"
                                name="hours"
                                value={form.hours}
                                onChange={handleChange}
                                min="1"
                                step="0.5"
                                className="w-full px-3 py-1.5 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="edit-startDate" className="block text-sm font-medium">
                                Start Date
                              </label>
                              <input
                                type="date"
                                id="edit-startDate"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="edit-endDate" className="block text-sm font-medium">
                                End Date
                              </label>
                              <input
                                type="date"
                                id="edit-endDate"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                min={form.startDate}
                                className="w-full px-3 py-1.5 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleUpdateResource(resource.id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                              disabled={loading}
                            >
                             {loading ? (
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
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            
                            <div>
                              <h4 className="font-medium">{resource.userName}</h4>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {resource.hours} hours
                                </span>
                                
                                {resource.startDate && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    From: {format(new Date(resource.startDate), 'MMM d, yyyy')}
                                  </span>
                                )}
                                
                                {resource.endDate && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    To: {format(new Date(resource.endDate), 'MMM d, yyyy')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isOwner && (
                            <div className="flex items-center space-x-2 ml-2">
                              <button
                                onClick={() => startEditing(resource)}
                                className="p-1.5 hover:bg-muted rounded-md transition-colors"
                                disabled={loading}
                              >
                                <Edit className="h-4 w-4 text-muted-foreground" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteResource(resource.id)}
                                className="p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-md transition-colors"
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
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