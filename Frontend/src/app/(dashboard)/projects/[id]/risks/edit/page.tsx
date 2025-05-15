'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Save,
  Gauge,
  BarChart4
} from 'lucide-react';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { getRiskById, updateRisk } from '@/api/RiskAPI';
import { toast } from '@/lib/toast';

// Reuse the create risk form styles
import '../create/createRisk.css';

// Risk categories (these would ideally come from your API)
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

export default function EditRiskPage() {
  const { id, riskId } = useParams();
  const router = useRouter();
  
  // States
  const [project, setProject] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form state
  const [form, setForm] = useState({
    Name: '',
    Description: '',
    Category: '',
    Probability: 0,    // 0 to 1 value
    Impact: 1,         // 1 to 10 value
    Status: '',
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

  // Fetch risk and project data
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !riskId || !userId) return;
      
      setLoading(true);
      try {
        // Fetch risk and project in parallel
        const [riskData, projectData] = await Promise.all([
          getRiskById(riskId as string),
          getProjectById(id as string)
        ]);
        
        setRisk(riskData);
        setProject(projectData);
        
        // Initialize form with risk data
        setForm({
          Name: riskData.Name || '',
          Description: riskData.Description || '',
          Category: riskData.Category || 'Technical',
          Probability: riskData.Probability || 0.5,
          Impact: riskData.Impact || 5,
          Status: riskData.Status || 'Identified',
        });
        
        // Check permissions
        const isProjectOwner = projectData.OwnerId === userId;
        const isRiskOwner = riskData.OwnerId === userId;
        
        // If not owner, redirect back
        if (!isProjectOwner && !isRiskOwner) {
          toast.error('You do not have permission to edit this risk');
          router.push(`/projects/${id}/risk/${riskId}`);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Could not load risk data');
        router.push(`/projects/${id}/risk`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, riskId, userId, router]);

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
        Name: form.Name,
        Description: form.Description,
        Category: form.Category,
        Probability: form.Probability,
        Impact: form.Impact,
        Severity: severity,
        Status: form.Status,
      };
      
      // Update risk
      await updateRisk(riskId as string, riskData);
      
      toast.success('Risk updated successfully');
      router.push(`/projects/${id}/risk/${riskId}`);
    } catch (error) {
      console.error('Error updating risk:', error);
      toast.error('Failed to update risk');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to determine severity level and color
  const getSeverityLevel = () => {
    if (severity >= 7) return { level: 'High', color: 'red' };
    if (severity >= 4) return { level: 'Medium', color: 'amber' };
    return { level: 'Low', color: 'green' };
  };
  
  const severityInfo = getSeverityLevel();

  // Loading state
  if (loading) {
    return (
      <div className="risk-create-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading risk data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-create-container">
      {/* Header */}
      <div className="mb-8 flex items-center">
        <button
          onClick={() => router.push(`/projects/${id}/risk/${riskId}`)}
          className="mr-4 p-2 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted transition-colors"
          aria-label="Back to risk details"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        
        <div>
          <h1 className="text-2xl font-bold">Edit Risk</h1>
          <p className="text-muted-foreground mt-1">
            {project?.Name} • {risk?.Name}
          </p>
        </div>
      </div>
      
      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="risk-form"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Risk Information Section */}
          <div className="risk-form-section">
            <h2 className="risk-form-section-title">Risk Information</h2>
            
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
              {errors.Name && <p className="risk-form-error">{errors.Name}</p>}
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
                className="risk-form-input"
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
              {errors.Category && <p className="risk-form-error">{errors.Category}</p>}
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
            <h2 className="risk-form-section-title">Risk Assessment</h2>
            
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
                {errors.Probability && <p className="risk-form-error">{errors.Probability}</p>}
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
                {errors.Impact && <p className="risk-form-error">{errors.Impact}</p>}
              </div>
            </div>
            
            {/* Severity calculation (read-only) */}
            <div className="risk-severity-display mt-4 p-4 rounded-lg bg-muted">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Calculated Severity</h3>
                <div className={`px-2.5 py-1 text-xs font-medium rounded-full bg-${severityInfo.color}-100 text-${severityInfo.color}-800 dark:bg-${severityInfo.color}-900/20 dark:text-${severityInfo.color}-300`}>
                  {severityInfo.level}
                </div>
              </div>
              <div className="relative h-2 w-full bg-muted-foreground/20 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full bg-${severityInfo.color}-500 rounded-full`}
                  style={{ width: `${(severity / 10) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span>Severity: {severity.toFixed(2)}/10</span>
                <span>Formula: Probability ({form.Probability.toFixed(2)}) × Impact ({form.Impact})</span>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push(`/projects/${id}/risk/${riskId}`)}
              disabled={submitting}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}