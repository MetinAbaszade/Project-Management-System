'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Users,
  Percent,
  User,
  CheckCircle,
  AlertTriangle,
  Mail,
  Shield,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { launchConfetti } from '@/lib/confetti';
import { cn } from '@/lib/utils';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectStakeholders, createStakeholder } from '@/api/StakeholderAPI';
import { getCurrentUser } from '@/api/UserAPI';

export default function CreateStakeholderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [availablePercentage, setAvailablePercentage] = useState(100);
  
  // Form state
  const [form, setForm] = useState({
    Percentage: '10', // Default percentage
  });
  
  // Validation
  const [errors, setErrors] = useState<{
    Percentage?: string;
  }>({});

  // Fetch project data, user data, and current stakeholders
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      if (!id || typeof id !== 'string') {
        console.error('Invalid project ID:', id);
        toast.error('Invalid project ID');
        return;
      }

      console.log('Fetching data for project ID:', id);

      const [projectData, userDataRaw, stakeholdersData] = await Promise.all([
        getProjectById(id),
        getCurrentUser(),
        getProjectStakeholders(id)
      ]);

      const userData = userDataRaw?.Id
        ? userDataRaw
        : {
            Id: localStorage.getItem('userId') || 'user-123',
            FirstName: 'Current',
            LastName: 'User',
            Email: 'user@example.com',
            Role: 'Member',
            JobTitle: 'Team Member'
          };

      setCurrentUser(userData);
      setProject(projectData);
      setStakeholders(stakeholdersData);

      const total = stakeholdersData.reduce((acc, curr) => acc + curr.Percentage, 0);
      setTotalAllocation(total);
      setAvailablePercentage(100 - total);

      const isAlreadyStakeholder = stakeholdersData.some(s => s.UserId === userData.Id);
      if (isAlreadyStakeholder) {
        toast.info('You are already a stakeholder for this project');
        router.push(`/projects/${id}/stakeholders`);
      }

    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Could not load required data');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id, router]);

  // Update form.Percentage when availablePercentage changes
  useEffect(() => {
    if (availablePercentage < parseInt(form.Percentage)) {
      setForm(prev => ({ ...prev, Percentage: availablePercentage.toString() }));
    }
  }, [availablePercentage, form.Percentage]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {Percentage?: string} = {};
    
    const percentage = parseInt(form.Percentage);
    if (isNaN(percentage) || percentage <= 0) {
      newErrors.Percentage = 'Percentage must be a positive number';
    } else if (percentage > availablePercentage) {
      newErrors.Percentage = `Maximum available stake is ${availablePercentage}%`;
    }
    
    setErrors(newErrors);
    
    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    // Submit form
    setSubmitting(true);
    
    try {
      const stakeholderData = {
        ProjectId: id as string,
        UserId: currentUser.Id,
        Percentage: parseInt(form.Percentage)
      };
      
      await createStakeholder(stakeholderData);
      launchConfetti();
      toast.success('You are now a stakeholder!');
      router.push(`/projects/${id}/stakeholders`);
    } catch (error) {
      console.error('Failed to create stakeholder:', error);
      toast.error('Could not add you as a stakeholder');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    
    // Don't allow entering more than available percentage
    if (name === 'Percentage' && !isNaN(numValue)) {
      if (numValue > availablePercentage) {
        setForm(prev => ({ ...prev, [name]: availablePercentage.toString() }));
      } else {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Get stage color based on total allocation
  const getAllocationColor = () => {
    if (totalAllocation >= 100) return 'bg-red-500';
    if (totalAllocation >= 80) return 'bg-amber-500';
    if (totalAllocation >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8 flex items-center">
          <motion.button
            onClick={() => router.push(`/projects/${id}/stakeholders`)}
            className="mr-4 p-2 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted transition-colors"
            aria-label="Back to stakeholders"
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Become a Stakeholder</h1>
            <p className="text-muted-foreground">
              {project?.Name || 'Loading project'}
            </p>
          </div>
        </div>
        
        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm mb-6"
        >
          {loading ? (
            <div className="p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Current allocation banner */}
              <div className="w-full h-2 bg-muted">
                <motion.div
                  className={getAllocationColor()}
                  style={{ width: `${totalAllocation}%`, height: '100%' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${totalAllocation}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Project Stake Allocation</h2>
                  <div className={cn(
                    "text-sm font-medium px-3 py-1 rounded-full",
                    totalAllocation >= 100 
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                      : totalAllocation >= 80
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  )}>
                    {totalAllocation}% Allocated
                  </div>
                </div>
                
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Current Allocation</span>
                  <span className="font-medium">{totalAllocation}%</span>
                </div>
                
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Available</span>
                  <span className={cn(
                    "font-medium",
                    availablePercentage <= 0 
                      ? "text-red-600 dark:text-red-400" 
                      : availablePercentage <= 20
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-green-600 dark:text-green-400"
                  )}>
                    {availablePercentage}%
                  </span>
                </div>
                
                {availablePercentage <= 0 && (
                  <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">No Available Stake</p>
                      <p className="text-sm mt-1">This project has reached 100% stake allocation. You cannot become a stakeholder at this time.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
        
        {/* User Card */}
        {!loading && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm mb-6"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Your Details</h2>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {currentUser.ProfilePicture ? (
                    <img 
                      src={currentUser.ProfilePicture.FilePath} 
                      alt={`${currentUser.FirstName} ${currentUser.LastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {currentUser.FirstName} {currentUser.LastName}
                  </h3>
                  
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    <span>{currentUser.Email}</span>
                  </div>
                  
                  {currentUser.JobTitle && (
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                      <Shield className="h-3.5 w-3.5 mr-1.5" />
                      <span>{currentUser.JobTitle}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Form section */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Stake Details</h2>
                
                <div className="space-y-2 mb-6">
                  <label htmlFor="Percentage" className="block text-sm font-medium text-foreground">
                    Stake Percentage
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type="number"
                      id="Percentage"
                      name="Percentage"
                      value={form.Percentage}
                      onChange={handleChange}
                      min="1"
                      max={availablePercentage}
                      disabled={availablePercentage <= 0}
                      className={`block w-full pl-10 pr-3 py-3 bg-muted text-foreground placeholder-muted-foreground border ${
                        errors.Percentage ? 'border-red-500' : 'border-border'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    />
                  </div>
                  {errors.Percentage && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.Percentage}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your desired stake percentage (max: {availablePercentage}%).
                  </p>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg border border-border mb-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Important Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    By becoming a stakeholder, you agree to the project terms and conditions. 
                    Your stake grants you certain rights and responsibilities in the project governance.
                  </p>
                  
                  <motion.button
                    type="button"
                    className="text-xs flex items-center text-primary mt-3 hover:underline"
                    whileHover={{ x: 3 }}
                  >
                    <span>Read stakeholder agreement</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </motion.button>
                </div>
                
                <div className="flex justify-end gap-3">
                  <motion.button
                    type="button"
                    onClick={() => router.push(`/projects/${id}/stakeholders`)}
                    className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    disabled={submitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      availablePercentage <= 0 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                    disabled={submitting || availablePercentage <= 0}
                    whileHover={availablePercentage > 0 ? { scale: 1.05 } : {}}
                    whileTap={availablePercentage > 0 ? { scale: 0.95 } : {}}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Become a Stakeholder</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}