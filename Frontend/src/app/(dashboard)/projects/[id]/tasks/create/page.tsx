'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

// Icons
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronsRight,
  Clock,
  CreditCard,
  DollarSign,
  Flame,
  Flag,
  HelpCircle,
  Info,
  ListChecks,
  Loader2,
  Package,
  Plus,
  Send,
  User,
  Users,
  X,
  Edit,
} from 'lucide-react';

// API
import { getProjectById, getProjectTeams, getProjectMembers } from '@/api/ProjectAPI';
import { createTask } from '@/api/TaskAPI';
import { getProjectResources, assignResourceToTask } from '@/api/ResourceAPI';
import { toast } from '@/lib/toast';

// Styles and animations
import './createTask.css';

// Step interface
interface Step {
  id: string;
  title: string;
}

// Constants
const STEPS: Step[] = [
  {
    id: 'basic',
    title: 'Basic Info',
  },
  {
    id: 'assignment',
    title: 'Assignment',
  },
  {
    id: 'resources',
    title: 'Budget & Resources',
  },
  {
    id: 'review',
    title: 'Review',
  },
];

// Priority options with colors
const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: '#60A5FA' },
  { value: 'MEDIUM', label: 'Medium', color: '#F59E0B' },
  { value: 'HIGH', label: 'High', color: '#EF4444' },
];

export default function CreateTaskPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  
  // Store all form data in one state object
  const [form, setForm] = useState({
    // Basic info
    Title: '',
    Description: '',
    Priority: 'MEDIUM',
    Deadline: '',
    
    // Assignment
    AssignmentType: 'none', // 'none', 'user', 'team'
    UserId: '',
    TeamId: '',
    
    // Budget & Resources
    Cost: 0,
    Resources: [] as { ResourceId: string, Quantity: number, EstimatedCost: number }[],
  });
  
  // State for project data
  const [project, setProject] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Effects
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setUserId(decoded.sub || decoded.id || decoded.userId);
      } else {
        // No token, redirect to login
        toast.error('Authentication required');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      toast.error('Authentication error');
      router.push('/login');
    }
  }, [router]);
  
  // Validate current step when it changes
  useEffect(() => {
    validateStep(activeStep);
  }, [activeStep]);
  
  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !userId) return;
      
      setLoading(true);
      try {
        // Get project and check ownership
        const projectData = await getProjectById(projectId as string);
        setProject(projectData);
        
        // Fetch teams, members, and resources
        const [teamsData, membersData, resourcesData] = await Promise.all([
          getProjectTeams(projectId as string),
          getProjectMembers(projectId as string),
          getProjectResources(projectId as string),
        ]);
        
        setTeams(teamsData || []);
        setMembers(membersData || []);
        setResources(resourcesData || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching project data:', err);
        // Instead of showing error, log the user out and redirect to login
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, userId, router]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle assignment type changes
    if (name === 'AssignmentType') {
      if (value === 'none') {
        setForm(prev => ({ ...prev, [name]: value, UserId: '', TeamId: '' }));
      } else if (value === 'user') {
        setForm(prev => ({ ...prev, [name]: value, TeamId: '' }));
      } else if (value === 'team') {
        setForm(prev => ({ ...prev, [name]: value, UserId: '' }));
      }
    } else if (name === 'Cost') {
      // Ensure cost is a number
      setForm(prev => ({ ...prev, [name]: value ? parseFloat(value) : 0 }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Validate field on change
    const errorMessage = validateField(name, value);
    
    // Clear validation error when field is changed or set new error
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  // Handle resource selection
  const handleResourceChange = (resourceId: string, field: 'Quantity' | 'EstimatedCost', value: number) => {
    setForm(prev => {
      const existingResourceIndex = prev.Resources.findIndex(r => r.ResourceId === resourceId);
      
      if (existingResourceIndex >= 0) {
        // Update existing resource
        const updatedResources = [...prev.Resources];
        updatedResources[existingResourceIndex] = {
          ...updatedResources[existingResourceIndex],
          [field]: value
        };
        return { ...prev, Resources: updatedResources };
      } else if (value > 0) {
        // Add new resource
        return {
          ...prev,
          Resources: [
            ...prev.Resources,
            {
              ResourceId: resourceId,
              Quantity: field === 'Quantity' ? value : 1,
              EstimatedCost: field === 'EstimatedCost' ? value : 0
            }
          ]
        };
      }
      
      return prev;
    });
  };

  // Remove a resource
  const handleRemoveResource = (resourceId: string) => {
    setForm(prev => ({
      ...prev,
      Resources: prev.Resources.filter(r => r.ResourceId !== resourceId)
    }));
  };
  
  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 0: // Basic Info
        if (!form.Title.trim()) {
          newErrors.Title = 'Title is required';
        }
        break;
        
      case 1: // Assignment
        if (form.AssignmentType === 'user' && !form.UserId) {
          newErrors.UserId = 'Please select a team member';
        }
        
        if (form.AssignmentType === 'team' && !form.TeamId) {
          newErrors.TeamId = 'Please select a team';
        }
        break;
        
      case 2: // Budget & Resources
        // Optional section, no required fields
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate single field
  const validateField = (name: string, value: any): string => {
    if (name === 'Title' && !value.trim()) {
      return 'Title is required';
    }
    
    if (name === 'UserId' && form.AssignmentType === 'user' && !value) {
      return 'Please select a team member';
    }
    
    if (name === 'TeamId' && form.AssignmentType === 'team' && !value) {
      return 'Please select a team';
    }
    
    return '';
  };
  
  // Navigate to next step
  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
    } else {
      // Highlight any fields with errors
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        // Find first error field and focus it
        const firstErrorField = document.getElementById(errorFields[0]);
        if (firstErrorField) {
          firstErrorField.focus();
        }
      }
    }
  };
  
  // Navigate to previous step
  const handlePrevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare task data
      const taskData: any = {
        Title: form.Title,
        Description: form.Description,
        Priority: form.Priority,
        ProjectId: projectId,
        Cost: form.Cost,
      };
      
      // Automatically set status based on assignment
      if (form.AssignmentType === 'none') {
        taskData.Status = 'Not Started';
      } else {
        taskData.Status = 'In Progress';
      }
      
      // Priority color based on selection
      const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === form.Priority);
      if (selectedPriority) {
        taskData.PriorityColorHex = selectedPriority.color;
      }
      
      // Add deadline if provided
      if (form.Deadline) {
        taskData.Deadline = new Date(form.Deadline).toISOString();
      }
      
      // Add assignment based on type
      if (form.AssignmentType === 'user') {
        taskData.UserId = form.UserId;
      } else if (form.AssignmentType === 'team') {
        taskData.TeamId = form.TeamId;
      }
      
      // Create task
      const createdTask = await createTask(taskData);
      
      // Assign resources if any
      if (form.Resources.length > 0) {
        await Promise.all(
          form.Resources.map(resource =>
            assignResourceToTask({
              TaskId: createdTask.Id,
              ResourceId: resource.ResourceId,
              Quantity: resource.Quantity,
              EstimatedCost: resource.EstimatedCost
            })
          )
        );
      }
      
      toast.success('Task created successfully');
      
      // Redirect to task details page
      router.push(`/tasks/${createdTask.Id}`);
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast.error(err?.message || 'Could not create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-task-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-task-container">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/projects/${projectId}/tasks`)}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Back to tasks"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold">Create Task</h1>
            <p className="text-muted-foreground mt-1">
              Add a new task to {project?.Name || 'this project'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Redesigned Steps - Apple-inspired minimal style */}
      <div className="mb-10">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-3 left-0 w-full h-0.5 bg-muted">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between relative">
            {STEPS.map((step, index) => (
              <div key={step.id} className="relative flex flex-col items-center">
                <motion.div 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center mb-2 z-10",
                    activeStep >= index 
                      ? "bg-primary text-white" 
                      : "bg-muted text-muted-foreground",
                  )}
                  animate={{
                    scale: activeStep === index ? [1, 1.1, 1] : 1,
                    transition: { duration: 0.3 }
                  }}
                >
                  {activeStep > index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </motion.div>
                
                <span className={cn(
                  "text-xs font-medium tracking-wide",
                  activeStep >= index ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Form Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card rounded-xl border shadow-sm overflow-hidden"
      >
        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${activeStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {/* Step 1: Basic Info */}
            {activeStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-lg font-semibold">Task Information</h2>
                </div>
                
                  {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="Title" className="block text-sm font-medium flex items-center gap-1">
                    Task Title <span className="text-destructive">*</span>
                    {errors.Title && (
                      <span className="ml-auto text-xs text-destructive font-normal">
                        {errors.Title}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="Title"
                    name="Title"
                    value={form.Title}
                    onChange={handleInputChange}
                    placeholder="Enter task title"
                    className={cn(
                      "w-full px-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all",
                      errors.Title ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'
                    )}
                  />
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="Description" className="block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="Description"
                    name="Description"
                    value={form.Description}
                    onChange={handleInputChange}
                    placeholder="Describe the task details, requirements, or any additional information"
                    rows={4}
                    className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                  ></textarea>
                </div>
                
                {/* Priority & Deadline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="Priority" className="block text-sm font-medium">
                      Priority
                    </label>
                    <div className="relative">
                      <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <select
                        id="Priority"
                        name="Priority"
                        value={form.Priority}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all appearance-none"
                        style={{
                          backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                          paddingRight: "2.5rem"
                        }}
                      >
                        {PRIORITY_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Priority Indicator */}
                    <div className="flex items-center gap-2 mt-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: PRIORITY_OPTIONS.find(p => p.value === form.Priority)?.color || '#9CA3AF' 
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {PRIORITY_OPTIONS.find(p => p.value === form.Priority)?.label || 'Medium'} Priority
                      </span>
                    </div>
                  </div>
                  
                  {/* Deadline */}
                  <div className="space-y-2">
                    <label htmlFor="Deadline" className="block text-sm font-medium">
                      Deadline
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <input
                        type="date"
                        id="Deadline"
                        name="Deadline"
                        value={form.Deadline}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Assignment */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-lg font-semibold">Task Assignment</h2>
                </div>
                
                {/* Assignment Type */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <label className="block text-sm font-medium">
                    Assignment Type
                  </label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-input hover:border-primary/30 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        id="assignNone"
                        name="AssignmentType"
                        value="none"
                        checked={form.AssignmentType === 'none'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <label htmlFor="assignNone" className="flex-1 cursor-pointer">
                        <div className="font-medium">No Assignment</div>
                        <div className="text-xs text-muted-foreground">Create task without assigning (Status: Not Started)</div>
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-input hover:border-primary/30 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        id="assignUser"
                        name="AssignmentType"
                        value="user"
                        checked={form.AssignmentType === 'user'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <label htmlFor="assignUser" className="flex-1 cursor-pointer">
                        <div className="font-medium">Assign to Team Member</div>
                        <div className="text-xs text-muted-foreground">Select a specific person (Status: In Progress)</div>
                      </label>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-input hover:border-primary/30 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        id="assignTeam"
                        name="AssignmentType"
                        value="team"
                        checked={form.AssignmentType === 'team'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <label htmlFor="assignTeam" className="flex-1 cursor-pointer">
                        <div className="font-medium">Assign to Team</div>
                        <div className="text-xs text-muted-foreground">Assign to a group or department (Status: In Progress)</div>
                      </label>
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                
                {/* User selection */}
                {form.AssignmentType === 'user' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 p-4 border border-dashed border-primary/20 rounded-lg bg-primary/5"
                  >
                    <label htmlFor="UserId" className="block text-sm font-medium flex items-center gap-1">
                      Select Team Member <span className="text-destructive">*</span>
                      {errors.UserId && (
                        <span className="ml-auto text-xs text-destructive font-normal">
                          {errors.UserId}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <select
                        id="UserId"
                        name="UserId"
                        value={form.UserId}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all",
                          errors.UserId ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'
                        )}
                      >
                        <option value="">Select a team member...</option>
                        {members.length === 0 ? (
                          <option value="" disabled>No members available</option>
                        ) : (
                          members.map(member => (
                            <option key={member.UserId} value={member.UserId}>
                              {member.User?.FirstName 
                                ? `${member.User.FirstName} ${member.User.LastName || ''}` 
                                : `User ${member.UserId.substring(0, 8)}`}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    
                    {/* Selected user preview if available */}
                    {form.UserId && members.find(m => m.UserId === form.UserId) && (
                      <div className="mt-4 p-3 bg-background rounded-lg border border-input flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {(() => {
                              const member = members.find(m => m.UserId === form.UserId);
                              return member?.User?.FirstName 
                                ? `${member.User.FirstName} ${member.User.LastName || ''}` 
                                : `User ${member.UserId.substring(0, 8)}`;
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground">Will be responsible for this task</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {/* Team selection */}
                {form.AssignmentType === 'team' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 p-4 border border-dashed border-primary/20 rounded-lg bg-primary/5"
                  >
                    <label htmlFor="TeamId" className="block text-sm font-medium flex items-center gap-1">
                      Select Team <span className="text-destructive">*</span>
                      {errors.TeamId && (
                        <span className="ml-auto text-xs text-destructive font-normal">
                          {errors.TeamId}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <select
                        id="TeamId"
                        name="TeamId"
                        value={form.TeamId}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all",
                          errors.TeamId ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'
                        )}
                      >
                        <option value="">Select a team...</option>
                        {teams.length === 0 ? (
                          <option value="" disabled>No teams available</option>
                        ) : (
                          teams.map(team => (
                            <option key={team.Id} value={team.Id}>
                              {team.Name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    
                    {/* Selected team preview if available */}
                    {form.TeamId && teams.find(t => t.Id === form.TeamId) && (
                      <div className="mt-4 p-3 bg-background rounded-lg border border-input flex items-center gap-3">
                        <div 
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-white`}
                          style={{ 
                            backgroundColor: `var(--theme-accent, var(--primary))` 
                          }}
                        >
                          {(() => {
                            const team = teams.find(t => t.Id === form.TeamId);
                            if (!team) return <Users className="h-5 w-5" />;
                            
                            const initials = team.Name.split(' ')
                              .slice(0, 2)
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase();
                              
                            return initials || <Users className="h-5 w-5" />;
                          })()}
                        </div>
                        <div>
                          <div className="font-medium">
                            {teams.find(t => t.Id === form.TeamId)?.Name || 'Selected Team'}
                          </div>
                          <div className="text-xs text-muted-foreground">Team will be responsible for this task</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
            
            {/* Step 3: Budget & Resources */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-lg font-semibold">Budget & Resources</h2>
                </div>
                
                {/* Cost */}
                <div className="space-y-2">
                  <label htmlFor="Cost" className="block text-sm font-medium">
                    Estimated Cost
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="number"
                      id="Cost"
                      name="Cost"
                      value={form.Cost || ''}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>
                
                {/* Resources */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">
                      Assign Resources
                    </label>
                  </div>
                  
                  {resources.length === 0 ? (
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No resources available for this project</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-muted/30 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground p-3 border-b border-border/50">
                          <div className="col-span-4">Resource</div>
                          <div className="col-span-3 text-center">Type</div>
                          <div className="col-span-2 text-center">Quantity</div>
                          <div className="col-span-2 text-center">Cost</div>
                          <div className="col-span-1"></div>
                        </div>
                        
                        <div className="divide-y divide-border/50">
                          {resources.map(resource => {
                            const isAssigned = form.Resources.some(r => r.ResourceId === resource.Id);
                            const assignedResource = form.Resources.find(r => r.ResourceId === resource.Id);
                            
                            return (
                              <div 
                                key={resource.Id} 
                                className={cn(
                                  "grid grid-cols-12 p-3 items-center text-sm", 
                                  isAssigned ? "bg-primary/5" : ""
                                )}
                              >
                                <div className="col-span-4 font-medium flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Package className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div>{resource.Name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {resource.Available !== null ? `${resource.Available} available` : ''}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-span-3 text-center">
                                  <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                                    {resource.Type}
                                  </span>
                                </div>
                                <div className="col-span-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max={resource.Available !== null ? resource.Available : undefined}
                                    value={assignedResource?.Quantity || 0}
                                    onChange={(e) => handleResourceChange(
                                      resource.Id, 
                                      'Quantity', 
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="w-16 p-1 text-center bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/30 focus:border-primary focus:outline-none"
                                  />
                                </div>
                                <div className="col-span-2 text-center">
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                      $
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={assignedResource?.EstimatedCost || 0}
                                      onChange={(e) => handleResourceChange(
                                        resource.Id, 
                                        'EstimatedCost', 
                                        parseFloat(e.target.value) || 0
                                      )}
                                      className="w-20 pl-6 p-1 text-center bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/30 focus:border-primary focus:outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="col-span-1 text-center">
                                  {isAssigned && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveResource(resource.Id)}
                                      className="p-1 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition-colors"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {form.Resources.length > 0 && (
                        <div className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium">{form.Resources.length}</span>
                            <span className="text-muted-foreground ml-1">
                              {form.Resources.length === 1 ? 'resource' : 'resources'} assigned
                            </span>
                          </div>
                          <div className="text-sm font-medium">
                            Total Cost: $
                            {form.Resources.reduce((sum, r) => sum + r.EstimatedCost, 0).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 4: Review & Submit */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-lg font-semibold">Review & Submit</h2>
                </div>
                
                {/* Summary Card */}
                <div className="bg-muted/20 rounded-lg border border-border p-4 space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Basic Information</h3>
                      <button 
                        type="button" 
                        onClick={() => setActiveStep(0)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Title</div>
                        <div className="font-medium">{form.Title || 'No title provided'}</div>
                      </div>
                      
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: form.AssignmentType === 'none' ? '#9CA3AF' : '#3B82F6' 
                            }}
                          />
                          <span>{form.AssignmentType === 'none' ? 'Not Started' : 'In Progress'}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-muted-foreground">Priority</div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: PRIORITY_OPTIONS.find(p => p.value === form.Priority)?.color || '#9CA3AF' 
                            }}
                          />
                          <span>{PRIORITY_OPTIONS.find(p => p.value === form.Priority)?.label || 'Medium'}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-muted-foreground">Deadline</div>
                        <div className="font-medium">
                          {form.Deadline ? format(new Date(form.Deadline), 'PP') : 'No deadline set'}
                        </div>
                      </div>
                    </div>
                    
                    {form.Description && (
                      <div>
                        <div className="text-muted-foreground text-sm">Description</div>
                        <div className="text-sm mt-1 bg-background p-3 rounded border border-border/50">
                          {form.Description}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Assignment</h3>
                      <button 
                        type="button" 
                        onClick={() => setActiveStep(1)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                    
                    <div className="mt-3">
                      {form.AssignmentType === 'none' && (
                        <div className="text-sm text-muted-foreground">No assignment selected</div>
                      )}
                      
                      {form.AssignmentType === 'user' && form.UserId && (
                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/50">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">
                              {(() => {
                                const member = members.find(m => m.UserId === form.UserId);
                                return member?.User?.FirstName 
                                  ? `${member.User.FirstName} ${member.User.LastName || ''}` 
                                  : `User ${member.UserId.substring(0, 8)}`;
                              })()}
                            </div>
                            <div className="text-xs text-muted-foreground">Assigned team member</div>
                          </div>
                        </div>
                      )}
                      
                      {form.AssignmentType === 'team' && form.TeamId && (
                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/50">
                          <div 
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-white`}
                            style={{ 
                              backgroundColor: `var(--theme-accent, var(--primary))` 
                            }}
                          >
                            {(() => {
                              const team = teams.find(t => t.Id === form.TeamId);
                              if (!team) return <Users className="h-4 w-4" />;
                              
                              const initials = team.Name.split(' ')
                                .slice(0, 2)
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase();
                                
                              return initials || <Users className="h-4 w-4" />;
                            })()}
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">
                              {teams.find(t => t.Id === form.TeamId)?.Name || 'Selected Team'}
                            </div>
                            <div className="text-xs text-muted-foreground">Assigned team</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Budget & Resources</h3>
                      <button 
                        type="button" 
                        onClick={() => setActiveStep(2)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                    
                    <div className="mt-3 space-y-3">
                      <div className="p-3 bg-background rounded-lg border border-border/50">
                        <div className="text-sm font-medium mb-1">Estimated Cost</div>
                        <div className="text-2xl font-semibold">
                          ${(form.Cost || 0).toFixed(2)}
                          <span className="text-sm text-muted-foreground ml-1">base cost</span>
                        </div>
                        
                        {form.Resources.length > 0 && (
                          <div className="text-sm text-muted-foreground mt-2">
                            + ${form.Resources.reduce((sum, r) => sum + r.EstimatedCost, 0).toFixed(2)} from resources
                          </div>
                        )}
                      </div>
                      
                      {form.Resources.length > 0 ? (
                        <div>
                          <div className="text-sm mb-2">
                            <span className="font-medium">{form.Resources.length}</span>
                            <span className="text-muted-foreground ml-1">
                              {form.Resources.length === 1 ? 'resource' : 'resources'} assigned
                            </span>
                          </div>
                          
                          <div className="bg-background rounded-lg border border-border/50 overflow-hidden">
                            <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground p-3 border-b border-border/50">
                              <div className="col-span-6">Resource</div>
                              <div className="col-span-3 text-center">Quantity</div>
                              <div className="col-span-3 text-right">Cost</div>
                            </div>
                            
                            <div className="divide-y divide-border/50">
                              {form.Resources.map(assignedResource => {
                                const resource = resources.find(r => r.Id === assignedResource.ResourceId);
                                
                                return (
                                  <div 
                                    key={assignedResource.ResourceId} 
                                    className="grid grid-cols-12 p-3 items-center text-sm"
                                  >
                                    <div className="col-span-6 font-medium flex items-center gap-2">
                                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Package className="h-3 w-3" />
                                      </div>
                                      <div>{resource?.Name || 'Unknown Resource'}</div>
                                    </div>
                                    <div className="col-span-3 text-center">
                                      {assignedResource.Quantity}
                                    </div>
                                    <div className="col-span-3 text-right font-medium">
                                      ${assignedResource.EstimatedCost.toFixed(2)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No resources assigned</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Total Calculation */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <div className="text-muted-foreground">Total Estimated Cost</div>
                      <div className="text-2xl font-bold mt-1">
                        ${(
                          (form.Cost || 0) + 
                          form.Resources.reduce((sum, r) => sum + r.EstimatedCost, 0)
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Form navigation */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          {activeStep > 0 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push(`/projects/${projectId}/tasks`)}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          )}
          
          {activeStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Help tip */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted flex items-start gap-3">
        <div className="text-muted-foreground">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-medium">Need Help?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Task status is automatically determined based on assignment. Unassigned tasks start as "Not Started" while assigned tasks begin as "In Progress".
          </p>
        </div>
      </div>
    </div>
  );
}