import { useState, useEffect } from 'react';
import { ClipboardList, User, Calendar, PenSquare, Trash2, UserPlus, UserMinus, Activity, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityTabProps {
  teamId: string;
}

export default function ActivityTab({ teamId }: ActivityTabProps) {
  const [loading, setLoading] = useState(true);
  
  // Simulate loading for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Recent Activity
          </h3>
        </div>
        
        <div className="relative pl-4">
          <div className="absolute top-0 bottom-0 left-4 border-l-2 border-muted"></div>
          
          <div className="space-y-6 relative">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ml-6 relative">
                <div className="absolute -left-10 mt-1 w-4 h-4 rounded-full bg-muted animate-pulse"></div>
                <div className="bg-card border border-border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-4/5 mt-2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Activity
        </h3>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <ClipboardList className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your team's activity will appear here. This includes task assignments, completions, member additions, and other team events.
        </p>
      </div>
    </motion.div>
  );
}