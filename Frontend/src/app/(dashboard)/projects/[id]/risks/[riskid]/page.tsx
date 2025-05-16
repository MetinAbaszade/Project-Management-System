// Frontend/src/app/(dashboard)/projects/[id]/risks/[riskid]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Edit,
  Trash2,
  PlusCircle,
  BarChart,
  ShieldAlert,
  FileBarChart,
  CheckCircle,
  ExternalLink,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  User,
  BarChart4,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

// API imports
import { getRiskById, deleteRisk, getRiskAnalyses, getRiskResponsePlans } from '@/api/RiskAPI';
import { getProjectById } from '@/api/ProjectAPI';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

// Styles
import './riskDetail.css';

export default function RiskDetailPage() {
  const { id, riskId } = useParams();
  const router = useRouter();
  
  // States
  const [risk, setRisk] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [responsePlans, setResponsePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // UI states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [analysesExpanded, setAnalysesExpanded] = useState(true);
  const [responsesExpanded, setResponsesExpanded] = useState(true);
  
  // Permissions
  const [permissions, setPermissions] = useState({
    isProjectOwner: false,
    isRiskOwner: false,
    canEdit: false,
    canDelete: false,
    canAddAnalysis: false,
    canAddResponse: false
  });

  // Get user ID from JWT token
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setUserId(decoded.sub || decoded.id || decoded.userId);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, []);

  // Fetch risk data
  const fetchData = async (showToast = false) => {
    if (!id || !riskId || !userId) return;
    
    if (showToast) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Fetch risk, project, analyses, and response plans in parallel
      const [riskData, projectData, analysesData, responsesData] = await Promise.all([
        getRiskById(riskId as string),
        getProjectById(id as string),
        getRiskAnalyses(riskId as string),
        getRiskResponsePlans(riskId as string)
      ]);
      
      setRisk(riskData);
      setProject(projectData);
      setAnalyses(analysesData || []);
      setResponsePlans(responsesData || []);
      
      // Determine permissions
      const isOwner = projectData.OwnerId === userId;
      const isRiskOwner = riskData.OwnerId === userId;
      
      setPermissions({
        isProjectOwner: isOwner,
        isRiskOwner: isRiskOwner,
        canEdit: isOwner || isRiskOwner,
        canDelete: isOwner,
        canAddAnalysis: isOwner || isRiskOwner,
        canAddResponse: isOwner || isRiskOwner
      });
      
      setError(null);
      
      if (showToast) {
        toast.success('Risk data refreshed');
      }
    } catch (err: any) {
      console.error('Error fetching risk data:', err);
      setError(err?.message || 'Failed to load risk details');
      toast.error('Could not load risk data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [id, riskId, userId]);

  // Handle delete risk
  const handleDeleteRisk = async () => {
    if (!risk?.Id || !id) return;
    
    setDeleting(true);
    try {
      await deleteRisk(risk.Id, id as string);
      
      toast.success('Risk deleted successfully');
      router.push(`/projects/${id}/risks`);
    } catch (error) {
      console.error('Failed to delete risk:', error);
      toast.error('Could not delete risk');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Helper to determine severity level
  const getSeverityLevel = (severity: number) => {
    if (severity >= 7) return { level: 'High', color: 'destructive' };
    if (severity >= 4) return { level: 'Medium', color: 'warning' };
    return { level: 'Low', color: 'success' };
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="risk-detail-container">
        <div className="mb-8 flex items-center">
          <div className="h-10 w-10 rounded-full risk-skeleton mr-4"></div>
          <div className="space-y-2">
            <div className="h-7 w-64 rounded risk-skeleton"></div>
            <div className="h-5 w-40 rounded risk-skeleton"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <div className="h-6 w-32 rounded risk-skeleton"></div>
                  </div>
                  <div className="space-x-2">
                    <div className="h-6 w-20 rounded-full risk-skeleton inline-block"></div>
                    <div className="h-6 w-24 rounded-full risk-skeleton inline-block"></div>
                    <div className="h-6 w-20 rounded-full risk-skeleton inline-block"></div>
                  </div>
                </div>
                
                <div className="h-16 w-full rounded risk-skeleton"></div>
                
                <div className="pt-4 border-t">
                  <div className="h-5 w-32 rounded risk-skeleton mb-3"></div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 w-full rounded-lg risk-skeleton"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <div className="h-6 w-32 rounded risk-skeleton"></div>
              </div>
              <div className="p-6">
                <div className="h-32 w-full rounded risk-skeleton"></div>
              </div>
            </div>
            
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <div className="h-6 w-40 rounded risk-skeleton"></div>
              </div>
              <div className="p-6">
                <div className="h-32 w-full rounded risk-skeleton"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <div className="h-6 w-40 rounded risk-skeleton"></div>
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 w-full rounded risk-skeleton"></div>
                ))}
              </div>
            </div>
            
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <div className="h-6 w-32 rounded risk-skeleton"></div>
              </div>
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 w-full rounded-md risk-skeleton"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !risk) {
    return (
      <div className="risk-detail-container flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-xl p-8 max-w-md w-full text-center space-y-4 border shadow-sm"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-destructive/10 mx-auto">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Error Loading Risk</h2>
          <p className="text-muted-foreground">{error || 'Risk not found'}</p>
          <div className="flex justify-center gap-4 mt-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/projects/${id}/risks`)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Back to Risks
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchData()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const severity = risk.Severity || (risk.Probability * risk.Impact);
  const severityInfo = getSeverityLevel(severity);

  return (
    <div className="risk-detail-container">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/projects/${id}/risks`)}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Back to risks"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          
          <div>
            <h1 className="text-2xl font-bold">{refreshing ? 'Refreshing...' : risk.Name}</h1>
            <p className="text-muted-foreground mt-1">
              {project?.Name} • Risk Details
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center p-2 rounded-full hover:bg-muted transition-all"
            aria-label="Refresh risk data"
          >
            <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
          </motion.button>
          
          {permissions.canEdit && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/projects/${id}/risks/${risk.Id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </motion.button>
          )}
          
          {permissions.canDelete && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </motion.button>
          )}
        </div>
      </motion.div>
      
      {/* Risk Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2/3 width on desktop) */}
        <div className="md:col-span-2 space-y-6">
          {/* Risk Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden risk-detail-card"
          >
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.7 }}
                      className={cn(
                        "px-2.5 py-1 text-xs font-medium rounded-full",
                        severityInfo.level === 'High' ? "bg-destructive/10 text-destructive" : 
                        severityInfo.level === 'Medium' ? "bg-warning/10 text-warning" : 
                        "bg-success/10 text-success"
                      )}
                    >
                      {severityInfo.level} Severity
                    </motion.span>
                    
                    {risk.Status && (
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.8 }}
                        className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-full",
                          risk.Status === 'Resolved' 
                            ? "bg-success/10 text-success"
                            : risk.Status === 'Mitigating'
                            ? "bg-warning/10 text-warning"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        )}
                      >
                        {risk.Status}
                      </motion.span>
                    )}
                    
                    {risk.Category && (
                      <motion.span 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.9 }}
                        className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                      >
                        {risk.Category}
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>
              
              {risk.Description ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="mb-6"
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="text-foreground whitespace-pre-wrap">{risk.Description}</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="mb-6"
                >
                  <p className="text-muted-foreground text-sm italic">No description provided</p>
                </motion.div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="pt-4 border-t"
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Risk Assessment</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {/* Probability */}
                  <div className="bg-muted/40 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Probability</span>
                      <span className="text-sm font-medium">{Math.round(risk.Probability * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${risk.Probability * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                      ></motion.div>
                    </div>
                  </div>
                  
                  {/* Impact */}
                  <div className="bg-muted/40 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Impact</span>
                      <span className="text-sm font-medium">{risk.Impact}/10</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(risk.Impact / 10) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                      ></motion.div>
                    </div>
                  </div>
                  
                  {/* Severity */}
                  <div className="bg-muted/40 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Severity</span>
                      <span className={cn(
                        "text-sm font-medium",
                        severityInfo.level === 'High' ? "text-destructive" : 
                        severityInfo.level === 'Medium' ? "text-warning" : 
                        "text-success"
                      )}>
                        {severity.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className={cn(
                          "h-full rounded-full",
                          severityInfo.level === 'High' ? "bg-destructive" : 
                          severityInfo.level === 'Medium' ? "bg-warning" : 
                          "bg-success"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${(severity / 10) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Severity is calculated as Probability × Impact. A higher score indicates a more critical risk.
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Risk Analyses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden risk-detail-card"
          >
            <div className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setAnalysesExpanded(!analysesExpanded)}>
              <h2 className="text-lg font-semibold flex items-center">
                <FileBarChart className="h-5 w-5 mr-2 text-primary" />
                Risk Analyses
              </h2>
              
              <div className="flex items-center">
                <div className="bg-muted text-muted-foreground text-xs py-0.5 px-2 rounded-full mr-2">
                  {analyses.length}
                </div>
                <motion.div animate={{ rotate: analysesExpanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </div>
            </div>
            
            <AnimatePresence>
              {analysesExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4">
                    {analyses.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-6 text-muted-foreground"
                      >
                        <FileBarChart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No analyses have been performed yet</p>
                        {permissions.canAddAnalysis && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/projects/${id}/risks/${risk.Id}/analysis/create`)}
                            className="mt-2 text-primary hover:underline flex items-center gap-1 mx-auto"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span>Add Analysis</span>
                          </motion.button>
                        )}
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {analyses.map((analysis, index) => (
                          <motion.div 
                            key={analysis.Id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border rounded-lg p-4 hover:bg-muted/20 transition-colors risk-analysis-item"
                          >
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium mb-1">{analysis.AnalysisType} Analysis</div>
                                {analysis.MatrixScore && (
                                  <div className="text-sm text-muted-foreground">Matrix Score: {analysis.MatrixScore}</div>
                                )}
                                {analysis.ExpectedValue && (
                                  <div className="text-sm text-muted-foreground">Expected Value: ${analysis.ExpectedValue.toLocaleString()}</div>
                                )}
                              </div>
                              
                              {permissions.canEdit && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => router.push(`/projects/${id}/risks/${risk.Id}/analysis/${analysis.Id}/edit`)}
                                  className="p-1.5 rounded-md hover:bg-muted"
                                >
                                  <Edit className="h-4 w-4 text-muted-foreground" />
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        
                        {permissions.canAddAnalysis && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: analyses.length * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(`/projects/${id}/risks/${risk.Id}/analysis/create`)}
                            className="w-full py-2 px-4 border border-dashed rounded-lg text-muted-foreground hover:text-primary hover:border-primary flex items-center justify-center gap-1 transition-colors"
                          >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Another Analysis</span>
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Response Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden risk-detail-card"
          >
            <div className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setResponsesExpanded(!responsesExpanded)}>
              <h2 className="text-lg font-semibold flex items-center">
                <ShieldAlert className="h-5 w-5 mr-2 text-primary" />
                Response Plans
              </h2>
              
              <div className="flex items-center">
                <div className="bg-muted text-muted-foreground text-xs py-0.5 px-2 rounded-full mr-2">
                  {responsePlans.length}
                </div>
                <motion.div animate={{ rotate: responsesExpanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </div>
            </div>
            
            <AnimatePresence>
              {responsesExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4">
                    {responsePlans.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-6 text-muted-foreground"
                      >
                        <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No response plans have been created yet</p>
                        {permissions.canAddResponse && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/projects/${id}/risks/${risk.Id}/response/create`)}
                            className="mt-2 text-primary hover:underline flex items-center gap-1 mx-auto"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span>Add Response Plan</span>
                          </motion.button>
                        )}
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {responsePlans.map((response, index) => (
                          <motion.div 
                            key={response.Id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border rounded-lg p-4 hover:bg-muted/20 transition-colors risk-response-item"
                          >
                            <div className="flex justify-between mb-2">
                              <div>
                                <div className="font-medium mb-1">Strategy: {response.Strategy}</div>
                                {response.Status && (
                                  <div className={cn(
                                    "inline-block text-xs px-2 py-0.5 rounded-full",
                                    response.Status === 'Completed' 
                                      ? "bg-success/10 text-success"
                                      : response.Status === 'In Progress'
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                      : "bg-muted text-muted-foreground"
                                  )}>
                                    {response.Status}
                                  </div>
                                )}
                              </div>
                              
                              {permissions.canEdit && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => router.push(`/projects/${id}/risks/${risk.Id}/response/${response.Id}/edit`)}
                                  className="p-1.5 rounded-md hover:bg-muted"
                                >
                                  <Edit className="h-4 w-4 text-muted-foreground" />
                                </motion.button>
                              )}
                            </div>
                            
                            {response.Description && (
                              <div className="text-sm text-muted-foreground mb-2">{response.Description}</div>
                            )}
                            
                            {response.PlannedActions && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs font-medium text-muted-foreground mb-1">Planned Actions:</div>
                                <p className="text-sm">{response.PlannedActions}</p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                        
                        {permissions.canAddResponse && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: responsePlans.length * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(`/projects/${id}/risks/${risk.Id}/response/create`)}
                            className="w-full py-2 px-4 border border-dashed rounded-lg text-muted-foreground hover:text-primary hover:border-primary flex items-center justify-center gap-1 transition-colors"
                          >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Another Response Plan</span>
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        {/* Sidebar (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Risk Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden risk-detail-card"
          >
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                Risk Information
              </h2>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Created Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Identified Date
                </h3>
                <p className="text-foreground">
                  {risk.IdentifiedDate ? format(new Date(risk.IdentifiedDate), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
              
              {/* Owner */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Owned By
                </h3>
                <p className="text-foreground">
                  {risk.OwnerId === userId ? 'You' : risk.OwnerId || 'Unassigned'}
                </p>
              </div>
              
              {/* Project Link */}
              <div className="pt-2 border-t">
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/projects/${project.Id}`)}
                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View Project</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          {/* Risk Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden risk-detail-card"
          >
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Risk Actions</h2>
            </div>
            
            <div className="p-4 space-y-3">
              {permissions.canAddAnalysis && (
                <motion.button
                  whileHover={{ x: 5, backgroundColor: "hsl(var(--muted))" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/projects/${id}/risks/${risk.Id}/analysis/create`)}
                  className="w-full flex justify-between items-center p-2.5 rounded-md hover:bg-muted transition-colors risk-action-button"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center mr-3">
                      <BarChart className="h-4 w-4" />
                    </div>
                    <span>Add Analysis</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              )}
              
              {permissions.canAddResponse && (
                <motion.button
                  whileHover={{ x: 5, backgroundColor: "hsl(var(--muted))" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/projects/${id}/risks/${risk.Id}/response/create`)}
                  className="w-full flex justify-between items-center p-2.5 rounded-md hover:bg-muted transition-colors risk-action-button"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 flex items-center justify-center mr-3">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <span>Add Response Plan</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              )}
              
              {permissions.canEdit && (
<motion.button
                  whileHover={{ x: 5, backgroundColor: "hsl(var(--muted))" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/projects/${id}/risks/${risk.Id}/edit`)}
                  className="w-full flex justify-between items-center p-2.5 rounded-md hover:bg-muted transition-colors risk-action-button"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center mr-3">
                      <Edit className="h-4 w-4" />
                    </div>
                    <span>Edit Risk</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !deleting && setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-xl border shadow-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-xl font-bold mb-2">Delete Risk</h2>
                <p className="text-muted-foreground">
                  Are you sure you want to delete this risk? This action will also delete all analyses and response plans associated with this risk.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteRisk}
                  disabled={deleting}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Risk</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}