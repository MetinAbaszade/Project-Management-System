// Path: Frontend/src/app/(dashboard)/projects/[id]/stakeholders/create/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Users,
  Percent,
  User,
  CheckCircle,
  AlertTriangle,
  Mail,
  Shield,
  ExternalLink,
  Search,
  X
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { launchConfetti } from '@/lib/confetti';
import { cn } from '@/lib/utils';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectStakeholders, createStakeholder, searchUsers } from '@/api/StakeholderAPI';
import { getCurrentUser } from '@/api/UserAPI';

export default function CreateStakeholderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [availablePercentage, setAvailablePercentage] = useState(100);
  
  // Form state
  const [form, setForm] = useState({
    Percentage: '10', // Default percentage
  });
  
  // User search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Validation
  const [errors, setErrors] = useState<{
    Percentage?: string;
    User?: string;
  }>({});

  // Fetch project data and stakeholders
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

        const [projectData, stakeholdersData] = await Promise.all([
          getProjectById(id),
          getProjectStakeholders(id)
        ]);

        setProject(projectData);
        setStakeholders(stakeholdersData);

        const total = stakeholdersData.reduce((acc, curr) => acc + curr.Percentage, 0);
        setTotalAllocation(total);
        setAvailablePercentage(100 - total);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Could not load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle search query
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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
    const newErrors: {Percentage?: string; User?: string} = {};
    
    if (!selectedUser) {
      newErrors.User = 'Please select a user';
    }
    
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
        UserId: selectedUser.Id,
        Percentage: parseInt(form.Percentage)
      };
      
      await createStakeholder(stakeholderData);
      launchConfetti();
      toast.success('Stakeholder added successfully!');
      router.push(`/projects/${id}/stakeholders`);
    } catch (error) {
      console.error('Failed to create stakeholder:', error);
      toast.error('Could not add stakeholder');
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

  // Select a user from search results
  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
    
    // Clear user error
    if (errors.User) {
      setErrors(prev => ({ ...prev, User: undefined }));
    }
  };

  // Clear selected user
  const handleClearUser = () => {
    setSelectedUser(null);
  };

  // Get stage color based on total allocation
  const getAllocationColor = () => {
    if (totalAllocation >= 100) return 'bg-red-500';
    if (totalAllocation >= 80) return 'bg-amber-500';
    if (totalAllocation >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Check if user is already a stakeholder
  const isUserAlreadyStakeholder = (userId: string) => {
    return stakeholders.some(s => s.UserId === userId);
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
            <h1 className="text-2xl font-bold tracking-tight">Add Stakeholder</h1>
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
                      <p className="text-sm mt-1">This project has reached 100% stake allocation. You cannot add a stakeholder at this time.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
        
        {/* Form section */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Stakeholder Details</h2>
                
                {/* User search */}
                <div className="space-y-2 mb-6">
                  <label htmlFor="userSearch" className="block text-sm font-medium text-foreground">
                    Find User
                  </label>
                  {selectedUser ? (
                    <div className="bg-muted/40 p-4 rounded-lg border border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedUser.FirstName} {selectedUser.LastName}</p>
                          <p className="text-sm text-muted-foreground">{selectedUser.Email}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={handleClearUser}
                        className="p-1.5 rounded-full hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                          type="text"
                          id="userSearch"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className={`block w-full pl-10 pr-3 py-3 bg-muted text-foreground placeholder-muted-foreground border ${
                            errors.User ? 'border-red-500' : 'border-border'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                          placeholder="Search by name or email"
                          disabled={availablePercentage <= 0}
                        />
                      </div>
                      
                      {errors.User && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {errors.User}
                        </p>
                      )}
                      
                      {searching && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Searching users...
                        </div>
                      )}
                      
                      <AnimatePresence>
                        {searchResults.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 border border-border rounded-lg overflow-hidden max-h-60 overflow-y-auto"
                          >
                            {searchResults.map(user => {
                              const isAlreadyStakeholder = isUserAlreadyStakeholder(user.Id);
                              return (
                                <motion.div
                                  key={user.Id}
                                  className={cn(
                                    "p-3 border-b border-border last:border-b-0 flex items-center justify-between",
                                    isAlreadyStakeholder 
                                      ? "bg-muted/50 cursor-not-allowed"
                                      : "hover:bg-muted/40 cursor-pointer"
                                  )}
                                  onClick={() => {
                                    if (!isAlreadyStakeholder) {
                                      handleSelectUser(user);
                                    }
                                  }}
                                  whileHover={{ 
                                    backgroundColor: isAlreadyStakeholder ? undefined : 'rgba(var(--primary-rgb), 0.1)',
                                    x: isAlreadyStakeholder ? 0 : 3
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{user.FirstName} {user.LastName}</p>
                                      <p className="text-xs text-muted-foreground">{user.Email}</p>
                                    </div>
                                  </div>
                                  
                                  {isAlreadyStakeholder && (
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Already a stakeholder</span>
                                  )}
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                
                {/* Percentage field */}
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
                    Enter the desired stake percentage (max: {availablePercentage}%).
                  </p>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg border border-border mb-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Important Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    By adding a stakeholder, you grant them certain rights and responsibilities in the project governance.
                    The total stake allocation cannot exceed 100%.
                  </p>
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
                      availablePercentage <= 0 || !selectedUser
                        ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                    disabled={submitting || availablePercentage <= 0 || !selectedUser}
                    whileHover={availablePercentage > 0 && selectedUser ? { scale: 1.05 } : {}}
                    whileTap={availablePercentage > 0 && selectedUser ? { scale: 0.95 } : {}}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Add Stakeholder</span>
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