'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { v4 as uuidv4 } from 'uuid';

// Icons
import {
  ArrowLeft,
  UserPlus,
  Wrench,
  Box,
  Briefcase,
  TruckIcon,
  Table2,
  Package,
  Pencil,
  Trash2,
  FileText,
  FileUp,
  Download,
  ExternalLink,
  MoreHorizontal,
  Save,
  Clock,
  CalendarDays,
  LinkIcon,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Resource type mapping to icons
const resourceTypeIcons = {
  'Human': <UserPlus className="h-6 w-6 text-blue-500" />,
  'Equipment': <Wrench className="h-6 w-6 text-amber-500" />,
  'Material': <Box className="h-6 w-6 text-green-500" />,
  'Tool': <Briefcase className="h-6 w-6 text-purple-500" />,
  'Vehicle': <TruckIcon className="h-6 w-6 text-red-500" />,
  'Space': <Table2 className="h-6 w-6 text-indigo-500" />,
  'Other': <Package className="h-6 w-6 text-gray-500" />,
};

export default function ResourceDetailPage() {
  const { id: projectId, resourceId } = useParams();
  const router = useRouter();
  
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignQuantity, setAssignQuantity] = useState('1');
  const [errors, setErrors] = useState({});
  
  // Form state for editing
  const [formData, setFormData] = useState({
    Name: '',
    Type: '',
    Total: '',
    Available: '',
    Description: '',
    Unit: '',
  });
  
  // Ref for clicking outside of dropdown
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Load resource and tasks from localStorage
  useEffect(() => {
    setLoading(true);
    
    // Small delay to simulate loading
    const timer = setTimeout(() => {
      try {
        // Get resources from localStorage
        const storedResources = localStorage.getItem(`project_${projectId}_resources`);
        if (storedResources) {
          const resources = JSON.parse(storedResources);
          const foundResource = resources.find(r => r.Id === resourceId);
          
          if (foundResource) {
            setResource(foundResource);
            setFormData({
              Name: foundResource.Name || '',
              Type: foundResource.Type || '',
              Total: foundResource.Total !== null ? String(foundResource.Total) : '',
              Available: foundResource.Available !== null ? String(foundResource.Available) : '',
              Description: foundResource.Description || '',
              Unit: foundResource.Unit || '',
            });
          } else {
            toast.error("Resource not found");
            router.push(`/projects/${projectId}/resource`);
          }
        }
        
        // Get tasks from localStorage
        const storedTasks = localStorage.getItem(`project_${projectId}_tasks`);
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Error loading resource:", error);
        toast.error("Failed to load resource details");
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [projectId, resourceId, router]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Add file attachment
  const handleAddAttachment = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Create attachment objects
    const newAttachments = files.map(file => ({
      id: uuidv4(),
      name: file.name,
      size: file.size,
      type: file.type,
      // In a real app, we'd upload the file to a server or store it
      // Here we just create an object URL to simulate
      url: URL.createObjectURL(file)
    }));
    
    try {
      // Get existing resources from localStorage
      const storedResources = localStorage.getItem(`project_${projectId}_resources`);
      if (storedResources) {
        const resources = JSON.parse(storedResources);
        const resourceIndex = resources.findIndex(r => r.Id === resourceId);
        
        if (resourceIndex !== -1) {
          // Add attachments to resource
          resources[resourceIndex].Attachments = [
            ...(resources[resourceIndex].Attachments || []),
            ...newAttachments
          ];
          
          // Save back to localStorage
          localStorage.setItem(`project_${projectId}_resources`, JSON.stringify(resources));
          
          // Update state
          setResource(resources[resourceIndex]);
          
          toast.success(`Added ${files.length} attachment${files.length > 1 ? 's' : ''}`);
        }
      }
    } catch (error) {
      console.error("Error adding attachment:", error);
      toast.error("Failed to add attachment");
    }
  };
  
  // Remove an attachment
  const handleRemoveAttachment = (attachmentId) => {
    try {
      // Get existing resources from localStorage
      const storedResources = localStorage.getItem(`project_${projectId}_resources`);
      if (storedResources) {
        const resources = JSON.parse(storedResources);
        const resourceIndex = resources.findIndex(r => r.Id === resourceId);
        
        if (resourceIndex !== -1) {
          // Filter out the attachment
          resources[resourceIndex].Attachments = resources[resourceIndex].Attachments.filter(
            a => a.id !== attachmentId
          );
          
          // Save back to localStorage
          localStorage.setItem(`project_${projectId}_resources`, JSON.stringify(resources));
          
          // Update state
          setResource(resources[resourceIndex]);
          
          toast.success("Attachment removed");
        }
      }
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast.error("Failed to remove attachment");
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name.trim()) {
      newErrors.Name = 'Resource name is required';
    }
    
    if (!formData.Type) {
      newErrors.Type = 'Resource type is required';
    }
    
    if (formData.Total && isNaN(Number(formData.Total))) {
      newErrors.Total = 'Total must be a number';
    }
    
    if (formData.Available && isNaN(Number(formData.Available))) {
      newErrors.Available = 'Available must be a number';
    }
    
    if (formData.Total && formData.Available && 
        Number(formData.Available) > Number(formData.Total)) {
      newErrors.Available = 'Available cannot exceed total';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle save changes
  const handleSaveChanges = () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Get existing resources from localStorage
      const storedResources = localStorage.getItem(`project_${projectId}_resources`);
      if (storedResources) {
        const resources = JSON.parse(storedResources);
        const resourceIndex = resources.findIndex(r => r.Id === resourceId);
        
        if (resourceIndex !== -1) {
          // Update resource with form data
          resources[resourceIndex] = {
            ...resources[resourceIndex],
            Name: formData.Name.trim(),
            Type: formData.Type,
            Total: formData.Total ? Number(formData.Total) : null,
            Available: formData.Available ? Number(formData.Available) : null,
            Description: formData.Description.trim(),
            Unit: formData.Unit.trim(),
          };
          
          // Save back to localStorage
          localStorage.setItem(`project_${projectId}_resources`, JSON.stringify(resources));
          
          // Update state
          setResource(resources[resourceIndex]);
          setEditMode(false);
          
          toast.success("Resource updated successfully");
        }
      }
    } catch (error) {
      console.error("Error updating resource:", error);
      toast.error("Failed to update resource");
    }
  };
  
  // Handle delete resource
  const handleDeleteResource = () => {
    try {
      // Get existing resources from localStorage
      const storedResources = localStorage.getItem(`project_${projectId}_resources`);
      if (storedResources) {
        const resources = JSON.parse(storedResources);
        const updatedResources = resources.filter(r => r.Id !== resourceId);
        
        // Save back to localStorage
        localStorage.setItem(`project_${projectId}_resources`, JSON.stringify(updatedResources));
        
        toast.success("Resource deleted successfully");
        
        // Redirect to resource list
        router.push(`/projects/${projectId}/resource`);
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
      setShowDeleteDialog(false);
    }
  };
  
  // Handle assign resource to task
  const handleAssignResource = () => {
    if (!selectedTask) {
      setErrors({ task: 'Please select a task' });
      return;
    }
    
    if (!assignQuantity || isNaN(Number(assignQuantity)) || Number(assignQuantity) <= 0) {
      setErrors({ quantity: 'Please enter a valid quantity' });
      return;
    }
    
    try {
      // In a real app, you'd update the task with the resource assignment
      // Here we just show a success message
      toast.success(`Resource assigned to task successfully`);
      setShowAssignDialog(false);
      setSelectedTask('');
      setAssignQuantity('1');
      setErrors({});
    } catch (error) {
      console.error("Error assigning resource:", error);
      toast.error("Failed to assign resource to task");
    }
  };
  
  // Render resource icon based on type
  const renderResourceIcon = (type) => {
    return resourceTypeIcons[type] || resourceTypeIcons['Other'];
  };
  
  if (loading) {
    return <ResourceLoadingSkeleton projectId={projectId} />;
  }
  
  if (!resource) {
    return <ResourceNotFound projectId={projectId} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${projectId}`}>Project</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${projectId}/resource`}>Resources</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{resource.Name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              {renderResourceIcon(resource.Type)}
            </div>
            
            <div>
              <h1 className="text-2xl font-semibold">{resource.Name}</h1>
              <div className="text-muted-foreground mt-1 flex items-center gap-1">
                <span className="font-medium text-foreground">{resource.Type}</span>
                {resource.Unit && <span>• {resource.Unit}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(true)}
            >
              <LinkIcon className="h-4 w-4 mr-2" /> Assign to Task
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
            >
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
            
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setShowDropdown(prev => !prev)}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-popover border border-border z-50">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button 
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center"
                      onClick={() => {
                        setShowDropdown(false);
                        document.getElementById('file-upload').click();
                      }}
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Add Attachment
                    </button>
                    
                    <button 
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center"
                      onClick={() => {
                        setShowDropdown(false);
                        // Export functionality
                        toast.info('Export feature coming soon');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Details
                    </button>
                    
                    <DropdownMenuSeparator />
                    
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
                      onClick={() => {
                        setShowDropdown(false);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Resource
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
            
            {/* Hidden file input for attachments */}
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              onChange={handleAddAttachment}
            />
          </div>
        </div>
        
        {/* Resource content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Resource details */}
          <div className="lg:col-span-2 space-y-6">
            {editMode ? (
              <EditResourceForm
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                handleSaveChanges={handleSaveChanges}
                handleCancel={() => setEditMode(false)}
              />
            ) : (
              <>
                {/* Resource details */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-card rounded-xl p-6 shadow-sm border border-border"
                >
                  <h2 className="text-lg font-semibold mb-3">Description</h2>
                  <p className="text-card-foreground/80 whitespace-pre-wrap">
                    {resource.Description || "No description provided for this resource."}
                  </p>
                </motion.div>
                
                {/* Resource availability */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-sm border border-border"
                >
                  <h2 className="text-lg font-semibold mb-4">Availability</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Total</div>
                      <div className="text-3xl font-semibold flex items-baseline gap-2">
                        {resource.Total !== null ? resource.Total : "-"}
                        <span className="text-sm text-muted-foreground font-normal">
                          {resource.Unit || "Units"}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Available</div>
                      <div className="text-3xl font-semibold flex items-baseline gap-2">
                        {resource.Available !== null ? resource.Available : "-"}
                        <span className="text-sm text-muted-foreground font-normal">
                          {resource.Unit || "Units"}
                        </span>
                      </div>
                      
                      {resource.Total !== null && resource.Available !== null && (
                        <div className="mt-2">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${resource.Total > 0 ? (resource.Available / resource.Total) * 100 : 0}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className={cn(
                                "h-full rounded-full",
                                resource.Available === 0 ? "bg-red-500" : 
                                resource.Available < resource.Total * 0.2 ? "bg-amber-500" : 
                                "bg-green-500"
                              )}
                            />
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {resource.Available === 0 ? (
                              <span className="text-red-500">Out of stock</span>
                            ) : resource.Available < resource.Total * 0.2 ? (
                              <span className="text-amber-500">Low stock</span>
                            ) : (
                              <span className="text-green-500">In stock</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                
                {/* Resource tasks */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-card rounded-xl p-6 shadow-sm border border-border"
                >
                  <h2 className="text-lg font-semibold mb-4">Assigned Tasks</h2>
                  
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
                    <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground mb-3">No tasks have been assigned yet</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAssignDialog(true)}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" /> Assign to Task
                    </Button>
                  </div>
                </motion.div>
                
                {/* Resource attachments */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-card rounded-xl p-6 shadow-sm border border-border"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Attachments</h2>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <FileUp className="h-4 w-4 mr-2" /> Add Files
                    </Button>
                  </div>
                  
                  {resource.Attachments && resource.Attachments.length > 0 ? (
                    <div className="space-y-3">
                      {resource.Attachments.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-muted/50 p-3 rounded-md"
                        >
                          <div className="flex items-center overflow-hidden">
                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                              {file.type.includes('image') ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <FileText className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-medium text-sm truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB • Added {format(new Date(), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/80"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleRemoveAttachment(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
                      <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground mb-3">No attachments added yet</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        <FileUp className="h-4 w-4 mr-2" /> Add Files
                      </Button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
          
          {/* Right column - Resource sidebar */}
          <div className="space-y-6">
            {/* Resource info card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-card rounded-xl p-6 shadow-sm border border-border"
            >
              <h2 className="text-lg font-semibold mb-4">Resource Info</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resource ID</span>
                  <span className="text-sm font-mono">{resource.Id.substring(0, 8)}</span>
                </div>
                <div className="border-t border-border"></div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{resource.Type}</span>
                </div>
                <div className="border-t border-border"></div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(resource.CreatedAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="border-t border-border"></div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{format(new Date(), 'MMM d, yyyy')}</span>
                </div>
                <div className="border-t border-border"></div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn(
                    resource.Available === 0 ? "text-red-500" : 
                    resource.Available < resource.Total * 0.2 ? "text-amber-500" : 
                    "text-green-500"
                  )}>
                    {resource.Available === 0 ? "Out of stock" : 
                     resource.Available < resource.Total * 0.2 ? "Low stock" : 
                     "Available"}
                  </span>
                </div>
              </div>
            </motion.div>
            
            {/* Task assignment history card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-card rounded-xl p-6 shadow-sm border border-border"
            >
              <h2 className="text-lg font-semibold mb-4">Assignment History</h2>
              
              <div className="text-center py-8">
                <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground">No assignment history available</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resource? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              {renderResourceIcon(resource.Type)}
              <div>
                <div className="font-semibold">{resource.Name}</div>
                <div className="text-sm text-muted-foreground">{resource.Type}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteResource}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign to Task Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Task</DialogTitle>
            <DialogDescription>
              Assign this resource to a project task.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-select">Select Task</Label>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger id="task-select">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.length > 0 ? (
                    tasks.map(task => (
                      <SelectItem key={task.Id} value={task.Id}>
                        {task.Title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-tasks" disabled>
                      No tasks available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.task && <p className="text-sm text-red-500">{errors.task}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={assignQuantity}
                onChange={(e) => setAssignQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
              <div className="text-xs text-muted-foreground">
                {resource.Available !== null && (
                  <span>Available: {resource.Available} {resource.Unit || "Units"}</span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignResource}>
              <LinkIcon className="h-4 w-4 mr-2" /> Assign Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit Resource Form Component
function EditResourceForm({ formData, errors, handleChange, handleSaveChanges, handleCancel }) {
  // Resource type definitions
  const resourceTypes = [
    { id: 'Human', label: 'Human Resource', icon: <UserPlus className="h-5 w-5 text-blue-500" /> },
    { id: 'Equipment', label: 'Equipment', icon: <Wrench className="h-5 w-5 text-amber-500" /> },
    { id: 'Material', label: 'Material', icon: <Box className="h-5 w-5 text-green-500" /> },
    { id: 'Tool', label: 'Tool', icon: <Briefcase className="h-5 w-5 text-purple-500" /> },
    { id: 'Vehicle', label: 'Vehicle', icon: <TruckIcon className="h-5 w-5 text-red-500" /> },
    { id: 'Space', label: 'Space', icon: <Table2 className="h-5 w-5 text-indigo-500" /> },
    { id: 'Other', label: 'Other', icon: <Package className="h-5 w-5 text-gray-500" /> },
  ];

  return (
    <Card className="bg-card rounded-xl shadow-sm border border-border">
      <CardHeader>
        <CardTitle>Edit Resource</CardTitle>
        <CardDescription>
          Update the details of this resource.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resource Type Selection */}
        <div className="space-y-3">
          <Label htmlFor="resource-type">Resource Type <span className="text-red-500">*</span></Label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {resourceTypes.map(type => (
              <button
                key={type.id}
                type="button"
                className={cn(
                  "flex flex-col items-center p-4 rounded-lg border border-border transition-all",
                  formData.Type === type.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                )}
                onClick={() => {
                  handleChange({ target: { name: 'Type', value: type.id } });
                }}
              >
                {type.icon}
                <span className="mt-2 text-sm">{type.label}</span>
              </button>
            ))}
          </div>
          
          {errors.Type && <p className="text-sm text-red-500">{errors.Type}</p>}
        </div>
        
        {/* Resource Name */}
        <div className="space-y-3">
          <Label htmlFor="resource-name">Resource Name <span className="text-red-500">*</span></Label>
          <Input
            id="resource-name"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            placeholder="Enter resource name"
          />
          {errors.Name && <p className="text-sm text-red-500">{errors.Name}</p>}
        </div>
        
        {/* Resource Description */}
        <div className="space-y-3">
          <Label htmlFor="resource-description">Description</Label>
          <Textarea
            id="resource-description"
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            placeholder="Enter a description of this resource"
            rows={4}
          />
        </div>
        
        {/* Quantity Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <Label htmlFor="resource-total">Total Quantity</Label>
            <Input
              id="resource-total"
              name="Total"
              type="number"
              min="0"
              step="0.01"
              value={formData.Total}
              onChange={handleChange}
              placeholder="Total available"
            />
            {errors.Total && <p className="text-sm text-red-500">{errors.Total}</p>}
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="resource-available">Available Now</Label>
            <Input
              id="resource-available"
              name="Available"
              type="number"
              min="0"
              step="0.01"
              value={formData.Available}
              onChange={handleChange}
              placeholder="Currently available"
            />
            {errors.Available && <p className="text-sm text-red-500">{errors.Available}</p>}
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="resource-unit">Unit of Measure</Label>
            <Input
              id="resource-unit"
              name="Unit"
              value={formData.Unit}
              onChange={handleChange}
              placeholder="e.g., Hours, Pieces, Kg"
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
        >
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button type="button" onClick={handleSaveChanges}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

// Loading Skeleton Component
function ResourceLoadingSkeleton({ projectId }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6 animate-pulse">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-3 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-3 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="bg-muted h-12 w-12 rounded-lg" />
            <div>
              <div className="h-8 w-40 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-24 bg-muted rounded" />
            <div className="h-9 w-20 bg-muted rounded" />
            <div className="h-9 w-9 bg-muted rounded-full" />
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
              <div className="h-6 w-32 bg-muted rounded mb-4" />
              <div className="h-4 w-full bg-muted rounded mb-2" />
              <div className="h-4 w-3/4 bg-muted rounded mb-2" />
              <div className="h-4 w-5/6 bg-muted rounded" />
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
              <div className="h-6 w-32 bg-muted rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 w-16 bg-muted rounded mb-2" />
                  <div className="h-8 w-24 bg-muted rounded" />
                </div>
                <div>
                  <div className="h-4 w-20 bg-muted rounded mb-2" />
                  <div className="h-8 w-24 bg-muted rounded mb-2" />
                  <div className="h-2 w-full bg-muted rounded-full mt-4" />
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
              <div className="h-6 w-40 bg-muted rounded mb-4" />
              <div className="h-32 w-full bg-muted rounded" />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
              <div className="h-6 w-32 bg-muted rounded mb-4" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
                <div className="h-px w-full bg-muted" />
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="h-px w-full bg-muted" />
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="h-px w-full bg-muted" />
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
              <div className="h-6 w-40 bg-muted rounded mb-4" />
              <div className="h-32 w-full bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Resource Not Found Component
function ResourceNotFound({ projectId }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 py-12 bg-card rounded-xl shadow-sm border border-border text-center">
        <div className="bg-red-500/10 p-3 rounded-full inline-flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Resource Not Found</h1>
        <p className="text-muted-foreground mb-6">The resource you're looking for doesn't exist or has been deleted.</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/projects/${projectId}/resource`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Resources
            </Button>
          </Link>
          
          <Link href={`/projects/${projectId}/resource/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Create New Resource
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}