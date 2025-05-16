'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Users,
  CheckCircle,
  PlusCircle,
  AlertCircle,
  X,
  Check,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { createTeam } from '@/api/TeamAPI';
import { useAuth } from '@/contexts/AuthContext';


const TEAM_COLORS = [
  { index: 0, name: 'Ruby Red', gradient: 'from-rose-500 to-red-500' },
  { index: 1, name: 'Sunset Orange', gradient: 'from-orange-400 to-orange-600' },
  { index: 2, name: 'Golden Amber', gradient: 'from-amber-400 to-yellow-600' },
  { index: 3, name: 'Verdant Green', gradient: 'from-green-400 to-emerald-600' },
  { index: 4, name: 'Ocean Blue', gradient: 'from-blue-400 to-sky-600' },
  { index: 5, name: 'Royal Indigo', gradient: 'from-indigo-500 to-purple-600' },
  { index: 6, name: 'Vibrant Purple', gradient: 'from-purple-400 to-violet-600' },
  { index: 7, name: 'Fuchsia Pink', gradient: 'from-pink-400 to-rose-600' },
  { index: 8, name: 'Slate Gray', gradient: 'from-slate-400 to-slate-600' },
  { index: 9, name: 'Ocean Teal', gradient: 'from-teal-400 to-cyan-600' },
];

export default function CreateTeamPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  // States
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    Name: '',
    Description: '',
    ColorIndex: 5, // Default to blue
    ProjectId: projectId
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Get team initials from name
  const getTeamInitials = (name) => {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
  };
  
  // Get user ID from JWT token as fallback
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.sub || payload.id || payload.userId;
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  };
  
  // Fetch project data and check permissions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setServerError(null);
        
        // Fetch project data
        const projectData = await getProjectById(projectId);
        setProject(projectData);
        
        // Check if current user is project owner
        let userId = user?.Id;
        if (!userId) {
          userId = getUserIdFromToken();
        }
        
        // Update form with project ID to ensure it's correct
        setForm(prev => ({
          ...prev,
          ProjectId: projectId
        }));
        
        const userIsOwner = userId === projectData.OwnerId;
        setIsOwner(userIsOwner);
        
        if (!userIsOwner) {
          // Redirect if not the owner
          toast.error('Only project owners can create teams');
          router.push(`/projects/${projectId}/team`);
          return;
        }
      } catch (error) {
        console.error('Failed to load project data:', error);
        setServerError(error.message || 'Could not load project data');
        toast.error('Could not load project data');
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      loadData();
    }
  }, [projectId, user, router]);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Reset related field errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle color selection
  const handleColorSelect = (colorIndex) => {
    setForm(prev => ({ ...prev, ColorIndex: colorIndex }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.Name.trim()) {
      newErrors.Name = 'Team name is required';
    } else if (form.Name.length > 50) {
      newErrors.Name = 'Team name cannot exceed 50 characters';
    }
    
    if (form.Description && form.Description.length > 200) {
      newErrors.Description = 'Description cannot exceed 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setServerError(null);
    
    // Prepare payload
    const payload = {
      Name: form.Name,
      Description: form.Description || "", // Send empty string instead of undefined
      ColorIndex: form.ColorIndex,
      ProjectId: projectId
    };
    
    try {
      // Create team with all form data
      const team = await createTeam(payload);
      
      // Show success animation before redirecting
      setShowSuccess(true);
      
      // Brief delay for animation
      setTimeout(() => {
        toast.success('Team created successfully');
        router.push(`/projects/${projectId}/team/${team.Id}`);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to create team:', error);
      let errorMsg = 'Could not create team';
      
      // Try to extract meaningful error information
      if (error?.response) {
        if (error.response.status === 422) {
          try {
            const errorDetail = error.response.data?.detail;
            if (Array.isArray(errorDetail)) {
              errorMsg = errorDetail.map(item => item.msg || 'Validation error').join(', ');
            } else if (typeof errorDetail === 'string') {
              errorMsg = errorDetail;
            } else {
              errorMsg = 'Validation failed. Please check your input.';
            }
          } catch (parseError) {
            errorMsg = 'Validation error occurred';
          }
        } else {
          errorMsg = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMsg = 'No response from server. Please check your connection.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setServerError(errorMsg);
      toast.error(`Failed to create team: ${errorMsg}`);
      setSubmitting(false);
    }
  };

  // Team colors with theme support
  const TEAM_COLORS = [
    { name: 'Ruby Red', gradient: 'from-rose-500 to-red-500' },
    { name: 'Sunset Orange', gradient: 'from-orange-400 to-orange-600' },
    { name: 'Golden Amber', gradient: 'from-amber-400 to-yellow-600' },
    { name: 'Verdant Green', gradient: 'from-green-400 to-emerald-600' },
    { name: 'Ocean Blue', gradient: 'from-blue-400 to-sky-600' },
    { name: 'Royal Indigo', gradient: 'from-indigo-500 to-purple-600' },
    { name: 'Vibrant Purple', gradient: 'from-purple-400 to-violet-600' },
    { name: 'Fuchsia Pink', gradient: 'from-pink-400 to-rose-600' },
    { name: 'Slate Gray', gradient: 'from-slate-400 to-slate-600' },
    { name: 'Ocean Teal', gradient: 'from-teal-400 to-cyan-600' },
  ];


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 sm:p-6 md:p-8">
      <motion.div 

        className="bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg max-w-xl w-full overflow-hidden"

        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Card Header */}

        <div className="flex items-center justify-between px-6 py-4 bg-card/90 border-b border-border/50">
          <div className="flex items-center gap-2">
            <motion.button 
              onClick={() => router.push(`/projects/${projectId}/team`)}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={18} />
            </motion.button>
            <h1 className="text-xl font-semibold text-foreground">Create New Team</h1>

          </div>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Server error message */}
            <AnimatePresence>
              {serverError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-500/10 rounded-xl flex items-center gap-3 text-sm"
                >
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                  <span className="text-red-500">{serverError}</span>
                  <button 
                    type="button"
                    onClick={() => setServerError(null)}
                    className="ml-auto p-1 text-red-500/70 hover:text-red-500 rounded-full hover:bg-red-500/10"

                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Project Info */}

            <div className="bg-muted/30 backdrop-blur-sm p-4 rounded-xl flex items-center mb-6">

              <div className="bg-primary/10 p-2 rounded-md mr-3">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Project</div>

                <div className="font-medium text-foreground">{project?.Name || 'Loading...'}</div>

              </div>
            </div>
            
            {/* Team Preview */}
            <div className="mb-6">

              <label className="block text-sm font-medium mb-2 text-foreground">Team Preview</label>
              <div className="bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl p-4 flex items-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TEAM_COLORS[form.ColorIndex].gradient} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                  {getTeamInitials(form.Name) || <Users size={20} />}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <h3 className="font-medium truncate text-foreground">

                    {form.Name || 'Team Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {form.Description || 'Team description will appear here'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="Name" className="block text-sm font-medium mb-2 text-foreground">
                  Team Name <span className="text-red-500">*</span>

                </label>
                <input
                  id="Name"
                  name="Name"
                  type="text"
                  value={form.Name}
                  onChange={handleInputChange}
                  placeholder="Enter team name"
                  className={cn(

                    "w-full p-3 rounded-xl border backdrop-blur-sm bg-background/50 text-foreground transition-colors focus:ring-1 focus:ring-primary focus:outline-none",
                    errors.Name
                      ? "border-red-500"
                      : "border-border/50"

                  )}
                  maxLength={50}
                  autoFocus
                />
                <AnimatePresence>
                  {errors.Name && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-sm mt-1"

                    >
                      {errors.Name}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="text-xs text-muted-foreground mt-1">
                  {50 - (form.Name?.length || 0)} characters remaining
                </div>
              </div>
              
              {/* Description Field */}
              <div>
                <label htmlFor="Description" className="block text-sm font-medium mb-2 text-foreground">

                  Description
                </label>
                <textarea
                  id="Description"
                  name="Description"
                  value={form.Description}
                  onChange={handleInputChange}
                  placeholder="Enter team description (optional)"
                  className={cn(
                    "w-full p-3 rounded-xl border border-border/50 backdrop-blur-sm bg-background/50 text-foreground transition-colors resize-none focus:ring-1 focus:ring-primary focus:outline-none",
                    errors.Description ? "border-red-500" : ""

                  )}
                  rows={3}
                  maxLength={200}
                ></textarea>
                <AnimatePresence>
                  {errors.Description && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-sm mt-1"

                    >
                      {errors.Description}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="text-xs text-muted-foreground mt-1">
                  {200 - (form.Description?.length || 0)} characters remaining
                </div>
              </div>
              
              {/* Team Color */}
              <div>

                <label className="flex items-center gap-2 text-sm font-medium mb-3 text-foreground">

                  <Palette size={16} className="text-muted-foreground" />
                  Team Color
                </label>
                <div className="grid grid-cols-5 gap-3 mb-2">

                  {TEAM_COLORS.map((color, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "aspect-square rounded-xl bg-gradient-to-br",
                        color.gradient,
                        form.ColorIndex === index ? 
                          "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                      )}
                      onClick={() => handleColorSelect(index)}
                      aria-label={`Select ${color.name} color`}
                    >
                      {form.ColorIndex === index && (

                        <Check className="text-white drop-shadow-md" size={18} />
                      )}
                    </motion.button>
                  ))}
                </div>
                <div className="text-sm text-center text-foreground">

                  {TEAM_COLORS[form.ColorIndex].name}
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="mt-8 flex gap-3">
              <motion.button
                type="button"
                className="flex-1 py-2.5 px-4 bg-muted/50 backdrop-blur-sm hover:bg-muted text-foreground rounded-full transition-colors"

                onClick={() => router.push(`/projects/${projectId}/team`)}
                disabled={submitting || showSuccess}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Cancel
              </motion.button>
              
              <motion.button
                type="submit"
                className={cn(

                  "flex-1 py-2.5 px-4 rounded-full transition-colors flex items-center justify-center gap-2",
                  showSuccess 
                    ? "bg-green-500 text-white" 

                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                disabled={submitting || showSuccess}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {showSuccess ? (
                  <>
                    <CheckCircle size={18} />
                    Created!
                  </>
                ) : submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    Create Team
                  </>
                )}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}