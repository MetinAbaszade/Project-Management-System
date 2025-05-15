'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Plus
} from 'lucide-react';
import {
  getCurrentUserTasks,
  updateTask,
  createTask
} from '@/api/TaskAPI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Animations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
};

export function FocusSection() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickTask, setQuickTask] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      try {
        const userTasks = await getCurrentUserTasks();

        const sorted = userTasks
          .filter(t => !t.Completed)
          .sort((a, b) => {
            const priorityOrder = { URGENT: 3, HIGH: 3, MEDIUM: 2, LOW: 1 };
            const pDiff = (priorityOrder[b.Priority] || 0) - (priorityOrder[a.Priority] || 0);

            if (pDiff !== 0) return pDiff;

            if (a.Deadline && b.Deadline) {
              return new Date(a.Deadline).getTime() - new Date(b.Deadline).getTime();
            }

            return a.Deadline ? -1 : b.Deadline ? 1 : 0;
          });

        setTasks(sorted);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Could not load your tasks.');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const handleMarkComplete = async (taskId: string) => {
    try {
      await updateTask(taskId, { Completed: true });
      setTasks(prev => prev.filter(t => t.Id !== taskId));
      toast.success('Task completed!');
    } catch (err) {
      toast.error('Could not complete task.');
    }
  };

  const handleSnoozeTask = async (taskId: string) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await updateTask(taskId, { Deadline: tomorrow.toISOString() });

      setTasks(prev =>
        prev.map(t =>
          t.Id === taskId ? { ...t, Deadline: tomorrow.toISOString() } : t
        )
      );

      toast.success('Task snoozed to tomorrow');
    } catch (err) {
      toast.error('Could not snooze task.');
    }
  };

  const handleAddQuickTask = async () => {
    if (!quickTask.trim()) return;

    setAddingTask(true);
    try {
      const projectId = tasks[0]?.ProjectId || '';

      const newTask = await createTask({
        Title: quickTask,
        Priority: 'MEDIUM',
        ProjectId: projectId,
        Status: 'Not Started'
      });

      setTasks(prev => [newTask, ...prev]);
      setQuickTask('');
      toast.success('Task added!');
    } catch (err) {
      toast.error('Could not add task.');
    } finally {
      setAddingTask(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const topTasks = tasks.slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-white/10 rounded-md animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Focus for Today</h2>
      </div>

      {topTasks.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
          Great job! You've completed all your tasks. Add a new one to get started.
        </p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {topTasks.map((task) => (
            <motion.div
              key={task.Id}
              variants={item}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={cn('font-normal', getPriorityColor(task.Priority))}>
                      {task.Priority}
                    </Badge>
                    {task.Deadline && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(task.Deadline), 'MMM dd')}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-base font-medium">{task.Title}</h3>
                  {task.Description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.Description}</p>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    onClick={() => handleMarkComplete(task.Id)}
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-green-500 hover:text-green-400 hover:bg-green-500/10"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => handleSnoozeTask(task.Id)}
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                  >
                    <Clock className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Quick Add Task */}
      <div className="relative flex bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        <Input
          value={quickTask}
          onChange={(e) => setQuickTask(e.target.value)}
          placeholder="Add a quick task..."
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-4 pr-16"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddQuickTask();
          }}
        />
        <Button
          onClick={handleAddQuickTask}
          disabled={addingTask || !quickTask.trim()}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}