'use client';

import { useEffect, useState } from 'react';
import { getProjectTasks, createTask, markTaskComplete, deleteTask } from '@/api/TaskAPI';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { TaskDialog } from '@/components/task/TaskDialog';
import { useAuthContext } from '@/contexts/AuthContext';
import { PlusCircle, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import { toast } from '@/lib/toast';
import { SearchInput } from '@/components/ui/SearchInput';

interface Props {
  projectId: string;
  userRole: string | null;
}

type TaskSort = 'deadline' | 'priority' | 'status' | 'created';
type SortDirection = 'asc' | 'desc';

export function ProjectTasks({ projectId, userRole }: Props) {
  const { user } = useAuthContext();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<TaskSort>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const canCreateTask = userRole === 'project_owner' || userRole === 'team_leader';

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortField, sortDirection]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getProjectTasks(projectId);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...tasks];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.Title.toLowerCase().includes(query) || 
        (task.Description && task.Description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(task => task.Status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter) {
      result = result.filter(task => task.Priority === priorityFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'deadline':
          if (!a.Deadline) return 1;
          if (!b.Deadline) return -1;
          comparison = new Date(a.Deadline).getTime() - new Date(b.Deadline).getTime();
          break;
        case 'priority': {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          comparison = (priorityOrder[b.Priority] || 0) - (priorityOrder[a.Priority] || 0);
          break;
        }
        case 'status': {
          const statusOrder = { 'Not Started': 1, 'In Progress': 2, 'Completed': 3 };
          comparison = (statusOrder[a.Status] || 0) - (statusOrder[b.Status] || 0);
          break;
        }
        case 'created':
          comparison = new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredTasks(result);
  };

  const handleTaskCreate = async (taskData: any) => {
    try {
      const newTask = await createTask({
        ...taskData,
        ProjectId: projectId
      });
      
      setTasks(prev => [...prev, newTask]);
      toast.success('Task created successfully');
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleTaskUpdate = async (taskId: string, taskData: any) => {
    try {
      const updatedTask = await updateTask(taskId, taskData);
      
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? updatedTask : task
      ));
      
      toast.success('Task updated successfully');
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success('Task deleted successfully');
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const updatedTask = await markTaskComplete(taskId);
      
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? { ...task, Completed: true, Status: 'Completed' } : task
      ));
      
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Failed to complete task');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Not Started', value: 'Not Started' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' }
  ];

  const priorityOptions = [
    { label: 'All Priorities', value: null },
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' }
  ];

  const sortOptions = [
    { label: 'Created Date', value: 'created' },
    { label: 'Deadline', value: 'deadline' },
    { label: 'Priority', value: 'priority' },
    { label: 'Status', value: 'status' }
  ];

  return (
    <div className="space-y-6">
      {/* Actions and filters */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tasks..."
            className="w-44 md:w-60"
          />
          
          <Dropdown
            trigger={<Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" /> Status</Button>}
            items={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          
          <Dropdown
            trigger={<Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" /> Priority</Button>}
            items={priorityOptions}
            value={priorityFilter}
            onChange={setPriorityFilter}
          />
          
          <Dropdown
            trigger={
              <Button variant="outline" size="sm">
                {sortDirection === 'asc' ? <SortAsc className="h-4 w-4 mr-1" /> : <SortDesc className="h-4 w-4 mr-1" />}
                Sort by
              </Button>
            }
            items={sortOptions}
            value={sortField}
            onChange={(value) => {
              if (value === sortField) {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField(value as TaskSort);
              }
            }}
          />
        </div>
        
        {canCreateTask && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-1" /> New Task
          </Button>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState 
          title="No Tasks Found" 
          description={tasks.length === 0 ? "This project has no tasks yet." : "No tasks match your filters."} 
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard 
              key={task.Id} 
              task={task} 
              onClick={() => setSelectedTask(task)}
              onComplete={() => handleTaskComplete(task.Id)}
              userRole={userRole}
              currentUserId={user?.Id}
            />
          ))}
        </div>
      )}

      {/* Create Task Dialog */}
      <TaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleTaskCreate}
        projectId={projectId}
      />

      {/* Edit Task Dialog */}
      {selectedTask && (
        <TaskDialog
          open={!!selectedTask}
          onOpenChange={() => setSelectedTask(null)}
          onSubmit={(data) => handleTaskUpdate(selectedTask.Id, data)}
          onDelete={() => handleTaskDelete(selectedTask.Id)}
          projectId={projectId}
          task={selectedTask}
        />
      )}
    </div>
  );
}