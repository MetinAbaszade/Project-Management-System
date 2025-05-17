// src/components/task/TaskTabsContainer.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Package, 
  Paperclip,
  Info
} from 'lucide-react';
import { TaskSubtasks } from './TaskSubtasks';
import { ResourceSection } from './ResourceSection';
import { TaskAttachments } from './TaskAttachments';

interface TaskTabsContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  taskId: string;
  projectId: string;
  isOwner: boolean;
}

export function TaskTabsContainer({
  activeTab,
  setActiveTab,
  taskId,
  projectId,
  isOwner
}: TaskTabsContainerProps) {
  const tabs = [
    { id: 'details', label: 'Details', icon: <Info className="h-4 w-4" /> },
    { id: 'subtasks', label: 'Subtasks', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'resources', label: 'Resources', icon: <Package className="h-4 w-4" /> },
    { id: 'attachments', label: 'Attachments', icon: <Paperclip className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-4">
      {/* Tabs navigation */}
      <div className="flex items-center p-1 bg-muted/50 rounded-xl overflow-x-auto scrollbar-thin">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap
              ${activeTab === tab.id 
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
          >
            {tab.icon}
            {tab.label}
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'subtasks' && (
          <motion.div
            key="subtasks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden p-6"
          >
            <TaskSubtasks 
              taskId={taskId} 
              projectId={projectId} 
              isOwner={isOwner} 
            />
          </motion.div>
        )}
        
        {activeTab === 'resources' && (
          <motion.div
            key="resources"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden p-6"
          >
            <ResourceSection 
              taskId={taskId}
              projectId={projectId}
              isOwner={isOwner}
            />
          </motion.div>
        )}
        
        {activeTab === 'attachments' && (
          <motion.div
            key="attachments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden p-6"
          >
            <TaskAttachments 
              taskId={taskId}
              projectId={projectId} 
              isOwner={isOwner} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}