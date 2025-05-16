'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  X, 
  Loader2, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  User
} from 'lucide-react';
import { createTask, updateTask } from '@/api/TaskAPI';
import { getProjectTeams, getProjectMembers } from '@/api/ProjectAPI';
import { toast } from '@/lib/toast';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  task?: any;
  onSuccess?: (updatedData?: any) => void;
}

export function TaskDialog({ isOpen, onClose, projectId, task, onSuccess }: TaskDialogProps) {
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    Priority: 'MEDIUM',
    Status: 'Not Started',
    AssignmentType: 'none', // 'none', 'user', or 'team'
    UserId: '',
    TeamId: '',
    Deadline: '',
    ProjectId: projectId
  });

  // Load task data when editing
  useEffect(() => {
    if (task) {
      setForm({
        Title: task.Title || '',
        Description: task.Description || '',
        Priority: task.Priority || 'MEDIUM',
        Status: task.Status || 'Not Started',
        AssignmentType: task.TeamId ? 'team' : task.UserId ? 'user' : 'none',
        UserId: task.UserId || '',
        TeamId: task.TeamId || '',
        Deadline: task.Deadline ? task.Deadline.split('T')[0] : '',
        ProjectId: projectId
      });
    } else {
      // Reset form for create
      setForm({
        Title: '',
        Description: '',
        Priority: 'MEDIUM',
        Status: 'Not Started',
        AssignmentType: 'none',
        UserId: '',
        TeamId: '',
        Deadline: '',
        ProjectId: projectId
      });
    }
  }, [task, projectId, isOpen]);

  // Fetch teams and members
  useEffect(() => {
    if (isOpen && projectId) {
      const fetchData = async () => {
        setFetchingData(true);
        try {
          const [teamsData, membersData] = await Promise.all([
            getProjectTeams(projectId),
            getProjectMembers(projectId)
          ]);
          
          setTeams(teamsData || []);
          setMembers(membersData || []);
        } catch (error) {
          console.error('Failed to fetch data:', error);
          toast.error('Could not load teams and members');
        } finally {
          setFetchingData(false);
        }
      };
      
      fetchData();
    }
  }, [isOpen, projectId]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'AssignmentType') {
      const newForm = { ...form, [name]: value };
      
      if (value === 'none') {
        newForm.UserId = '';
        newForm.TeamId = '';
      } else if (value === 'user') {
        newForm.TeamId = '';
      } else if (value === 'team') {
        newForm.UserId = '';
      }
      
      setForm(newForm);
    } else {
      setForm({ ...form, [name]: value });
    }
    
    // Clear error for this field
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
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
    
    // If this is not editing an already completed task, validate deadline is not in the past
    if (form.Deadline && form.Status !== 'Completed' && !(task && task.Completed)) {
      const selectedDate = new Date(form.Deadline);
      selectedDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.Deadline = 'Deadline cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare data for API
      const data: any = {
        Title: form.Title,
        Description: form.Description,
        Priority: form.Priority,
        Status: form.Status,
        ProjectId: projectId
      };
      
      // Add deadline if provided
      if (form.Deadline) {
        data.Deadline = new Date(form.Deadline).toISOString();
      }
      
      // Add assignment
      if (form.AssignmentType === 'user') {
        data.UserId = form.UserId;
        data.TeamId = null; // Explicitly clear TeamId if assigning to user
      } else if (form.AssignmentType === 'team') {
        data.TeamId = form.TeamId;
        data.UserId = null; // Explicitly clear UserId if assigning to team
      } else {
        // Clear both when not assigning
        data.UserId = null;
        data.TeamId = null;
      }
      
      if (task) {
        // Update existing task
        const updatedTask = await updateTask(task.Id, data);
        toast.success('Task updated successfully');
        
        if (onSuccess) {
          onSuccess(updatedTask);
        }
      } else {
        // Create new task
        const newTask = await createTask(data);
        toast.success('Task created successfully');
        
        if (onSuccess) {
          onSuccess(newTask);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error(task ? 'Could not update task' : 'Could not create task');
    } finally {
      setLoading(false);
    }
  };

  // If dialog is not open, render nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl bg-card rounded-xl shadow-lg overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-muted/50">
          <h2 className="text-xl font-semibold">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {fetchingData ? (
            <div className="py-10 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading project data...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="Title" className="block text-sm font-medium">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="Title"
                  name="Title"
                  value={form.Title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  className={`w-full px-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all ${errors.Title ? 'border-red-500' : 'border-input'}`}
                />
                {errors.Title && (
                  <p className="text-red-500 text-sm">{errors.Title}</p>
                )}
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
                  onChange={handleChange}
                  placeholder="Describe the task details, requirements, or any additional information"
                  rows={4}
                  className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                ></textarea>
              </div>
              
              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="Status" className="block text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="Status"
                    name="Status"
                    value={form.Status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    {task && <option value="Completed">Completed</option>}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all ${errors.Deadline ? 'border-red-500' : 'border-input'}`}
                  />
                </div>
                {errors.Deadline && (
                  <p className="text-red-500 text-sm">{errors.Deadline}</p>
                )}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="assignTeam">Assign to Team</label>
                  </div>
                </div>
                
                {/* User selection */}
                {form.AssignmentType === 'user' && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    <label htmlFor="UserId" className="block text-sm font-medium">
                      Select Team Member <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <select
                        id="UserId"
                        name="UserId"
                        value={form.UserId}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all ${errors.UserId ? 'border-red-500' : 'border-input'}`}
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
                    {errors.UserId && (
                      <p className="text-red-500 text-sm">{errors.UserId}</p>
                    )}
                  </div>
                )}
                
                {/* Team selection */}
                {form.AssignmentType === 'team' && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    <label htmlFor="TeamId" className="block text-sm font-medium">
                      Select Team <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <select
                        id="TeamId"
                        name="TeamId"
                        value={form.TeamId}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all ${errors.TeamId ? 'border-red-500' : 'border-input'}`}
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
                    {errors.TeamId && (
                      <p className="text-red-500 text-sm">{errors.TeamId}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex justify-end gap-3 bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-input bg-background hover:bg-muted transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || fetchingData}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{task ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>{task ? 'Update Task' : 'Create Task'}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}