'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, isSameMonth, startOfWeek, endOfWeek, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Filter, List, Grid, Clock, CheckCircle } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dropdown } from '@/components/ui/dropdown';
import { Tooltip } from '@/components/ui/tooltip';
import { TaskDialog } from '@/components/task/TaskDialog';
import { getProjects } from '@/api/ProjectAPI';
import { getCurrentUserTasks, markTaskComplete, createTask, updateTask } from '@/api/TaskAPI';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [view, setView] = useState('month'); // 'month', 'list'
  const [filters, setFilters] = useState({
    project: 'all',
    priority: 'all',
    completed: false,
  });

  // Load tasks and projects
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [tasksData, projectsData] = await Promise.all([
          getCurrentUserTasks(),
          getProjects()
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load calendar data:', error);
        toast.error('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.Deadline) return false;
      if (filters.project !== 'all' && task.ProjectId !== filters.project) return false;
      if (filters.priority !== 'all' && task.Priority !== filters.priority) return false;
      if (!filters.completed && task.Completed) return false;
      return true;
    });
  }, [tasks, filters]);

  // Calendar days for current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    filteredTasks.forEach(task => {
      if (!task.Deadline) return;
      
      const dateKey = format(parseISO(task.Deadline), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    
    return grouped;
  }, [filteredTasks]);

  // Tasks for selected day
  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    
    const dateKey = format(selectedDay, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  }, [selectedDay, tasksByDate]);

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => addMonths(prev, direction));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setTaskDialogOpen(true);
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await markTaskComplete(taskId);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? { ...task, Completed: true, Status: 'Completed' } : task
      ));
      
      toast.success('Task marked as complete');
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleTaskCreate = async (taskData: any) => {
    try {
      const selectedProjectId = taskData.ProjectId || (projects.length > 0 ? projects[0].Id : null);
      
      if (!selectedProjectId) {
        toast.error('No project selected');
        return;
      }
      
      const newTask = await createTask({
        ...taskData,
        ProjectId: selectedProjectId
      });
      
      setTasks(prev => [...prev, newTask]);
      setTaskDialogOpen(false);
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleTaskUpdate = async (taskId: string, taskData: any) => {
    try {
      // Call updateTask API
      const updatedTask = await updateTask(taskId, taskData);
      
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? { ...task, ...updatedTask } : task
      ));
      
      setTaskDialogOpen(false);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const projectOptions = [
    { label: 'All Projects', value: 'all' },
    ...projects.map(project => ({
      label: project.Name,
      value: project.Id
    }))
  ];

  const priorityOptions = [
    { label: 'All Priorities', value: 'all' },
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
  ];

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  const calendarVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.4,
        staggerChildren: 0.03,
        delayChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Area */}
      <GlassPanel className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold">📅</span>
              </div>
              <h1 className="text-2xl font-bold">Calendar</h1>
            </div>
            <p className="text-muted-foreground">
              Visualize your tasks and deadlines
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View switcher - improved styling */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-1.5 border border-white/10">
              <div className="flex gap-1">
                <Tooltip content="Month View">
                  <Button 
                    variant={view === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    className="px-3 h-9"
                    onClick={() => setView('month')}
                  >
                    <Grid className="h-4 w-4 mr-1.5" /> Grid
                  </Button>
                </Tooltip>
                <Tooltip content="List View">
                  <Button 
                    variant={view === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="px-3 h-9"
                    onClick={() => setView('list')}
                  >
                    <List className="h-4 w-4 mr-1.5" /> List
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Filters - wider, more consistent buttons */}
            <Dropdown
              trigger={
                <Button 
                  variant="outline" 
                  size="sm"
                  className="min-w-[110px] h-9 px-4"
                >
                  <Filter className="h-4 w-4 mr-2" /> Project
                </Button>
              }
              items={projectOptions}
              value={filters.project}
              onChange={(value) => setFilters(prev => ({ ...prev, project: value }))}
            />

            <Dropdown
              trigger={
                <Button 
                  variant="outline" 
                  size="sm"
                  className="min-w-[110px] h-9 px-4"
                >
                  <Filter className="h-4 w-4 mr-2" /> Priority
                </Button>
              }
              items={priorityOptions}
              value={filters.priority}
              onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            />

            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "min-w-[140px] h-9 px-4",
                filters.completed && "border-primary text-primary bg-primary/5"
              )}
              onClick={() => setFilters(prev => ({ ...prev, completed: !prev.completed }))}
            >
              <CheckCircle className="h-4 w-4 mr-2" /> 
              {filters.completed ? "Show All" : "Hide Completed"}
            </Button>

            {/* Add Task button - more prominent */}
            <Button 
              onClick={handleCreateTask}
              className="h-9 px-4 min-w-[100px]"
            >
              <Plus className="h-4 w-4 mr-2" /> Task
            </Button>
          </div>
        </div>
      </GlassPanel>

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <GlassPanel className="p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => navigateMonth(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => navigateMonth(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            {view === 'month' && (
              <div className="rounded-lg overflow-hidden">
                {/* Days of week */}
                <div className="grid grid-cols-7 mb-1">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium py-2 text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <motion.div 
                  className="grid grid-cols-7 gap-1"
                  variants={calendarVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {calendarDays.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayTasks = tasksByDate[dateKey] || [];
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = selectedDay && isSameDay(day, selectedDay);
                    const isCurrentDay = isToday(day);

                    return (
                      <motion.div
                        key={dateKey}
                        variants={itemVariants}
                        className={cn(
                          "min-h-28 p-1 rounded-lg border transition-colors cursor-pointer",
                          isCurrentMonth 
                            ? "bg-white/5 border-white/10" 
                            : "bg-white/[0.02] border-white/[0.05] text-muted-foreground",
                          isSelected && "bg-primary/10 border-primary/30",
                          isCurrentDay && "ring-2 ring-primary/30"
                        )}
                        onClick={() => handleDayClick(day)}
                      >
                        <div className="flex justify-between items-start p-1">
                          <span className={cn(
                            "h-6 w-6 flex items-center justify-center rounded-full text-sm",
                            isCurrentDay && "bg-primary text-white font-medium",
                            isSelected && !isCurrentDay && "bg-primary/20 font-medium"
                          )}>
                            {format(day, 'd')}
                          </span>
                        </div>

                        <div className="space-y-1 mt-1">
                          {dayTasks.slice(0, 3).map((task) => (
                            <div
                              key={task.Id}
                              className={cn(
                                "text-xs p-1 rounded truncate hover:bg-white/10",
                                task.Completed ? "line-through opacity-50" : "",
                                task.Priority === 'HIGH' ? "bg-red-500/20 border-l-2 border-red-500" :
                                task.Priority === 'MEDIUM' ? "bg-amber-500/20 border-l-2 border-amber-500" :
                                "bg-blue-500/20 border-l-2 border-blue-500"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskClick(task);
                              }}
                            >
                              {task.Title}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-xs text-center text-muted-foreground">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            )}

            {/* List View */}
            {view === 'list' && (
              <div className="space-y-2">
                {Object.entries(tasksByDate).length > 0 ? (
                  Object.entries(tasksByDate)
                    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                    .map(([dateKey, dateTasks]) => (
                      <motion.div 
                        key={dateKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                      >
                        <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                          {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                          {isToday(new Date(dateKey)) && (
                            <Badge className="ml-2 bg-primary/20 text-primary">Today</Badge>
                          )}
                        </h3>
                        <div className="space-y-2">
                          {dateTasks.map((task) => (
                            <motion.div 
                              key={task.Id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                "p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer",
                                "hover:bg-white/10 transition-colors",
                                task.Completed && "opacity-60"
                              )}
                              onClick={() => handleTaskClick(task)}
                            >
                              <div className="flex justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-1 h-6 rounded-full",
                                    task.Priority === 'HIGH' ? "bg-red-500" :
                                    task.Priority === 'MEDIUM' ? "bg-amber-500" : "bg-blue-500"
                                  )} />
                                  <div className="space-y-0.5">
                                    <div className={cn(
                                      "font-medium",
                                      task.Completed && "line-through"
                                    )}>
                                      {task.Title}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {format(new Date(task.Deadline), 'h:mm a')}
                                      
                                      {/* Show project if available */}
                                      {projects.find(p => p.Id === task.ProjectId) && (
                                        <>
                                          <span className="mx-1">•</span>
                                          {projects.find(p => p.Id === task.ProjectId).Name}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Badge className={cn(
                                    task.Priority === 'HIGH' ? "bg-red-500/20 text-red-500" :
                                    task.Priority === 'MEDIUM' ? "bg-amber-500/20 text-amber-500" :
                                    "bg-blue-500/20 text-blue-500"
                                  )}>
                                    {task.Priority}
                                  </Badge>
                                  
                                  {!task.Completed && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-full text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskComplete(task.Id);
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50 flex items-center justify-center">
                      <span className="text-2xl">📅</span>
                    </div>
                    <p>No tasks to display for the selected filters</p>
                    <Button 
                      className="mt-4 px-5 py-2 min-w-[140px]"
                      onClick={handleCreateTask}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add New Task
                    </Button>
                  </div>
                )}
              </div>
            )}
          </GlassPanel>
        </div>

        {/* Side Panel - Selected Day / Upcoming */}
        <div>
          <GlassPanel className="p-6">
            <AnimatePresence mode="wait">
              {selectedDay ? (
                <motion.div
                  key="day-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">
                        {format(selectedDay, 'EEEE, MMMM d')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isToday(selectedDay) ? 'Today' : format(selectedDay, 'yyyy')}
                      </p>
                    </div>
                    <Button 
                      onClick={handleCreateTask}
                      className="px-4 min-w-[100px] h-9"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Task
                    </Button>
                  </div>

                  {tasksForSelectedDay.length > 0 ? (
                    <div className="space-y-2">
                      {tasksForSelectedDay.map((task) => (
                        <motion.div
                          key={task.Id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer",
                            "hover:bg-white/10 transition-colors",
                            task.Completed && "opacity-60"
                          )}
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "font-medium truncate",
                                task.Completed && "line-through"
                              )}>
                                {task.Title}
                              </div>
                              
                              {task.Description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {task.Description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={cn(
                                  "text-xs",
                                  task.Priority === 'HIGH' ? "bg-red-500/20 text-red-500" :
                                  task.Priority === 'MEDIUM' ? "bg-amber-500/20 text-amber-500" :
                                  "bg-blue-500/20 text-blue-500"
                                )}>
                                  {task.Priority}
                                </Badge>
                                
                                <span className="text-xs text-muted-foreground">
                                  {task.Deadline && format(new Date(task.Deadline), 'h:mm a')}
                                </span>
                              </div>
                            </div>
                            
                            {!task.Completed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 h-8 w-8 p-0 rounded-full text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskComplete(task.Id);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <p className="mb-4">No tasks scheduled for this day</p>
                      <Button 
                        onClick={handleCreateTask}
                        className="px-5 py-2 min-w-[120px]"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Task
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="upcoming"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold">Upcoming Tasks</h3>
                  
                  {filteredTasks.length > 0 ? (
                    <div className="space-y-2">
                      {filteredTasks
                        .sort((a, b) => new Date(a.Deadline).getTime() - new Date(b.Deadline).getTime())
                        .slice(0, 5)
                        .map((task) => (
                          <motion.div
                            key={task.Id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer",
                              "hover:bg-white/10 transition-colors",
                              task.Completed && "opacity-60"
                            )}
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className={cn(
                                  "font-medium truncate",
                                  task.Completed && "line-through"
                                )}>
                                  {task.Title}
                                </div>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="bg-primary/20 text-primary">
                                    {format(new Date(task.Deadline), 'MMM d')}
                                  </Badge>
                                  
                                  <Badge className={cn(
                                    "text-xs",
                                    task.Priority === 'HIGH' ? "bg-red-500/20 text-red-500" :
                                    task.Priority === 'MEDIUM' ? "bg-amber-500/20 text-amber-500" :
                                    "bg-blue-500/20 text-blue-500"
                                  )}>
                                    {task.Priority}
                                  </Badge>
                                </div>
                              </div>
                              
                              {!task.Completed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0 h-8 w-8 p-0 rounded-full text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskComplete(task.Id);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <p className="mb-4">No upcoming tasks</p>
                      <Button 
                        onClick={handleCreateTask}
                        className="px-5 py-2 min-w-[120px]"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Task
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassPanel>
        </div>
      </div>

      {/* Create/Edit Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={selectedTask 
          ? (data) => handleTaskUpdate(selectedTask.Id, data)
          : handleTaskCreate
        }
        projectId={selectedTask?.ProjectId || (projects.length > 0 ? projects[0].Id : '')}
        task={selectedTask}
      />
    </motion.div>
  );
}