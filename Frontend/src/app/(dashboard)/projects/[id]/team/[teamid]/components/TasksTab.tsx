import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ClipboardList, Clock, Calendar, User, AlertCircle, CheckCircle, CircleSlash, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamTasks } from '@/api/TeamAPI';
import { toast } from '@/lib/toast';

interface TasksTabProps {
  projectId: string;
  teamId: string;
  canCreateTasks: boolean;
}

export default function TasksTab({ projectId, teamId, canCreateTasks }: TasksTabProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all'); // 'all', 'not-started', 'in-progress', 'completed'
  
  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tasksData = await getTeamTasks(teamId);
        setTasks(tasksData || []);
      } catch (error) {
        console.error('Failed to fetch team tasks:', error);
        setError('Could not load tasks for this team');
        toast.error('Failed to load team tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [teamId]);
  
  // Filter tasks based on status
  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => {
        const status = task.Status?.toLowerCase() || 'not started';
        return filter === status.replace(' ', '-');
      });
  
  // Function to handle task click - redirects to task detail page
  const handleTaskClick = (taskId: string) => {
    router.push(`/projects/${projectId}/tasks/${taskId}`);
  };
  
  // Function to create a new task - redirects to create task page
  const handleCreateTask = () => {
    router.push(`/projects/${projectId}/tasks/create?teamId=${teamId}`);
  };
  
  // Function to get task status badge styling
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
      case 'in progress':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
      case 'not started':
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };
  
  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in progress':
        return <Clock className="w-4 h-4" />;
      case 'not started':
      default:
        return <CircleSlash className="w-4 h-4" />;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Team Tasks
          </h3>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-card border border-border rounded-lg animate-pulse">
              <div className="flex justify-between items-center mb-2">
                <div className="h-5 bg-muted rounded w-1/3"></div>
                <div className="h-5 bg-muted rounded w-20"></div>
              </div>
              <div className="h-4 bg-muted rounded w-4/5 mb-3"></div>
              <div className="flex items-center">
                <div className="h-4 bg-muted rounded w-24 mr-4"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Team Tasks
          </h3>
        </div>
        
        <div className="bg-destructive/10 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-destructive mr-2" />
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <ClipboardList className="w-5 h-5 mr-2" />
          Team Tasks
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors"
              onClick={() => {
                const dropdown = document.getElementById('filter-dropdown');
                if (dropdown) {
                  dropdown.classList.toggle('hidden');
                }
              }}
            >
              <Filter size={14} />
              {filter === 'all' ? 'All Tasks' : 
               filter === 'not-started' ? 'Not Started' :
               filter === 'in-progress' ? 'In Progress' : 'Completed'}
              <ChevronDown size={14} />
            </button>
            
            <div id="filter-dropdown" className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-md shadow-lg py-1 z-10 hidden">
              <button 
                className={`w-full text-left px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                onClick={() => {
                  setFilter('all');
                  document.getElementById('filter-dropdown')?.classList.add('hidden');
                }}
              >
                All Tasks
              </button>
              <button 
                className={`w-full text-left px-3 py-1.5 text-sm ${filter === 'not-started' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                onClick={() => {
                  setFilter('not-started');
                  document.getElementById('filter-dropdown')?.classList.add('hidden');
                }}
              >
                Not Started
              </button>
              <button 
                className={`w-full text-left px-3 py-1.5 text-sm ${filter === 'in-progress' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                onClick={() => {
                  setFilter('in-progress');
                  document.getElementById('filter-dropdown')?.classList.add('hidden');
                }}
              >
                In Progress
              </button>
              <button 
                className={`w-full text-left px-3 py-1.5 text-sm ${filter === 'completed' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                onClick={() => {
                  setFilter('completed');
                  document.getElementById('filter-dropdown')?.classList.add('hidden');
                }}
              >
                Completed
              </button>
            </div>
          </div>
          
          {canCreateTasks && (
            <button 
              onClick={handleCreateTask}
              className="flex items-center text-sm px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Task
            </button>
          )}
        </div>
      </div>
      
      {filteredTasks.length === 0 ? (
        <motion.div 
          className="bg-muted/50 rounded-lg p-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
          <p className="text-muted-foreground mb-2">
            {filter === 'all' 
              ? 'No tasks assigned to this team yet' 
              : `No ${filter.replace('-', ' ')} tasks found`}
          </p>
          {canCreateTasks && filter === 'all' && (
            <button
              onClick={handleCreateTask}
              className="mt-3 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm transition-colors"
            >
              Create Your First Task
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <motion.div 
                key={task.Id} 
                onClick={() => handleTaskClick(task.Id)}
                className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{task.Title}</h4>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full flex items-center gap-1",
                    getStatusBadge(task.Status)
                  )}>
                    {getStatusIcon(task.Status)}
                    {task.Status || 'Not Started'}
                  </span>
                </div>
                
                {task.Description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.Description}</p>
                )}
                
                <div className="flex items-center text-xs text-muted-foreground">
                  {task.Deadline && (
                    <div className="flex items-center mr-4">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {new Date(task.Deadline).toLocaleDateString()}
                    </div>
                  )}
                  
                  {task.UserId && (
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1" />
                      {task.AssignedUserName || 'Assigned'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}