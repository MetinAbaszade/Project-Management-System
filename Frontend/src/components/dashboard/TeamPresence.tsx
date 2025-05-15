'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProjects, getProjectMembers } from '@/api/ProjectAPI';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Animations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

interface TeamMember {
  Id: string;
  User: {
    Id: string;
    FirstName: string;
    LastName: string;
    ProfileUrl?: string;
    Email: string;
  };
  Role: string;
  LastActivity?: string;
  IsOnline?: boolean;
}

export function TeamPresence() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const projects = await getProjects();

        if (projects.length > 0) {
          const members = await getProjectMembers(projects[0].Id);

          // 🔹 Simulated presence data — replace with real-time system later
          const membersWithStatus = members.map((member: TeamMember) => ({
            ...member,
            IsOnline: Math.random() > 0.5,
            LastActivity: getRandomActivity(),
          }));

          setTeamMembers(membersWithStatus);
        }
      } catch (error) {
        console.error('Failed to load team members:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getRandomActivity = () => {
    const activities = [
      'updated 2 tasks',
      'commented on a task',
      'created a new project',
      'completed a task',
      'uploaded a file',
    ];
    return activities[Math.floor(Math.random() * activities.length)];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-white/10 rounded-md animate-pulse" />
        <div className="bg-white/5 rounded-xl p-4 animate-pulse h-20" />
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Team Presence</h2>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
          <p className="text-muted-foreground">No team members found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Team Presence</h2>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-4"
        >
          {teamMembers.map((member) => (
            <Tooltip
              key={member.Id}
              content={
                <div className="text-center">
                  <p>
                    {member.User.FirstName} {member.User.LastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.Role}</p>
                  {member.LastActivity && (
                    <p className="text-xs mt-1">{member.LastActivity}</p>
                  )}
                </div>
              }
            >
              <motion.div variants={item} className="relative">
                <Avatar
                  src={member.User.ProfileUrl}
                  name={`${member.User.FirstName} ${member.User.LastName}`}
                  size="md"
                />
                <div
                  className={cn(
                    'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                    member.IsOnline ? 'bg-green-500' : 'bg-gray-500'
                  )}
                />
              </motion.div>
            </Tooltip>
          ))}
        </motion.div>

        <div className="mt-4 text-sm">
          <p className="text-muted-foreground">
            {teamMembers.filter((m) => m.IsOnline).length} of {teamMembers.length} team members online
          </p>
        </div>
      </div>
    </div>
  );
}
