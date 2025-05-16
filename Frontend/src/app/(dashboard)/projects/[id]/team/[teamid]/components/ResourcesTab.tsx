// Frontend/src/app/(dashboard)/projects/[id]/team/[teamid]/components/ResourcesTab.tsx

import { useState } from 'react';
import { Database, Box, Plus, Settings, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResourcesTabProps {
  teamId: string;
}

export default function ResourcesTab({ teamId }: ResourcesTabProps) {
  const [selectedResource, setSelectedResource] = useState<null>(null);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Team Resources
        </h3>
        
        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus size={16} />
          Add Resource
        </button>
      </div>
      
      <motion.div 
        className="bg-card border border-border rounded-xl p-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Database size={28} className="text-primary" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">No Resources Available</h3>
          
          <p className="text-muted-foreground mb-6">
            Resources help your team track and allocate materials, budgets, equipment, and other assets needed for tasks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add First Resource
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              Resource Settings
            </motion.button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <Box size={14} />
              <span>Learn about team resource management</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}