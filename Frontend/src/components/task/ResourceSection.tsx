// src/components/task/ResourceSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Edit,
  DollarSign,
  Loader2,
  Building,
  Users,
  ListChecks,
  BookOpen
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { getTaskResourceAssignments, deleteResourceAssignment } from '@/api/ResourceAPI';
import { getProjectResources } from '@/api/ResourceAPI';

interface ResourceSectionProps {
  taskId: string;
  projectId: string;
  isOwner: boolean;
}

export function ResourceSection({ taskId, projectId, isOwner }: ResourceSectionProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [projectResources, setProjectResources] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingResource, setAddingResource] = useState(false);
  const [removingResourceId, setRemovingResourceId] = useState<string | null>(null);
  
  // Form state
  const [form, setForm] = useState({
    resourceId: '',
    quantity: 1,
    estimatedCost: 0
  });
  
  // Fetch resources and task assignments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch resources assigned to the task
        const taskResources = await getTaskResourceAssignments(taskId);
        setResources(taskResources || []);
        
        // Fetch all project resources for the selection dropdown
        if (isOwner) {
          const availableResources = await getProjectResources(projectId);
          setProjectResources(availableResources || []);
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        // Fallback to local storage for demo
        const localResources = localStorage.getItem('task-resources');
        if (localResources) {
          try {
            const parsedResources = JSON.parse(localResources);
            const filteredResources = parsedResources.filter(r => r.taskId === taskId);
            setResources(filteredResources);
          } catch (e) {
            console.error('Failed to parse local storage resources:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [taskId, projectId, isOwner]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  
  // Get icon for resource type
  const getResourceTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'material':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'equipment':
        return <Building className="h-5 w-5 text-amber-500" />;
      case 'human':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'knowledge':
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      default:
        return <ListChecks className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  // Add a resource to the task
  const handleAddResource = async () => {
    if (!form.resourceId) {
      toast.error('Please select a resource');
      return;
    }
    
    if (form.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    
    setAddingResource(true);
    
    try {
      // In a real app, this would call the API
      // const response = await assignResourceToTask({
      //   TaskId: taskId,
      //   ResourceId: form.resourceId,
      //   Quantity: parseFloat(form.quantity.toString()),
      //   EstimatedCost: parseFloat(form.estimatedCost.toString())
      // });
      
      // For now, just simulate API call with local storage
      const selectedResource = projectResources.find(r => r.Id === form.resourceId);
      
      if (selectedResource) {
        const newResource = {
          id: `resource-${Date.now()}`,
          taskId: taskId,
          resourceId: form.resourceId,
          resourceName: selectedResource.Name,
          resourceType: selectedResource.Type,
          quantity: parseFloat(form.quantity.toString()),
          estimatedCost: parseFloat(form.estimatedCost.toString()),
          unit: selectedResource.Unit || 'unit',
          createdAt: new Date().toISOString()
        };
        
        // Add to state
        setResources(prev => [...prev, newResource]);
        
        // Also save to local storage for persistence
        const storedResources = localStorage.getItem('task-resources') || '[]';
        const parsedResources = JSON.parse(storedResources);
        parsedResources.push(newResource);
        localStorage.setItem('task-resources', JSON.stringify(parsedResources));
        
        // Reset form
        setForm({
          resourceId: '',
          quantity: 1,
          estimatedCost: 0
        });
        
        setShowAddForm(false);
        toast.success('Resource assigned to task');
      }
    } catch (error) {
      console.error('Failed to assign resource:', error);
      toast.error('Could not assign resource to task');
    } finally {
      setAddingResource(false);
    }
  };
  
  // Remove a resource from the task
  const handleRemoveResource = async (resourceId: string) => {
    setRemovingResourceId(resourceId);
    
    try {
      // In a real app, this would call the API
      // await deleteResourceAssignment(resourceId);
      
      // Remove from state
      setResources(prev => prev.filter(r => r.id !== resourceId));
      
      // Also remove from local storage
      const storedResources = localStorage.getItem('task-resources') || '[]';
      const parsedResources = JSON.parse(storedResources);
      const updatedResources = parsedResources.filter(r => r.id !== resourceId);
      localStorage.setItem('task-resources', JSON.stringify(updatedResources));
      
      toast.success('Resource removed from task');
    } catch (error) {
      console.error('Failed to remove resource:', error);
      toast.error('Could not remove resource from task');
    } finally {
      setRemovingResourceId(null);
    }
  };
  
  // Calculate total cost
  const getTotalCost = () => {
    return resources.reduce((total, resource) => total + (resource.estimatedCost || 0), 0);
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
          Resources
          {resources.length > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({resources.length})
            </span>
          )}
        </button>
        
        {isOwner && !showAddForm && projectResources.length > 0 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Assign Resource</span>
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
                  className="mb-4 p-4 border rounded-lg bg-card shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Assign Resource</h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-1 hover:bg-muted rounded-full"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="resourceId" className="block text-sm font-medium">
                        Resource <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="resourceId"
                        name="resourceId"
                        value={form.resourceId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                      >
                        <option value="">Select a resource...</option>
                        {projectResources.map(resource => (
                          <option key={resource.Id} value={resource.Id}>
                            {resource.Name} ({resource.Available} {resource.Unit || 'units'} available)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="quantity" className="block text-sm font-medium">
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={form.quantity}
                          onChange={handleChange}
                          min="1"
                          step="0.5"
                          className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="estimatedCost" className="block text-sm font-medium">
                          Estimated Cost
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <input
                            type="number"
                            id="estimatedCost"
                            name="estimatedCost"
                            value={form.estimatedCost}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                      disabled={addingResource}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddResource}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                      disabled={!form.resourceId || addingResource}
                    >
                      {addingResource ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Assigning...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Assign</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Loading resources...</span>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-8 border rounded-lg border-dashed border-muted-foreground/30">
                <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground">No resources assigned to this task</p>
                {isOwner && projectResources.length > 0 && !showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Assign Resource</span>
                  </button>
                )}
                {isOwner && projectResources.length === 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No resources available in this project. Create resources first.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {resources.map(resource => (
                      <motion.li
                        key={resource.id || resource.Id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 border rounded-lg bg-card shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-muted rounded-lg">
                              {getResourceTypeIcon(resource.resourceType || resource.Type)}
                            </div>
                            
                            <div>
                              <h4 className="font-medium">{resource.resourceName || resource.Resource?.Name}</h4>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1">
                                  {resource.quantity || resource.Quantity || 1} {resource.unit || resource.Resource?.Unit || 'units'}
                                </span>
                                
                                {(resource.estimatedCost > 0 || resource.EstimatedCost > 0) && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {resource.estimatedCost || resource.EstimatedCost || 0}
                                  </span>
                                )}
                                
                                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                  {resource.resourceType || resource.Resource?.Type || 'Resource'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {isOwner && (
                            <button
                              onClick={() => handleRemoveResource(resource.id || resource.Id)}
                              className="p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-md transition-colors"
                              disabled={removingResourceId === (resource.id || resource.Id)}
                            >
                              {removingResourceId === (resource.id || resource.Id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                              )}
                            </button>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                
                {/* Total cost summary */}
                {getTotalCost() > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Estimated Cost:</span>
                      <span className="font-semibold text-primary">${getTotalCost().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}