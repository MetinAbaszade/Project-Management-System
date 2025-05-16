// Frontend/src/app/(dashboard)/projects/[id]/risks/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Plus,
  Filter,
  Search,
  AlertTriangle,
  X,
  ChevronDown,
  Loader2,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectRisks } from '@/api/RiskAPI';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

// Styles for the component
import './riskDashboard.css';

export default function RiskManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // States
  const [project, setProject] = useState<any>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('severity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
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

  // Fetch project and risks
  const fetchData = async (showToast = false) => {
    if (!id) return;
    
    if (showToast) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Fetch project and risks data in parallel
      const [projectData, risksData] = await Promise.all([
        getProjectById(id as string),
        getProjectRisks(id as string)
      ]);
      
      setProject(projectData);
      setRisks(Array.isArray(risksData) ? risksData : []);
      setError(null);
      
      if (showToast) {
        toast.success('Risk data refreshed');
      }
    } catch (err: any) {
      console.error('Error fetching risks data:', err);
      
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError('Network connection issue. Unable to reach the API server.');
      } else {
        setError(err?.message || 'Failed to load risk data');
      }
      
      // Set empty arrays to avoid undefined errors
      setRisks([]);
      
      toast.error(err.message === 'Network Error' 
        ? 'Network connection issue. Please check your connection.'
        : 'Could not load risk data for this project');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [id]);

  // Check if user is project owner
  const isProjectOwner = useMemo(() => {
    if (!project || !userId) return false;
    return project.OwnerId === userId;
  }, [project, userId]);

  // Extract unique categories from risks for filter dropdown
  const categories = useMemo(() => {
    if (!risks.length) return [];
    
    const uniqueCategories = new Set<string>();
    risks.forEach(risk => {
      if (risk.Category) uniqueCategories.add(risk.Category);
    });
    
    return Array.from(uniqueCategories).sort();
  }, [risks]);

  // Filter and sort risks
  const filteredRisks = useMemo(() => {
    if (!risks.length) return [];
    
    return risks
      .filter(risk => {
        // Search filter
        if (searchQuery && !risk.Name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            (!risk.Description || !risk.Description.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return false;
        }
        
        // Status filter
        if (statusFilter !== 'all' && risk.Status !== statusFilter) {
          return false;
        }
        
        // Category filter
        if (categoryFilter !== 'all' && risk.Category !== categoryFilter) {
          return false;
        }
        
        // Severity filter
        if (severityFilter !== 'all') {
          const severity = risk.Severity || (risk.Probability * risk.Impact);
          
          if (severityFilter === 'high' && severity < 7) return false;
          if (severityFilter === 'medium' && (severity < 4 || severity >= 7)) return false;
          if (severityFilter === 'low' && severity >= 4) return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;
        
        if (sortBy === 'severity') {
          const severityA = a.Severity || (a.Probability * a.Impact);
          const severityB = b.Severity || (b.Probability * b.Impact);
          return (severityA - severityB) * multiplier;
        }
        
        if (sortBy === 'probability') {
          return (a.Probability - b.Probability) * multiplier;
        }
        
        if (sortBy === 'impact') {
          return (a.Impact - b.Impact) * multiplier;
        }
        
        if (sortBy === 'name') {
          return a.Name.localeCompare(b.Name) * multiplier;
        }
        
        return 0;
      });
  }, [risks, searchQuery, statusFilter, categoryFilter, severityFilter, sortBy, sortDirection]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSeverityFilter('all');
    setSortBy('severity');
    setSortDirection('desc');
  };

  // Helper to determine severity level
  const getSeverityLevel = (severity: number) => {
    if (severity >= 7) return { level: 'High', color: 'destructive' };
    if (severity >= 4) return { level: 'Medium', color: 'warning' };
    return { level: 'Low', color: 'success' };
  };

  // Group risks by severity for summary
  const risksByLevel = useMemo(() => {
    return {
      high: risks.filter(r => (r.Severity || (r.Probability * r.Impact)) >= 7).length,
      medium: risks.filter(r => {
        const severity = r.Severity || (r.Probability * r.Impact);
        return severity >= 4 && severity < 7;
      }).length,
      low: risks.filter(r => (r.Severity || (r.Probability * r.Impact)) < 4).length,
    };
  }, [risks]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="risk-container">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full risk-skeleton"></div>
            <div className="space-y-2">
              <div className="h-7 w-48 rounded risk-skeleton"></div>
              <div className="h-5 w-32 rounded risk-skeleton"></div>
            </div>
          </div>
          <div className="h-10 w-32 rounded-lg risk-skeleton"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-xl p-4 shadow-sm">
              <div className="flex justify-between mb-3">
                <div className="h-5 w-24 rounded risk-skeleton"></div>
                <div className="h-6 w-8 rounded-full risk-skeleton"></div>
              </div>
              <div className="h-2 w-full rounded-full risk-skeleton"></div>
            </div>
          ))}
        </div>
        
        <div className="mb-6 flex justify-between">
          <div className="h-10 w-1/2 rounded-lg risk-skeleton"></div>
          <div className="flex gap-2">
            <div className="h-10 w-24 rounded-lg risk-skeleton"></div>
            <div className="h-10 w-40 rounded-lg risk-skeleton"></div>
            <div className="h-10 w-10 rounded-lg risk-skeleton"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border rounded-xl p-4 shadow-sm">
              <div className="mb-3">
                <div className="h-6 w-72 rounded risk-skeleton"></div>
                <div className="h-4 w-full mt-2 rounded risk-skeleton"></div>
              </div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-20 rounded-full risk-skeleton"></div>
                <div className="h-6 w-24 rounded-full risk-skeleton"></div>
              </div>
              <div className="h-1 w-full rounded risk-skeleton"></div>
              <div className="flex justify-between mt-4 pt-3">
                <div className="h-5 w-24 rounded risk-skeleton"></div>
                <div className="h-5 w-24 rounded risk-skeleton"></div>
                <div className="h-5 w-24 rounded risk-skeleton"></div>
                <div className="h-5 w-32 rounded risk-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="risk-container flex items-center justify-center min-h-[50vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-xl p-8 max-w-md w-full text-center space-y-4 border shadow-sm"
        >
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Failed to load risks</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={() => router.push(`/projects/${id}`)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Back to Project
            </button>
            <button 
              onClick={() => fetchData(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="risk-container">
      {/* Header with back button, title and create button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-start mb-8"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/projects/${id}`)}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Back to project"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          
          <div>
            <h1 className="text-2xl font-bold">{refreshing ? 'Refreshing...' : 'Risk Management'}</h1>
            <p className="text-muted-foreground mt-1">
              {project?.Name || 'Project'} • {risks.length} {risks.length === 1 ? 'risk' : 'risks'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isProjectOwner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.4 }}
            >
              <Link href={`/projects/${id}/risks/create`}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Risk
                </motion.button>
              </Link>
            </motion.div>
          )}
          
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </motion.button>
        </div>
      </motion.div>
      
      {/* Risk summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* High Risk Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">High Risks</h3>
            <div className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              risksByLevel.high > 0 
                ? "bg-destructive/10 text-destructive" 
                : "bg-muted text-muted-foreground"
            )}>
              {risksByLevel.high}
            </div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-destructive rounded-full"
              initial={{ width: 0 }}
              animate={{ width: risks.length ? `${(risksByLevel.high / risks.length) * 100}%` : '0%' }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            ></motion.div>
          </div>
        </motion.div>
        
        {/* Medium Risk Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Medium Risks</h3>
            <div className={cn(
              "px-2 py-1 text-xs font-medium rounded-full", 
              risksByLevel.medium > 0 
                ? "bg-warning/10 text-warning" 
                : "bg-muted text-muted-foreground"
            )}>
              {risksByLevel.medium}
            </div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-warning rounded-full"
              initial={{ width: 0 }}
              animate={{ width: risks.length ? `${(risksByLevel.medium / risks.length) * 100}%` : '0%' }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            ></motion.div>
          </div>
        </motion.div>
        
        {/* Low Risk Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Low Risks</h3>
            <div className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              risksByLevel.low > 0 
                ? "bg-success/10 text-success" 
                : "bg-muted text-muted-foreground"
            )}>
              {risksByLevel.low}
            </div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-success rounded-full"
              initial={{ width: 0 }}
              animate={{ width: risks.length ? `${(risksByLevel.low / risks.length) * 100}%` : '0%' }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            ></motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Search and filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mb-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search risks..."
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center px-3 py-2 rounded-lg border transition-colors",
                showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </motion.button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all cursor-pointer"
            >
              <option value="severity">Sort by Severity</option>
              <option value="probability">Sort by Probability</option>
              <option value="impact">Sort by Impact</option>
              <option value="name">Sort by Name</option>
            </select>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center px-3 py-2 rounded-lg border bg-background border-border hover:bg-muted transition-colors"
              aria-label={sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'}
            >
              <motion.div
                animate={{ rotate: sortDirection === 'asc' ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </motion.button>
          </div>
        </div>
        
        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-card border rounded-lg shadow-sm"
            >
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Identified">Identified</option>
                      <option value="Analyzing">Analyzing</option>
                      <option value="Monitoring">Monitoring</option>
                      <option value="Mitigating">Mitigating</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Severity</label>
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="all">All Severity Levels</option>
                      <option value="high">High (7-10)</option>
                      <option value="medium">Medium (4-6.9)</option>
                      <option value="low">Low (0-3.9)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFilters}
                    className="text-sm text-primary hover:text-primary/80 hover:underline"
                  >
                    Reset Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Main content - Risk list */}
      {risks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-card border rounded-xl p-8 text-center shadow-sm"
        >
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Risks Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            No risks have been identified for this project yet. Add risks to track potential issues that could impact your project's success.
          </p>
          
          {isProjectOwner && (
            <Link href={`/projects/${id}/risks/create`}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Risk
              </motion.button>
            </Link>
          )}
        </motion.div>
      ) : filteredRisks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-card border rounded-xl p-8 text-center shadow-sm"
        >
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Matching Risks</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            No risks match your current filters or search criteria.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetFilters}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm"
          >
            Reset All Filters
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredRisks.map((risk, index) => {
            const severityValue = risk.Severity || (risk.Probability * risk.Impact);
            const severity = getSeverityLevel(severityValue);
            
            return (
              <motion.div
                key={risk.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer risk-card"
                onClick={() => router.push(`/projects/${id}/risks/${risk.Id}`)}
                whileHover={{ y: -4 }}
              >
                <div className="flex">
                  <div 
                    className={`w-1.5 risk-${severity.level.toLowerCase()}-indicator`}
                  ></div>
                  
                  <div className="flex-1 p-4">
                    <div className="sm:flex justify-between items-start gap-4">
                      <div className="mb-2 sm:mb-0">
                        <h3 className="font-semibold text-lg">{risk.Name}</h3>
                        {risk.Description && (
                          <p className="text-muted-foreground line-clamp-2 text-sm mt-1">{risk.Description}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className={`px-2.5 py-1 text-xs font-medium rounded-full risk-badge-${severity.level.toLowerCase()}`}>
                          {severity.level} Severity
                        </div>
                        
                        {risk.Status && (
                          <div className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full",
                            risk.Status === 'Resolved' 
                              ? "bg-success/10 text-success"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          )}>
                            {risk.Status}
                          </div>
                        )}
                        
                        {risk.Category && (
                          <div className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                            {risk.Category}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground mr-2">Probability:</span>
                        <span className="font-medium">{(risk.Probability * 100).toFixed(0)}%</span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground mr-2">Impact:</span>
                        <span className="font-medium">{risk.Impact}/10</span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground mr-2">Severity:</span>
                        <span className="font-medium">{severityValue.toFixed(1)}/10</span>
                      </div>
                      
                      <div className="ml-auto flex items-center text-primary">
                        <span>View Details</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}