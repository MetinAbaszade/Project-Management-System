'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  User, 
  Clock, 
  Flag, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

// API
import { getProjectById, getProjectTeams, getProjectMembers } from '@/api/ProjectAPI';
import { createTask } from '@/api/TaskAPI';
import { toast } from '@/lib/toast';

// Styles
import './createTask.css';

export default function CreateTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // States
  const [project, setProject] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    Priority: 'MEDIUM',
    Status: 'Not Started',
    Deadline: '',
    AssignmentType: 'none', // 'none', 'user', 'team'
    UserId: '',
    TeamId: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get user ID from JWT token
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

  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !userId) return;
      
      setLoading(true);
      try {
        // Get project and check ownership
        const projectData = await getProjectById(id as string);
        setProject(projectData);
        
        // Check if user is project owner
        const userIsOwner = projectData.OwnerId === userId;
        setIsProjectOwner(userIsOwner);
        
        if (!userIsOwner) {
          toast.error('Only project owners can create tasks');
          router.push(`/projects/${id}/tasks`);
          return;
        }
        
        // Get teams and members
        const [teamsData, membersData] = await Promise.all([
          getProjectTeams(id as string),
          getProjectMembers(id as string)
        ]);
        
        setTeams(teamsData || []);
        setMembers(membersData || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching project data:', err);
        setError(err?.message || 'Failed to load project data');
        toast.error('Could not load project data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, userId, router]);

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
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.Title.trim()) {
      newErrors.Title = 'Title is required';
    }
    
    if (form.AssignmentType === 'user' && !form.UserId) {
      newErrors.UserId = 'Please select a team member';
    }
    
    if (form.AssignmentType === 'team' && !form.TeamId) {
      newErrors.TeamId = 'Please select a team';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare task data
      const taskData: any = {
        Title: form.Title,
        Description: form.Description,
        Status: form.Status,
        Priority: form.Priority,
        ProjectId: id,
      };
      
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
      await createTask(taskData);
      
      toast.success('Task created successfully');
      router.push(`/projects/${id}/tasks`);
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast.error(err?.message || 'Could not create task');
    } finally {
      setSubmitting(false);
    }
  };

  // If not the project owner, redirect
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

  if (error) {
    return (
      <div className="create-task-container flex items-center justify-center min-h-[60vh]">
        <div className="bg-card rounded-xl p-8 max-w-md w-full text-center space-y-4 border shadow-sm">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Error Loading Project</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={() => router.push(`/projects/${id}/tasks`)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Back to Tasks
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isProjectOwner) {
    return null; // This shouldn't be visible since we redirect
  }

  return (
    <div className="create-task-container">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/projects/${id}/tasks`)}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Back to tasks"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold">Create New Task</h1>
            <p className="text-muted-foreground mt-1">
              Add a new task to {project?.Name || 'this project'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card rounded-xl border shadow-sm overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="Title" className="block text-sm font-medium">
              Task Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="Title"
              name="Title"
              value={form.Title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              className={`w-full px-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all ${errors.Title ? 'border-destructive' : 'border-input'}`}
            />
            {errors.Title && <p className="text-destructive text-sm">{errors.Title}</p>}
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
          
          {/* Two columns for Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="Status" className="block text-sm font-medium">
                Status
              </label>
              <select
                id="Status"
                name="Status"
                value={form.Status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="Priority" className="block text-sm font-medium">
                Priority
              </label>
              <select
                id="Priority"
                name="Priority"
                value={form.Priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
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
              />
            </div>
          </div>
          
          {/* Assignment */}
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Assignment
            </label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="assignNone"
                  name="AssignmentType"
                  value="none"
                  checked={form.AssignmentType === 'none'}
                  onChange={handleInputChange}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="assignNone">No Assignment</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="assignUser"
                  name="AssignmentType"
                  value="user"
                  checked={form.AssignmentType === 'user'}
                  onChange={handleInputChange}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="assignUser">Assign to Team Member</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="assignTeam"
                  name="AssignmentType"
                  value="team"
                  checked={form.AssignmentType === 'team'}
                  onChange={handleInputChange}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="assignTeam">Assign to Team</label>
              </div>
            </div>
            
            {/* User selection */}
            {form.AssignmentType === 'user' && (
              <div className="space-y-2 pl-6 border-l-2 border-muted">
                <label htmlFor="UserId" className="block text-sm font-medium">
                  Select Team Member <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <select
                    id="UserId"
                    name="UserId"
                    value={form.UserId}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all ${errors.UserId ? 'border-destructive' : 'border-input'}`}
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
                {errors.UserId && <p className="text-destructive text-sm">{errors.UserId}</p>}
              </div>
            )}
            
            {/* Team selection */}
            {form.AssignmentType === 'team' && (
              <div className="space-y-2 pl-6 border-l-2 border-muted">
                <label htmlFor="TeamId" className="block text-sm font-medium">
                  Select Team <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <select
                    id="TeamId"
                    name="TeamId"
                    value={form.TeamId}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all ${errors.TeamId ? 'border-destructive' : 'border-input'}`}
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
                {errors.TeamId && <p className="text-destructive text-sm">{errors.TeamId}</p>}
              </div>
            )}
          </div>
          
          {/* Form actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push(`/projects/${id}/tasks`)}
              disabled={submitting}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}