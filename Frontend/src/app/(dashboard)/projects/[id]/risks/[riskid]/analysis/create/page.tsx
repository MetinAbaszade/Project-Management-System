'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart,
  Loader2,
  Save,
  HelpCircle,
  Calculator
} from 'lucide-react';

// API imports
import { getRiskById } from '@/api/RiskAPI';
import { createRiskAnalysis } from '@/api/RiskAPI';
import { toast } from '@/lib/toast';

// Styles
import "/analysisForm.css";

// Analysis types
const ANALYSIS_TYPES = [
  'Qualitative',
  'Quantitative',
  'SWOT',
  'Decision Tree',
  'Sensitivity',
  'Monte Carlo',
  'Expected Value',
  'Root Cause',
  'Other'
];

export default function CreateRiskAnalysisPage() {
  const { id, riskId } = useParams();
  const router = useRouter();
  
  // States
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form state
  const [form, setForm] = useState({
    AnalysisType: 'Qualitative',
    MatrixScore: '',
    ExpectedValue: 0,
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
        
        // Calculate default expected value if risk data has probability and impact
        if (riskData.Probability !== undefined && riskData.Impact !== undefined) {
          // Simulated potential loss amount - in a real application this might be a separate field
          const potentialLoss = riskData.Impact * 10000; // Using impact as a multiplier for a base value
          const expectedValue = riskData.Probability * potentialLoss;
          
          setForm(prev => ({
            ...prev,
            ExpectedValue: Math.round(expectedValue),
          }));
        }
      } catch (error) {
        console.error('Error fetching risk:', error);
        toast.error('Could not load risk data');
        router.push(`/projects/${id}/risk/${riskId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, riskId, router]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'ExpectedValue') {
      // Ensure it's a valid number
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;
      setForm(prev => ({ ...prev, [name]: numValue }));
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
    
    if (!form.AnalysisType) {
      newErrors.AnalysisType = 'Analysis type is required';
    }
    
    if (form.AnalysisType === 'Expected Value' && form.ExpectedValue <= 0) {
      newErrors.ExpectedValue = 'Expected value must be greater than 0';
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
      const analysisData = {
        RiskId: riskId as string,
        AnalysisType: form.AnalysisType,
        MatrixScore: form.MatrixScore,
        ExpectedValue: form.ExpectedValue,
        OwnerId: userId || undefined
      };
      
      // Create analysis
      await createRiskAnalysis(analysisData);
      
      toast.success('Analysis created successfully');
      router.push(`/projects/${id}/risk/${riskId}`);
    } catch (error) {
      console.error('Error creating analysis:', error);
      toast.error('Failed to create analysis');
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
          onClick={() => router.push(`/projects/${id}/risk/${riskId}`)}
          className="mr-4 p-2 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted transition-colors"
          aria-label="Back to risk details"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        
        <div>
          <h1 className="text-2xl font-bold">Add Risk Analysis</h1>
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
              <div className={`font-medium text-${severityInfo.color}-500`}>
                {risk?.Severity || (risk?.Probability && risk?.Impact ? (risk.Probability * risk.Impact).toFixed(1) : 'N/A')} 
              </div>
            </div>
          </div>
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
          {/* Analysis Information Section */}
          <div className="risk-analysis-form-section">
            <h2 className="risk-analysis-form-section-title">Analysis Information</h2>
            
            {/* Analysis Type */}
            <div className="risk-analysis-form-group">
              <label htmlFor="analysisType" className="risk-analysis-form-label">
                Analysis Type <span className="text-destructive">*</span>
              </label>
              <select
                id="analysisType"
                name="AnalysisType"
                value={form.AnalysisType}
                onChange={handleInputChange}
                className={`risk-analysis-form-select ${errors.AnalysisType ? 'border-destructive' : ''}`}
              >
                {ANALYSIS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.AnalysisType && <p className="risk-analysis-form-error">{errors.AnalysisType}</p>}
            </div>
            
            {/* Matrix Score */}
            <div className="risk-analysis-form-group">
              <label htmlFor="matrixScore" className="risk-analysis-form-label flex items-center gap-2">
                <BarChart className="h-4 w-4 text-primary" />
                Matrix Score
                <div className="relative group">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  <div className="absolute left-0 -bottom-1 translate-y-full w-64 bg-popover p-3 rounded-md shadow-md text-xs text-muted-foreground invisible group-hover:visible z-10 border border-border">
                    <p>A matrix score typically uses a format like "A3" or "High-Medium" to represent the risk position on a probability-impact matrix.</p>
                  </div>
                </div>
              </label>
              <input
                id="matrixScore"
                name="MatrixScore"
                type="text"
                value={form.MatrixScore}
                onChange={handleInputChange}
                placeholder="e.g., 'A3', 'High-Medium', etc."
                className="risk-analysis-form-input"
              />
            </div>
            
            {/* Expected Value */}
            <div className="risk-analysis-form-group">
              <label htmlFor="expectedValue" className="risk-analysis-form-label flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                Expected Value ($)
                <div className="relative group">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  <div className="absolute left-0 -bottom-1 translate-y-full w-64 bg-popover p-3 rounded-md shadow-md text-xs text-muted-foreground invisible group-hover:visible z-10 border border-border">
                    <p>Expected value is calculated as Probability × Impact in monetary terms. It represents the potential financial impact of the risk.</p>
                  </div>
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground">$</span>
                </div>
                <input
                  id="expectedValue"
                  name="ExpectedValue"
                  type="number"
                  value={form.ExpectedValue}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  className={`risk-analysis-form-input pl-7 ${errors.ExpectedValue ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.ExpectedValue && <p className="risk-analysis-form-error">{errors.ExpectedValue}</p>}
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}