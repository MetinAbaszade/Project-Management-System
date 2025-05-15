
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProjectActivityLog } from '@/api/ActivityAPI';
import { getProjects } from '@/api/ProjectAPI';
import { Avatar } from '@/components/ui/avatar';
import { Check, Clock, FileEdit, User, MessageSquare, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

interface ActivityItem {
  Id: string;
  Action: string;
  CreatedAt: string;
  User?: {
    FirstName: string;
    LastName: string;
    Email: string;
    ProfileUrl?: string;
  };
  ProjectId?: string;
  Project?: {
    Name: string;
  };
  TaskId?: string;
  Task?: {
    Title: string;
  };
}

interface Project {
  Id: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const projects: Project[] = await getProjects();

        if (projects.length > 0) {
          const activityPromises = projects.slice(0, 3).map((project) =>
            getProjectActivityLog(project.Id)
          );

          const activityResults = await Promise.all(activityPromises);

          const allActivities = activityResults
            .flat()
            .sort((a, b) =>
              new Date(b?.CreatedAt || 0).getTime() - new Date(a?.CreatedAt || 0).getTime()
            )
            .slice(0, 5);

          setActivities(allActivities);
        }
      } catch (error) {
        console.error('Failed to load activity feed:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getActivityIcon = (action: string) => {
    if (action.includes('complete') || action.includes('finished')) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (action.includes('assign') || action.includes('added to')) {
      return <User className="h-4 w-4 text-blue-500" />;
    }
    if (action.includes('deadline') || action.includes('scheduled')) {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    if (action.includes('comment') || action.includes('message')) {
      return <MessageSquare className="h-4 w-4 text-indigo-500" />;
    }
    if (action.includes('update') || action.includes('changed') || action.includes('edited')) {
      return <FileEdit className="h-4 w-4 text-purple-500" />;
    }
    return <Bell className="h-4 w-4 text-primary" />;
  };

  const getRelativeTime = (date: string) =>
    formatDistanceToNow(new Date(date), { addSuffix: true });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-white/10 rounded-md animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Activity Feed</h2>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
          <p className="text-muted-foreground">No recent activity found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Activity Feed</h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {activities.map((activity) => (
          <motion.div
            key={activity.Id}
            variants={item}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex gap-3 items-start">
              <div className="mt-1">
                <Avatar
                  src={activity.User?.ProfileUrl}
                  name={`${activity.User?.FirstName ?? 'Unknown'} ${activity.User?.LastName ?? ''}`}
                  size="sm"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="rounded-full bg-white/10 p-1">
                    {getActivityIcon(activity.Action)}
                  </div>
                  <p className="text-sm font-medium truncate">
                    {activity.User?.FirstName ?? 'Unknown'} {activity.User?.LastName ?? ''}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {getRelativeTime(activity.CreatedAt)}
                  </span>
                </div>

                <p className="text-sm mt-1">{activity.Action}</p>

                {activity.Project?.Name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Project: {activity.Project.Name}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
