'use client';

import './createTeam.css'
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Users,
  CheckCircle,
  PlusCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/toast';
import { useTheme } from '@/hooks/useTheme'; 

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { createTeam } from '@/api/TeamAPI';
import { useAuth } from '@/contexts/AuthContext';

const TEAM_COLORS = [
  { index: 0, bg: '#FF2D55', name: 'Red' },
  { index: 1, bg: '#FF9500', name: 'Orange' },
  { index: 2, bg: '#FFCC00', name: 'Yellow' },
  { index: 3, bg: '#34C759', name: 'Green' },
  { index: 4, bg: '#5AC8FA', name: 'Sky Blue' },
  { index: 5, bg: '#007AFF', name: 'Royal Blue' }, // Default
  { index: 6, bg: '#5856D6', name: 'Purple' },
  { index: 7, bg: '#AF52DE', name: 'Violet' },
  { index: 8, bg: '#FF375F', name: 'Pink' },
  { index: 9, bg: '#8E8E93', name: 'Gray' },
];

export default function CreateTeamPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme(); // Get current theme
  
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
  const getUserIdFromToken = useCallback(() => {
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
  }, []);
  
  // Fetch project data and check permissions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setServerError(null);
        
        // Fetch project data
        const projectData = await getProjectById(projectId);
        console.log("Project data fetched:", projectData);
        setProject(projectData);
        
        // Check if current user is project owner
        let userId = user?.Id;
        if (!userId) {
          userId = getUserIdFromToken();
          console.log("Using userId from token:", userId);
        }
        
        // Update form with project ID to ensure it's correct
        setForm(prev => ({
          ...prev,
          ProjectId: projectId
        }));
        
        const userIsOwner = userId === projectData.OwnerId;
        console.log("Is user owner?", userIsOwner, { userId, ownerId: projectData.OwnerId });
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
  }, [projectId, user, router, getUserIdFromToken]);
  
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
    
    // Log what we're sending
    const payload = {
      Name: form.Name,
      Description: form.Description || "", // Send empty string instead of undefined
      ColorIndex: form.ColorIndex,
      ProjectId: projectId
    };
    
    console.log("Creating team with payload:", payload);
    
    try {
      // Create team with all form data
      const team = await createTeam(payload);
      console.log("Team created successfully:", team);
      
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
        console.log("Error response status:", error.response.status);
        
        // Handle 422 specifically (validation error)
        if (error.response.status === 422) {
          try {
            const errorDetail = error.response.data?.detail;
            if (Array.isArray(errorDetail)) {
              // API returns array of validation errors
              errorMsg = errorDetail.map(item => item.msg || 'Validation error').join(', ');
              console.log("Validation errors:", errorDetail);
            } else if (typeof errorDetail === 'string') {
              errorMsg = errorDetail;
            } else {
              errorMsg = 'Validation failed. Please check your input.';
            }
          } catch (parseError) {
            console.error("Error parsing validation errors:", parseError);
            errorMsg = 'Validation error occurred';
          }
        } else {
          // General error with response
          errorMsg = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMsg = 'No response from server. Please check your connection.';
      } else if (error.message) {
        // Error in setting up the request
        errorMsg = error.message;
      }
      
      setServerError(errorMsg);
      
      // Use a setTimeout to avoid React state updates during render
      setTimeout(() => {
        toast.error(`Failed to create team: ${errorMsg}`);
      }, 0);
      
      setSubmitting(false);
    }
  };
  
  // If not the project owner (after check), return null
  if (!loading && !isOwner) {
    return null;
  }

  return (
    <div className="ios-design-container">
      <div className="ios-card-container">
        {/* Card Header with back button */}
        <div className="ios-card-header">
          <button 
            className="ios-back-button" 
            onClick={() => router.push(`/projects/${projectId}/team`)}
            type="button"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          
          <h1 className="ios-card-title">Create New Team</h1>
        </div>
        
        {/* Server error message */}
        <AnimatePresence>
          {serverError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="ios-error-banner"
            >
              <AlertCircle size={16} />
              <span>{serverError}</span>
              <button 
                onClick={() => setServerError(null)}
                className="ios-error-close"
                type="button"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Content */}
        {loading ? (
          <div className="ios-loading-container">
            <div className="ios-loading-spinner"></div>
            <p>Loading project details...</p>
          </div>
        ) : (
          <div className="ios-create-form">
            <div className="ios-form-row">
              <label className="ios-form-label">Project</label>
              <div className="ios-form-value">{project?.Name || 'Unknown Project'}</div>
            </div>
            
            {/* Team Preview */}
            <div className="ios-preview-section">
              <div 
                className="ios-team-avatar"
                style={{ backgroundColor: TEAM_COLORS[form.ColorIndex].bg }}
              >
                {getTeamInitials(form.Name) || <Users size={24} strokeWidth={1.5} />}
              </div>
              
              <div className="ios-preview-details">
                <h3 className="ios-preview-title">
                  {form.Name || 'Team Name'}
                </h3>
                <p className="ios-preview-description">
                  {form.Description || 'Team description will appear here'}
                </p>
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="ios-form-group">
              <div className="ios-form-field">
                <label htmlFor="Name" className="ios-field-label">
                  Team Name <span className="ios-required">*</span>
                </label>
                <input
                  type="text"
                  id="Name"
                  name="Name"
                  value={form.Name}
                  onChange={handleInputChange}
                  placeholder="Enter team name"
                  className={`ios-text-input ${errors.Name ? 'ios-input-error' : ''}`}
                  maxLength={50}
                  autoFocus
                />
                <AnimatePresence>
                  {errors.Name && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ios-error-message"
                    >
                      {errors.Name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="ios-form-field">
                <label htmlFor="Description" className="ios-field-label">
                  Description
                </label>
                <textarea
                  id="Description"
                  name="Description"
                  value={form.Description}
                  onChange={handleInputChange}
                  placeholder="Enter team description (optional)"
                  className="ios-textarea"
                  rows={3}
                  maxLength={200}
                ></textarea>
              </div>
            </div>
            
            {/* Color Selection */}
            <div className="ios-form-field">
              <label className="ios-field-label">
                Team Color
              </label>
              <div className="ios-color-grid">
                {TEAM_COLORS.map((color) => (
                  <motion.button
                    key={color.index}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`ios-color-option ${form.ColorIndex === color.index ? 'ios-color-selected' : ''}`}
                    style={{ backgroundColor: color.bg }}
                    onClick={() => handleColorSelect(color.index)}
                    aria-label={`Select ${color.name} color`}
                  >
                    {form.ColorIndex === color.index && (
                      <CheckCircle className="ios-color-check" size={16} />
                    )}
                  </motion.button>
                ))}
              </div>
              <div className="ios-color-name">
                {TEAM_COLORS[form.ColorIndex].name}
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="ios-form-actions">
              <motion.button
                type="button"
                className="ios-cancel-button"
                onClick={() => router.push(`/projects/${projectId}/team`)}
                disabled={submitting || showSuccess}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              
              <motion.button
                type="button"
                className={`ios-create-button ${showSuccess ? 'ios-success' : ''}`}
                onClick={handleSubmit}
                disabled={submitting || showSuccess}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showSuccess ? (
                  <CheckCircle size={20} />
                ) : submitting ? (
                  <div className="ios-spinner-small"></div>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    <span>Create Team</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}