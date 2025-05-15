"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCards } from '@/components/dashboard/StatCards';
import { Avatar } from '@/components/ui/avatar';
import { Bell, Settings, User, ChevronDown, ArrowUpRight, Calendar, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentUserProjects } from '@/api/UserAPI';
import { format, isPast, isToday, differenceInDays } from 'date-fns';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

// TopBar with Welcome message and dynamic user data

function TopBar() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const router = useRouter();
  
  useEffect(() => {
    function getUserData() {
      try {
        // Get user data from localStorage instead of API call
        const userData = getCurrentUser();
        setUserData(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getUserData();
  }, []);
  
  // Get name or email prefix for welcome message
  const getWelcomeName = () => {
    if (userData?.FirstName) {
      return userData.FirstName;
    } else if (userData?.Email) {
      // Extract part before @ in email
      return userData.Email.split('@')[0];
    }
    return 'User';
  };
  
  // Dynamic gradient based on theme
  const getGradient = () => {
    switch(theme) {
      case 'neonPulse': return 'from-blue-400 via-purple-400 to-blue-500';
      case 'technoAurora': return 'from-indigo-400 via-blue-500 to-indigo-600';
      case 'lushForest': return 'from-green-400 to-emerald-600';
      case 'sundownSerenity': return 'from-orange-300 to-pink-400';
      default: return 'from-primary via-indigo-500 to-primary';
    }
  };
  
  return (
    <div className="flex items-center justify-between py-6 px-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div className="h-8 w-64 bg-white/5 animate-pulse rounded-lg"></div>
        ) : (
          <h1 className={cn(
            "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
            getGradient()
          )}>
            Welcome back, {getWelcomeName()}
          </h1>
        )}
      </motion.div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            2
          </span>
        </Button>
        
        {/* Profile button that directly navigates to profile page */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors"
          onClick={() => router.push('/profile')}
          title="Go to profile"
        >
          <div className="relative overflow-hidden rounded-full">
            <Avatar 
              size="sm" 
              name={loading ? '?' : getWelcomeName()}
            />
          </div>
          <span className="text-sm font-medium hidden sm:inline-block">
            {getWelcomeName()}
          </span>
        </motion.button>
      </div>
    </div>
  );
}



function ProjectHighlightCard({ project, onClick }) {
  const deadline = project.Deadline ? new Date(project.Deadline) : null;
  const isOverdue = deadline && isPast(deadline) && project.Progress < 100;
  const progress = project.Progress || 0;
  
  return (
    <motion.div
      whileHover={{ 
        y: -8, 
        scale: 1.03,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
      className="relative group bg-white/5 border-[3px] border-white/20 rounded-lg p-4 cursor-pointer transition-all duration-300"
      onClick={onClick}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Premium glow effect that appears on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/0 via-primary/30 to-indigo-500/0 opacity-0 group-hover:opacity-20 blur-xl rounded-lg transition-opacity duration-700 ease-in-out" />
      
      {/* Corner highlight effect */}
      <div className="absolute -top-2 -right-2 h-10 w-10 bg-primary opacity-0 blur-xl rounded-full group-hover:opacity-40 transition-all duration-500" />
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium group-hover:text-primary transition-colors duration-300">{project.Name}</h3>
        <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
          <ArrowUpRight className="h-4 w-4 text-white group-hover:text-primary transition-colors" />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[40px] group-hover:text-white/90 transition-colors duration-300">
        {project.Description || 'No description provided'}
      </p>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span>Progress</span>
          <span 
            className="font-medium group-hover:text-primary transition-all duration-300"
          >
            {progress}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden transition-all duration-500 group-hover:h-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.1 }}
            className={cn(
              "h-full", 
              isOverdue ? "bg-red-500" : "bg-primary"
            )}
          />
        </div>
      </div>
      
      {deadline && (
        <div className="flex items-center mt-3 text-xs px-2 py-1 rounded-full bg-white/5 w-fit group-hover:bg-white/10 transition-all duration-300 group-hover:shadow-md">
          <Calendar className="h-3 w-3 mr-1.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          <span className={cn(
            "text-muted-foreground group-hover:text-white transition-colors duration-300",
            isOverdue && "text-red-400 group-hover:text-red-300"
          )}>
            {isOverdue ? 'Overdue' : isToday(deadline) ? 'Due today' : format(deadline, 'MMM d, yyyy')}
          </span>
        </div>
      )}
      
      {/* Bottom light bar that grows on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-in-out" />
    </motion.div>
  );
}
// Footer Quote component
function QuoteFooter() {
  const quotes = [
    {
      text: "Show me your calendar and I'll show you your priorities.",
      author: "Cal Newport"
    },
    {
      text: "You become what you consistently do.",
      author: "James Clear"
    },
    {
      text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
      author: "Stephen Covey"
    }
  ];
  
  // Choose a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="py-3 px-4 text-center text-sm text-muted-foreground/70 border-t border-white/5 mt-6"
    >
      "{randomQuote.text}" <span className="opacity-70">— {randomQuote.author}</span>
    </motion.div>
  );
}

// Main Dashboard
export default function DashboardRedesign() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function fetchProjects() {
      try {
        // Fetch user's projects from the backend
        const projectsData = await getCurrentUserProjects();
        console.log('Projects loaded:', projectsData);
        setProjects(projectsData || []);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjects();
  }, []);
  
  const goToCreateProject = () => {
    router.push('/projects/create');
  };
  
  const goToProject = (projectId) => {
    router.push(`/projects/${projectId}`);
  };
  
  // Get the top 3 projects for highlights
  const highlightProjects = projects.slice(0, 3);
  
  return (
    <div className="min-h-full pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <TopBar />
        
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <StatCards />
          </motion.div>
          
          {/* Project Highlights */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute -top-28 -right-28 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background/50 to-transparent pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Project Highlights
              </h2>
              
              {projects.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/projects')}
                >
                  View All
                </Button>
              )}
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-white/5 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {highlightProjects.map((project) => (
                  <ProjectHighlightCard 
                    key={project.Id} 
                    project={project} 
                    onClick={() => goToProject(project.Id)}
                  />
                ))}
              </div>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center mb-4">
                  <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md text-center">Create your first project to see highlights, trends and progress</p>
                <Button 
                  onClick={goToCreateProject}
                  className="bg-gradient-to-r from-primary to-indigo-600 shadow-lg shadow-primary/20"
                >
                  Create Project
                </Button>
              </div>
            )}
          </motion.div>
          
          {/* Activity Timeline */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Recent Activity
              </h2>
              {projects.length > 0 && (
                <Button variant="outline" size="sm">View All</Button>
              )}
            </div>
            
            {/* Empty state timeline */}
            <div className="relative pl-6 border-l border-white/10 py-2">
              <div className="absolute left-0 top-3 h-3 w-3 rounded-full bg-primary/30 ring-4 ring-primary/10"></div>
              <p className="text-sm text-muted-foreground">Your activity will appear here</p>
            </div>
          </motion.div>
        </motion.div>
        
        <QuoteFooter />
      </div>
    </div>
  );
}