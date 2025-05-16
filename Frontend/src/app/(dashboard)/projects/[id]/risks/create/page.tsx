// Frontend/src/app/(dashboard)/projects/[id]/risks/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Loader2,
  Save,
  Gauge,
  BarChart4,
  AlertCircle
} from 'lucide-react';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { createRisk } from '@/api/RiskAPI';
import { toast } from '@/lib/toast';

// CSS
import './createRisk.css';

// Risk categories
const RISK_CATEGORIES = [
  'Technical',
  'Schedule',
  'Cost',
  'Resource',
  'Quality',
  'Stakeholder',
  'Scope',
  'Operational',
  'External',
  'Regulatory',
  'Security',
  'Other'
];

// Risk statuses
const RISK_STATUSES = [
  'Identified',
  'Analyzing',
  'Monitoring',
  'Mitigating',
  'Resolved'
];

export default function CreateRiskPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // States
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    Name: '',
    Description: '',
    Category: 'Technical',
    Probability: 0.5,    // 0 to 1 value
    Impact: 5,         // 1 to 10 value
    Status: 'Identified',
  });
  
  // Derived values
  const severity = form.Probability * form.Impact;
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get user ID from JWT token
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setUserId(decoded.sub || decoded.id || decoded.userId);
      } else {
        // No token, redirect to login
        toast.error('Authentication required');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      toast.error('Authentication error');
      router.push('/login');
    }
  }, [router]);

  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !userId) return;
      
      setLoading(true);
      try {
        const projectData = await getProjectById(id as string);
        
        setProject(projectData);
        
        // Check if user is project owner
        const isOwner = projectData.OwnerId === userId;
        setIsProjectOwner(isOwner);
        
        // If not owner, redirect back
        if (!isOwner) {
          toast.error('Only project owners can create risks');
          router.push(`/projects/${id}/risks`);
        }
        
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Could not load project data');
        router.push(`/projects/${id}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, userId, router]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle special cases for validation
    if (name === 'Probability') {
      // Ensure probability is between 0 and 1
      const probability = parseFloat(value);
      if (probability < 0) return;
      if (probability > 1) return;
      setForm(prev => ({ ...prev, [name]: probability }));
    } else if (name === 'Impact') {
      // Ensure impact is between 1 and 10
      const impact = parseInt(value);
      if (impact < 1) return;
      if (impact > 10) return;
      setForm(prev => ({ ...prev, [name]: impact }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.Name.trim()) {
      newErrors.Name = 'Risk name is required';
    }
    
    if (!form.Category) {
      newErrors.Category = 'Please select a category';
    }
    
    if (form.Probability < 0 || form.Probability > 1) {
      newErrors.Probability = 'Probability must be between 0 and 1';
    }
    
    if (form.Impact < 1 || form.Impact > 10) {
      newErrors.Impact = 'Impact must be between 1 and 10';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare data for API
      const riskData = {
        ProjectId: id as string,
        Name: form.Name,
        Description: form.Description,
        Category: form.Category,
        Probability: form.Probability,
        Impact: form.Impact,
        Severity: severity,
        OwnerId: userId || undefined,
        Status: form.Status
      };
      
      // Create risk
      await createRisk(riskData);
      
      toast.success('Risk created successfully');
      router.push(`/projects/${id}/risks`);
    } catch (error) {
      console.error('Error creating risk:', error);
      toast.error('Failed to create risk');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to determine severity level and color
  const getSeverityLevel = () => {
    if (severity >= 7) return { level: 'High', color: 'destructive' };
    if (severity >= 4) return { level: 'Medium', color: 'warning' };
    return { level: 'Low', color: 'success' };
  };
  
  const severityInfo = getSeverityLevel();

  // Loading state
  if (loading) {
    return (
      <div className="risk-create-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (!isProjectOwner) {
    return (
      <div className="risk-create-container flex items-center justify-center min-h-[60vh]">
        <div className="bg-card rounded-xl p-8 max-w-md w-full text-center space-y-4 border shadow-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">Only project owners can create risks for this project.</p>
          <button 
            onClick={() => router.push(`/projects/${id}/risks`)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Risks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-create-container">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex items-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/projects/${id}/risks`)}
          className="mr-4 p-2 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted transition-colors"
          aria-label="Back to risks"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </motion.button>
        
        <div>
          <h1 className="text-2xl font-bold">Create New Risk</h1>
          <p className="text-muted-foreground mt-1">
            {project?.Name} • Add a new risk to your project
          </p>
        </div>
      </motion.div>
      
      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="risk-form"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Risk Information Section */}
          <div className="risk-form-section">
            <h2 className="risk-form-section-title">
              <Shield className="h-5 w-5" />
              Risk Information
            </h2>
            
            {/* Name */}
            <div className="risk-form-group">
              <label htmlFor="name" className="risk-form-label">
                Risk Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                name="Name"
                type="text"
                value={form.Name}
                onChange={handleInputChange}
                placeholder="Enter risk name"
                className={`risk-form-input ${errors.Name ? 'border-destructive' : ''}`}
              />
              {errors.Name && (
                <p className="risk-form-error">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.Name}
                </p>
              )}
            </div>
            
            {/* Description */}
            <div className="risk-form-group">
              <label htmlFor="description" className="risk-form-label">
                Description
              </label>
              <textarea
                id="description"
                name="Description"
                value={form.Description}
                onChange={handleInputChange}
                placeholder="Describe the risk, its potential impact, and any relevant information"
                rows={4}
                className="risk-form-textarea"
              />
            </div>
            
            {/* Category */}
            <div className="risk-form-group">
              <label htmlFor="category" className="risk-form-label">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                id="category"
                name="Category"
                value={form.Category}
                onChange={handleInputChange}
                className={`risk-form-select ${errors.Category ? 'border-destructive' : ''}`}
              >
                {RISK_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.Category && (
                <p className="risk-form-error">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.Category}
                </p>
              )}
            </div>
            
            {/* Status */}
            <div className="risk-form-group">
              <label htmlFor="status" className="risk-form-label">
                Status
              </label>
              <select
                id="status"
                name="Status"
                value={form.Status}
                onChange={handleInputChange}
                className="risk-form-select"
              >
                {RISK_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Risk Assessment Section */}
          <div className="risk-form-section">
            <h2 className="risk-form-section-title">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment
            </h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Probability */}
              <div className="risk-form-group">
                <label htmlFor="probability" className="risk-form-label flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  Probability <span className="text-destructive">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    id="probability"
                    name="Probability"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={form.Probability}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span>0%</span>
                    <span className="font-semibold">{Math.round(form.Probability * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>
                {errors.Probability && (
                  <p className="risk-form-error">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.Probability}
                  </p>
                )}
              </div>
              
              {/* Impact */}
              <div className="risk-form-group">
                <label htmlFor="impact" className="risk-form-label flex items-center gap-2">
                  <BarChart4 className="h-4 w-4 text-primary" />
                  Impact <span className="text-destructive">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    id="impact"
                    name="Impact"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={form.Impact}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span>Low (1)</span>
                    <span className="font-semibold">{form.Impact}/10</span>
                    <span>High (10)</span>
                  </div>
                </div>
                {errors.Impact && (
                  <p className="risk-form-error">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.Impact}
                  </p>
                )}
              </div>
            </div>
            
            {/* Severity calculation (read-only) */}
            <motion.div 
              animate={{
                backgroundColor: severityInfo.level === 'High' 
                  ? "hsla(var(--destructive) / 0.1)" 
                  : severityInfo.level === 'Medium' 
                  ? "hsla(var(--warning) / 0.1)" 
                  : "hsla(var(--success) / 0.1)"
              }}
              transition={{ duration: 0.3 }}
              className="risk-severity-display mt-4 p-4 rounded-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Calculated Severity</h3>
                <div className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  severityInfo.level === 'High' 
                    ? "bg-destructive/20 text-destructive" 
                    : severityInfo.level === 'Medium' 
                    ? "bg-warning/20 text-warning" 
                    : "bg-success/20 text-success"
                }`}>
                  {severityInfo.level}
                </div>
              </div>
              <div className="relative h-2 w-full bg-muted-foreground/20 rounded-full overflow-hidden">
                <motion.div 
                  className={`absolute top-0 left-0 h-full rounded-full ${
                    severityInfo.level === 'High' 
                      ? "bg-destructive" 
                      : severityInfo.level === 'Medium' 
                      ? "bg-warning" 
                      : "bg-success"
                  }`}
                  animate={{ width: `${(severity / 10) * 100}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span>Severity: {severity.toFixed(2)}/10</span>
                <span>Formula: Probability ({form.Probability.toFixed(2)}) × Impact ({form.Impact})</span>
              </div>
            </motion.div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => router.push(`/projects/${id}/risks`)}
              disabled={submitting}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Cancel
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Risk</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}