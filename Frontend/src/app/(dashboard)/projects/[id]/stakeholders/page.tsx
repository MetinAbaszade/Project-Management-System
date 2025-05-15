'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  PieChart, 
  UserPlus, 
  Users, 
  Pencil, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectStakeholders } from '@/api/StakeholderAPI';
import { getCurrentUser } from '@/api/UserAPI';

const getRandomColor = (index: number) => {
  const colors = [
    'from-blue-400 to-blue-600', 
    'from-purple-400 to-purple-600', 
    'from-green-400 to-green-600',
    'from-amber-400 to-amber-600', 
    'from-red-400 to-red-600', 
    'from-indigo-400 to-indigo-600',
    'from-pink-400 to-pink-600',
    'from-teal-400 to-teal-600'
  ];
  return colors[index % colors.length];
};

export default function StakeholdersPage() {
  const { id } = useParams();
  const router = useRouter();
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalPercentage, setTotalPercentage] = useState(0);

  // Fetch stakeholders and project data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch stakeholders and project data in parallel
        const [stakeholdersData, projectData] = await Promise.all([
          getProjectStakeholders(id as string),
          getProjectById(id as string)
        ]);
        
        setStakeholders(stakeholdersData);
        setProject(projectData);
        
        // Calculate total percentage
        const total = stakeholdersData.reduce((acc: number, curr: any) => acc + curr.Percentage, 0);
        setTotalPercentage(total);

        // Check if current user is the project owner
        const currentUser = getCurrentUser();
        setIsOwner(currentUser?.Id === projectData.OwnerId);
      } catch (error) {
        console.error('Failed to load stakeholders data:', error);
        toast.error('Could not load stakeholders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Check if we're over 100%
  const isOverAllocated = totalPercentage > 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push(`/projects/${id}`)}
              className="mr-4 p-2 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted transition-colors"
              aria-label="Back to project"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Project Stakeholders</h1>
              <p className="text-muted-foreground">
                {project?.Name || 'Loading project'} • {stakeholders.length} stakeholder{stakeholders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Only show edit button if user is project owner */}
            {isOwner && (
              <button
                onClick={() => router.push(`/projects/${id}/stakeholders/edit`)}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                <span>Manage</span>
              </button>
            )}
            
            <motion.button
              onClick={() => router.push(`/projects/${id}/stakeholders/create`)}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus className="h-4 w-4" />
              <span>Become a Stakeholder</span>
            </motion.button>
          </div>
        </div>
        
        {/* Allocation summary */}
        <div className="mb-8 p-6 bg-card rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Allocation Summary
            </h2>
            <div className={cn(
              "text-sm font-medium px-3 py-1 rounded-full",
              isOverAllocated 
                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" 
                : totalPercentage === 100 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
            )}>
              {totalPercentage}% Allocated
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  isOverAllocated ? "bg-red-500" : 
                  totalPercentage >= 80 ? "bg-amber-500" : 
                  totalPercentage >= 50 ? "bg-yellow-500" : 
                  "bg-green-500"
                )}
                style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(totalPercentage, 100)}%` }}
                transition={{ duration: 1 }}
              />
          </div>
          
          {isOverAllocated && (
            <div className="flex items-center gap-2 mt-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                Allocation exceeds 100%. Consider adjusting stakeholder percentages.
              </span>
            </div>
          )}
        </div>
        
        {/* Stakeholders Grid */}
        {loading ? (
          <StakeholdersLoadingSkeleton />
        ) : stakeholders.length === 0 ? (
          <EmptyStateStakeholders projectId={id as string} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stakeholders.map((stakeholder, index) => (
              <StakeholderCard 
                key={stakeholder.Id}
                stakeholder={stakeholder}
                colorClass={getRandomColor(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Stakeholder Card Component
function StakeholderCard({ stakeholder, colorClass }: { stakeholder: any, colorClass: string }) {
  const router = useRouter();
  const { id } = useParams();

  return (
          <motion.div 
            whileHover={{ y: -5, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/stakeholder/${stakeholder.Id}`)}
            className="cursor-pointer"
          >
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm h-full">
              <div className={`h-2 w-full bg-gradient-to-r ${colorClass}`} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{stakeholder.UserId}</h3>
                    <p className="text-muted-foreground text-sm">
                      {new Date(stakeholder.CreatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-xl font-bold text-primary">
                    {stakeholder.Percentage}%
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full bg-gradient-to-r ${colorClass}`} 
                      style={{ width: `${stakeholder.Percentage}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stakeholder.Percentage}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <motion.button 
                    className="text-xs flex items-center text-muted-foreground hover:text-primary transition-colors group"
                    whileHover={{ x: 3 }}
                  >
                    <span>View Details</span>
                    <ExternalLink className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
  );
}

// Empty State Component
function EmptyStateStakeholders({ projectId }: { projectId: string }) {
  const router = useRouter();
  
  return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Users className="h-10 w-10 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold mb-3">No Stakeholders Yet</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Stakeholders represent individuals or groups with an interest in the project outcomes.
        Add stakeholders to track ownership percentages and responsibilities.
      </p>
      
      <button
        onClick={() => router.push(`/projects/${projectId}/stakeholders/create`)}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 mx-auto"
      >
        <UserPlus className="h-5 w-5" />
        <span>Add First Stakeholder</span>
      </button>
    </div>
  );
}

// Loading Skeleton
function StakeholdersLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="h-2 w-full bg-muted animate-pulse" />
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-7 w-14 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}