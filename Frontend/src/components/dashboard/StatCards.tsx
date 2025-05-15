"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  CheckSquare,
  Calendar,
  BarChart2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Animation variants
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

// Simplified card without stats
function SimpleCard({ 
  title, 
  icon, 
  link,
  description,
  color = 'primary'
}) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const iconColors = {
    primary: 'text-blue-500',
    green: 'text-green-500',
    amber: 'text-amber-500',
    purple: 'text-purple-500'
  };

  const iconBgColors = {
    primary: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    amber: 'bg-amber-500/10',
    purple: 'bg-purple-500/10'
  };

  return (
    <motion.div
      variants={item}
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/10 backdrop-blur-md shadow-sm p-5 cursor-pointer',
        'transition-all duration-300',
        isHovered ? 'shadow-lg shadow-primary/5 border-white/20 bg-white/[0.03]' : 'bg-white/5'
      )}
      onClick={() => router.push(link)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={cn(
            "rounded-full p-2 transition-all duration-300",
            iconBgColors[color],
            isHovered ? `${iconBgColors[color].replace('/10', '/20')}` : ''
          )}>
            {icon}
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <motion.div 
          animate={{ 
            x: isHovered ? 0 : 5,
            opacity: isHovered ? 1 : 0.7
          }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground/70"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.div>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
      
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-white/[0.03] to-transparent rounded-full -mr-20 -mt-20 pointer-events-none"></div>
    </motion.div>
  );
}

export function StatCards() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      <SimpleCard
        title="Projects"
        icon={<FolderKanban className="h-5 w-5 text-blue-500" />}
        description="Manage your projects"
        link="/projects"
        color="primary"
      />

      <SimpleCard
        title="Tasks"
        icon={<CheckSquare className="h-5 w-5 text-green-500" />}
        description="Track your tasks"
        link="/tasks"
        color="green"
      />

      <SimpleCard
        title="Calendar"
        icon={<Calendar className="h-5 w-5 text-amber-500" />}
        description="View your schedule"
        link="/calendar"
        color="amber"
      />

      <SimpleCard
        title="Analytics"
        icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
        description="See your progress"
        link="/analytics"
        color="purple"
      />
    </motion.div>
  );
}