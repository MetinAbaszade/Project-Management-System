'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProjectById, updateProject } from '@/api/ProjectAPI';
import { getProjectTasks } from '@/api/TaskAPI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProjectDeleteDialog } from '@/components/project/ProjectDeleteDialog';

// Icons
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Edit,
  FileText,
  Flag,
  LayoutDashboard,
  MoreHorizontal,
  Shield,
  Shapes,
  Users,
  Users2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Package,
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userRole, setUserRole] = useState({ 
    isOwner: false, 
    isTeamLeader: false, 
    isStakeholder: false,
    isMember: false,
    role: 'guest'
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

  // Get user ID from JWT token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub || decoded.id || decoded.userId;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Determine user's role in the project
  const determineUserRole = (project) => {
    if (!project) return { 
      isOwner: false, 
      isTeamLeader: false, 
      isStakeholder: false,
      isMember: false,
      role: 'guest'
    };

    // Get user ID from either user object or token
    const userId = user?.Id || getUserIdFromToken();
    if (!userId) return { 
      isOwner: false, 
      isTeamLeader: false, 
      isStakeholder: false,
      isMember: false,
      role: 'guest'
    };
    
    // Check if user is the project owner
    const isOwner = userId === project.OwnerId;
    
    // Check if user is a team leader
    const isTeamLeader = Array.isArray(project.teams) && 
      project.teams.some(team => team.LeaderId === userId);
    
    // Check if user is a stakeholder
    const isStakeholder = Array.isArray(project.stakeholders) && 
      project.stakeholders.some(stake => stake.UserId === userId);
    
    // Check if user is a member
    const isMember = Array.isArray(project.members) && 
      project.members.some(member => member.UserId === userId);
    
    // Determine role string
    let role = 'guest';
    if (isOwner) role = 'Project Owner';
    else if (isTeamLeader) role = 'Team Leader';
    else if (isStakeholder) role = 'Stakeholder';
    else if (isMember) role = 'Member';
    
    return {
      isOwner,
      isTeamLeader,
      isStakeholder,
      isMember,
      role
    };
  };

  useEffect(() => {
    async function fetchProjectData() {
      try {
        setLoading(true);
        
        // Fetch project details and tasks in parallel
        const [projectData, tasksData] = await Promise.all([
          getProjectById(id),
          getProjectTasks(id)
        ]);
        
        setProject(projectData);
        setTasks(tasksData || []);
        setError(null);
        
        // Determine user role
        const roleInfo = determineUserRole(projectData);
        setUserRole(roleInfo);
      } catch (err) {
        console.error('Failed to load project:', err);
        setError(err.message || 'Failed to load project details');
        toast.error('Could not load project details');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProjectData();
    }
  }, [id, user]);
  
  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.Status === 'Completed' || t.Completed).length,
    inProgress: tasks.filter(t => t.Status === 'In Progress').length,
    notStarted: tasks.filter(t => t.Status === 'Not Started' || (!t.Status && !t.Completed)).length,
  };
  
  // Calculate completion percentage
  const completionPercentage = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : project?.Progress || 0;
  
  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <Clock className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'stakeholders', label: 'Stakeholders', icon: <Users2 className="w-4 h-4" /> },
    { id: 'scope', label: 'Scope', icon: <Shapes className="w-4 h-4" /> },
    { id: 'risks', label: 'Risks', icon: <Shield className="w-4 h-4" /> },
    { id: 'resource', label: 'Resources', icon: <Package className="w-4 h-4" /> }, // Changed to Package icon
    { id: 'attachments', label: 'Files', icon: <FileText className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Helper functions for date and status
  const getDeadlineStatus = () => {
    if (!project?.Deadline) return { text: 'No deadline', color: 'text-gray-500 dark:text-gray-400' };
    
    const deadline = new Date(project.Deadline);
    const isProjectOverdue = isPast(deadline) && completionPercentage < 100;
    const daysRemaining = differenceInDays(deadline, new Date());
    
    if (completionPercentage >= 100) return { text: 'Completed', color: 'text-green-500' };
    if (isProjectOverdue) return { text: `${Math.abs(daysRemaining)} days overdue`, color: 'text-red-500' };
    if (isToday(deadline)) return { text: 'Due today', color: 'text-amber-500' };
    if (daysRemaining <= 7) return { text: `${daysRemaining} days left`, color: 'text-amber-500' };
    
    return { text: format(deadline, 'MMM d, yyyy'), color: 'text-blue-500' };
  };
  
  // Save progress function
  const handleSaveProgress = async () => {
    if (!project) return;
    
    try {
      if (project.Progress !== completionPercentage) {
        await updateProject(project.Id, { ...project, Progress: completionPercentage });
        setProject(prev => ({ ...prev, Progress: completionPercentage }));
        toast.success('Progress updated successfully');
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !project) {
    return <ErrorScreen error={error} onRetry={() => router.refresh()} />;
  }

  const deadlineStatus = getDeadlineStatus();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background gradient - visible in dark mode, subtle in light mode */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-indigo-900/30 dark:via-primary/20 dark:to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vh] bg-gradient-to-tl from-primary/5 via-blue-500/5 to-transparent dark:from-purple-900/20 dark:via-blue-900/20 dark:to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/90 dark:bg-background/80 border-b border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="py-4 flex items-center justify-between">
            {/* Back button and project title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/projects')}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold tracking-tight truncate max-w-md">{project.Name}</h1>
                <div className="flex items-center mt-0.5 text-sm text-muted-foreground">
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    completionPercentage >= 100 ? "bg-green-500" : 
                    isPast(new Date(project.Deadline)) ? "bg-red-500" : "bg-blue-500"
                  )} />
                  {completionPercentage >= 100 ? "Completed" : 
                   isPast(new Date(project.Deadline)) && completionPercentage < 100 ? "Overdue" : "In Progress"}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {userRole.isOwner && (
                <>
                  <Button
                    onClick={() => router.push(`/projects/${project.Id}/edit`)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                  </Button>
                </>
              )}
              
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
                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => {
                          setShowDropdown(false);
                          // Export functionality
                          toast.info('Export feature coming soon');
                        }}
                      >
                        Export Project Data
                      </button>
                      
                      <button 
                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => {
                          setShowDropdown(false);
                          // Print functionality
                          toast.info('Print feature coming soon');
                        }}
                      >
                        Print Project Summary
                      </button>
                      
                      {userRole.isOwner && (
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
                          onClick={() => {
                            setShowDropdown(false);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Project
                        </button>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs navigation */}
          <div className="overflow-x-auto pb-0.5 -mb-px scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {tabs.map(tab => (
                <Link 
                  key={tab.id}
                  href={`/projects/${project.Id}${tab.id === 'overview' ? '' : `/${tab.id}`}`}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors whitespace-nowrap",
                    // We're on the overview page currently
                    tab.id === 'overview'
                      ? "bg-muted dark:bg-black/30 border-b-2 border-primary text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Project overview content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Project details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-card backdrop-blur-md rounded-xl p-6 shadow-sm border border-border"
            >
              <h2 className="text-lg font-semibold mb-3">Project Description</h2>
              <p className="text-card-foreground/80 whitespace-pre-wrap">
                {project.Description || "No description provided for this project."}
              </p>
            </motion.div>
            
            {/* Project metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Progress card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-card backdrop-blur-md rounded-xl p-5 shadow-sm border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Progress</span>
                  </div>
                  
                  {userRole.isOwner && completionPercentage !== project.Progress && (
                    <Button 
                      variant="outline" 
                      size="xs" 
                      onClick={handleSaveProgress}
                      className="h-6"
                    >
                      <Check className="h-3 w-3 mr-1" /> Save
                    </Button>
                  )}
                </div>
                <div className="text-2xl font-bold">{completionPercentage}%</div>
                <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage || 0}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={cn(
                      "h-full rounded-full",
                      completionPercentage >= 100 ? "bg-green-500" : 
                      isPast(new Date(project.Deadline)) ? "bg-red-500" : "bg-primary"
                    )}
                  />
                </div>
              </motion.div>
              
              {/* Deadline card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-card backdrop-blur-md rounded-xl p-5 shadow-sm border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-muted-foreground">Deadline</span>
                </div>
                <div className="text-2xl font-bold">
                  {project.Deadline ? format(new Date(project.Deadline), 'MMM d') : 'Not set'}
                </div>
                <div className={cn("text-sm mt-1", deadlineStatus.color)}>
                  {deadlineStatus.text}
                </div>
              </motion.div>
              
              {/* Budget card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-card backdrop-blur-md rounded-xl p-5 shadow-sm border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span className="text-sm font-medium text-muted-foreground">Budget</span>
                </div>
                <div className="text-2xl font-bold">${project.TotalBudget?.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Total allocated budget</div>
              </motion.div>
            </div>
            
            {/* Tasks overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card backdrop-blur-md rounded-xl p-6 shadow-sm border border-border"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Tasks Overview</h2>
                <Link 
                  href={`/projects/${project.Id}/tasks`}
                  className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Completed</div>
                  <div className="text-xl font-semibold flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {taskStats.completed} / {taskStats.total}
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">In Progress</div>
                  <div className="text-xl font-semibold flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    {taskStats.inProgress} / {taskStats.total}
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Not Started</div>
                  <div className="text-xl font-semibold flex items-center">
                    <div className="w-2 h-2 bg-muted-foreground/40 rounded-full mr-2"></div>
                    {taskStats.notStarted} / {taskStats.total}
                  </div>
                </div>
              </div>
              
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.slice(0, 3).map((task, index) => (
                    <motion.div 
                      key={task.Id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                      className="flex items-center justify-between bg-muted/50 rounded-lg p-3 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center">
                        <div className={cn(
                          "w-2 h-2 rounded-full mr-3",
                          task.Status === 'Completed' || task.Completed ? "bg-green-500" :
                          task.Status === 'In Progress' ? "bg-blue-500" : "bg-muted-foreground/40"
                        )}></div>
                        <div>
                          <div className="font-medium">{task.Title}</div>
                          <div className="text-xs text-muted-foreground">
                            {task.Deadline ? format(new Date(task.Deadline), 'MMM d') : 'No deadline'}
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-xs",
                        task.Status === 'Completed' || task.Completed ? "bg-green-500/20 text-green-500 dark:text-green-400" :
                        task.Status === 'In Progress' ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : 
                        "bg-muted text-muted-foreground"
                      )}>
                        {task.Status || (task.Completed ? 'Completed' : 'Not Started')}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-muted/50 rounded-lg">
                  <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground">No tasks have been created yet</p>
                  {userRole.isOwner && (
                    <Link 
                      href={`/projects/${project.Id}/tasks`}
                      className="inline-block mt-2 text-primary hover:text-primary/80 transition-colors text-sm"
                    >
                      Add tasks
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Right column - Project sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card backdrop-blur-md rounded-xl p-6 shadow-sm border border-border"
            >
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link 
                  href={`/projects/${project.Id}/tasks`}
                  className="flex items-center justify-between w-full py-2.5 px-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-400 mr-3" />
                    <span>Manage Tasks</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                
                <Link 
                  href={`/projects/${project.Id}/team`}
                  className="flex items-center justify-between w-full py-2.5 px-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-purple-400 mr-3" />
                    <span>Team Members</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                
                <Link 
                  href={`/projects/${project.Id}/risks`}
                  className="flex items-center justify-between w-full py-2.5 px-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-amber-400 mr-3" />
                    <span>Risk Management</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                
                <Link 
                  href={`/projects/${project.Id}/attachments`}
                  className="flex items-center justify-between w-full py-2.5 px-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-400 mr-3" />
                    <span>Project Files</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                
                {userRole.isOwner && (
                  <Link 
                    href={`/projects/${project.Id}/edit`}
                    className="flex items-center justify-between w-full py-2.5 px-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Edit className="h-5 w-5 text-indigo-400 mr-3" />
                      <span>Edit Project</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )}
              </div>
            </motion.div>
            
            {/* Project info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card backdrop-blur-md rounded-xl p-6 shadow-sm border border-border"
            >
              <h2 className="text-lg font-semibold mb-4">Project Info</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project ID</span>
                  <span className="text-sm font-mono">{project.Id.substring(0, 8)}</span>
                </div>
                <div className="border-t border-border"></div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(project.CreatedAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="border-t border-border"></div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn(
                    completionPercentage >= 100 ? "text-green-500" : 
                    isPast(new Date(project.Deadline)) ? "text-red-500" : "text-blue-500"
                  )}>
                    {completionPercentage >= 100 ? "Completed" : 
                     isPast(new Date(project.Deadline)) ? "Overdue" : "In Progress"}
                  </span>
                </div>
                <div className="border-t border-border"></div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Role</span>
                  <span className={userRole.isOwner ? "text-purple-500 dark:text-purple-400" : 
                                  userRole.isTeamLeader ? "text-blue-500 dark:text-blue-400" : ""}>
                    {userRole.role}
                  </span>
                </div>
              </div>
            </motion.div>
            
            {/* Team members */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card backdrop-blur-md rounded-xl p-6 shadow-sm border border-border"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Team</h2>
                <Link 
                  href={`/projects/${project.Id}/team`}
                  className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              {project.members && project.members.length > 0 ? (
                <div className="space-y-3">
                  {project.members.slice(0, 3).map((member, index) => (
                    <motion.div 
                      key={member.UserId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium mr-3">
                          {member.User?.FirstName?.charAt(0) || '?'}{member.User?.LastName?.charAt(0) || ''}
                        </div>
                        <div>
                          <div className="font-medium">{member.User?.FirstName} {member.User?.LastName}</div>
                          <div className="text-xs text-muted-foreground">{member.User?.Email}</div>
                        </div>
                      </div>
                      
                      {member.UserId === project.OwnerId && (
                        <div className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-500 dark:text-purple-400">
                          Owner
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                  <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground">No team members yet</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      
      {/* Delete Project Dialog */}
      <ProjectDeleteDialog
        projectId={project.Id}
        projectName={project.Name}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-8 animate-pulse">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        
        {/* Tabs skeleton */}
        <div className="flex gap-2 mb-8 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-10 w-24 rounded-md" />
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full rounded-xl animate-pulse" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 rounded-xl animate-pulse" />
              ))}
            </div>
            
            <Skeleton className="h-64 w-full rounded-xl animate-pulse" />
          </div>
          
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl animate-pulse" />
            <Skeleton className="h-48 w-full rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Screen Component
function ErrorScreen({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 py-12 bg-card rounded-xl shadow-sm border border-border text-center">
        <div className="bg-red-500/10 p-3 rounded-full inline-flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Failed to Load Project</h1>
        <p className="text-muted-foreground mb-6">{error || "Something went wrong. Please try again."}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
          
          <Button
            onClick={onRetry}
            className="bg-primary hover:bg-primary/90"
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}