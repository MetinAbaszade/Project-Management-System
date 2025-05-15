'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShieldAlert,
  Loader2,
  Save,
  HelpCircle,
  ClipboardList
} from 'lucide-react';

// API imports
import { getRiskById } from '@/api/RiskAPI';
import { createRiskResponsePlan } from '@/api/RiskAPI';
import { toast } from '@/lib/toast';

// Reuse the analysis form styles
import '../analysis/create/analysisForm.css';

// Response strategies based on the actual options
const RESPONSE_STRATEGIES = [
  'Avoid',
  'Mitigate',
  'Transfer',
  'Accept',
  'Exploit',
  'Share',
  'Enhance',
  'Contingent',
  'Other'
];

// Response status options
const RESPONSE_STATUSES = [
  'Not Started',
  'In Progress',
  'Completed'
];

export default function CreateRiskResponsePage() {
  const { id, riskId } = useParams();
  const router = useRouter();
  
  // States
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form state
  const [form, setForm] = useState({
    Strategy: 'Mitigate',
    Description: '',
    PlannedActions: '',
    Status: 'Not Started'
  });
  
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

  // Fetch risk data
  useEffect(() => {
    const fetchData = async () => {
      if (!riskId) return;
      
      setLoading(true);
      try {
        const riskData = await getRiskById(riskId as string);
        setRisk(riskData);
      } catch (error) {
        console.error('Error fetching risk:', error);
        toast.error('Could not load risk data');
        router.push(`/projects/${id}/risks/${riskId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, riskId, router]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => ({ ...prev, [name]: value }));
    
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
    
    if (!form.Strategy) {
      newErrors.Strategy = 'Response strategy is required';
    }
    
    if (!form.PlannedActions.trim()) {
      newErrors.PlannedActions = 'Planned actions are required';
    }
    
    if (!form.Status) {
      newErrors.Status = 'Status is required';
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
      const responseData = {
        RiskId: riskId as string,
        Strategy: form.Strategy,
        Description: form.Description,
        PlannedActions: form.PlannedActions,
        Status: form.Status,
        OwnerId: userId || undefined
      };
      
      // Create response plan
      await createRiskResponsePlan(responseData);
      
      toast.success('Response plan created successfully');
      router.push(`/projects/${id}/risks/${riskId}`);
    } catch (error) {
      console.error('Error creating response plan:', error);
      toast.error('Failed to create response plan');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to calculate the severity level
  const getSeverityLevel = () => {
    if (!risk) return { level: '', color: '' };
    
    const severity = risk.Severity || (risk.Probability * risk.Impact);
    
    if (severity >= 7) return { level: 'High', color: 'red' };
    if (severity >= 4) return { level: 'Medium', color: 'amber' };
    return { level: 'Low', color: 'green' };
  };
  
  const severityInfo = getSeverityLevel();

  // Loading state
  if (loading) {
    return (
      <div className="risk-analysis-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading risk data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-analysis-container">
      {/* Header */}
      <div className="mb-8 flex items-center">
        <button
          onClick={() => router.push(`/projects/${id}/risks/${riskId}`)}
          className="mr-4 p-2 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted transition-colors"
          aria-label="Back to risk details"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        
        <div>
          <h1 className="text-2xl font-bold">Add Response Plan</h1>
          <p className="text-muted-foreground mt-1">
            {risk?.Name} • {severityInfo.level} Severity Risk
          </p>
        </div>
      </div>
      
      {/* Risk Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card rounded-xl border shadow-sm overflow-hidden mb-6"
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Risk Summary</h2>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Probability</div>
              <div className="font-medium">{risk?.Probability ? `${Math.round(risk.Probability * 100)}%` : 'N/A'}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Impact</div>
              <div className="font-medium">{risk?.Impact ? `${risk.Impact}/10` : 'N/A'}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Severity</div>
              <div className={`font-medium text-${severityInfo.color}-600 dark:text-${severityInfo.color}-400`}>
                {risk?.Severity || (risk?.Probability && risk?.Impact ? (risk.Probability * risk.Impact).toFixed(1) : 'N/A')} 
              </div>
            </div>
          </div>
          
          {risk?.Description && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-1">Description:</div>
              <p className="text-sm">{risk.Description}</p>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="risk-analysis-form"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Response Plan Information Section */}
          <div className="risk-analysis-form-section">
            <h2 className="risk-analysis-form-section-title">Response Plan Information</h2>
            
            {/* Response Strategy */}
            <div className="risk-analysis-form-group">
              <label htmlFor="strategy" className="risk-analysis-form-label flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Response Strategy <span className="text-destructive">*</span>
                <div className="relative group">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  <div className="absolute left-0 -bottom-1 translate-y-full w-64 bg-popover p-3 rounded-md shadow-md text-xs text-muted-foreground invisible group-hover:visible z-10 border border-border">
                    <ul className="space-y-1">
                      <li><span className="font-medium">Avoid</span>: Eliminate the threat</li>
                      <li><span className="font-medium">Mitigate</span>: Reduce probability or impact</li>
                      <li><span className="font-medium">Transfer</span>: Shift impact to third party</li>
                      <li><span className="font-medium">Accept</span>: Acknowledge without action</li>
                    </ul>
                  </div>
                </div>
              </label>
              <select
                id="strategy"
                name="Strategy"
                value={form.Strategy}
                onChange={handleInputChange}
                className={`risk-analysis-form-select ${errors.Strategy ? 'border-destructive' : ''}`}
              >
                {RESPONSE_STRATEGIES.map(strategy => (
                  <option key={strategy} value={strategy}>{strategy}</option>
                ))}
              </select>
              {errors.Strategy && <p className="risk-analysis-form-error">{errors.Strategy}</p>}
            </div>
            
            {/* Description */}
            <div className="risk-analysis-form-group">
              <label htmlFor="description" className="risk-analysis-form-label">
                Description
              </label>
              <textarea
                id="description"
                name="Description"
                value={form.Description}
                onChange={handleInputChange}
                placeholder="Describe the response strategy and its rationale"
                rows={3}
                className="risk-analysis-form-textarea"
              ></textarea>
            </div>
            
            {/* Planned Actions */}
            <div className="risk-analysis-form-group">
              <label htmlFor="plannedActions" className="risk-analysis-form-label flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                Planned Actions <span className="text-destructive">*</span>
              </label>
              <textarea
                id="plannedActions"
                name="PlannedActions"
                value={form.PlannedActions}
                onChange={handleInputChange}
                placeholder="List the specific actions to be taken to implement this response strategy"
                rows={5}
                className={`risk-analysis-form-textarea ${errors.PlannedActions ? 'border-destructive' : ''}`}
              ></textarea>
              {errors.PlannedActions && <p className="risk-analysis-form-error">{errors.PlannedActions}</p>}
            </div>
            
            {/* Status */}
            <div className="risk-analysis-form-group">
              <label htmlFor="status" className="risk-analysis-form-label">
                Status <span className="text-destructive">*</span>
              </label>
              <select
                id="status"
                name="Status"
                value={form.Status}
                onChange={handleInputChange}
                className={`risk-analysis-form-select ${errors.Status ? 'border-destructive' : ''}`}
              >
                {RESPONSE_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.Status && <p className="risk-analysis-form-error">{errors.Status}</p>}
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push(`/projects/${id}/risks/${riskId}`)}
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Response Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}