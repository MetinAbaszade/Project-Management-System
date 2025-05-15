'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById } from '@/api/ProjectAPI';
import { addProjectScope } from '@/api/ScopeAPI';
import { motion } from 'framer-motion';
import { toast } from '@/lib/toast';

// Components
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ArrowLeft, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

// Project scope sections components
import { ScopeManagementPlanSection } from '@/components/scope/ScopeManagementPlanSection';
import { RequirementManagementPlanSection } from '@/components/scope/RequirementManagementPlanSection';
import { RequirementDocumentationSection } from '@/components/scope/RequirementDocumentationSection';
import { ProjectScopeStatementSection } from '@/components/scope/ProjectScopeStatementSection';
import { WorkBreakdownStructureSection } from '@/components/scope/WorkBreakdownStructureSection';

// Function to extract user ID from JWT token
function getUserIdFromToken() {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    // Decode JWT token (format: header.payload.signature)
    const payload = token.split('.')[1];
    if (!payload) return null;
    
    // Decode base64
    const decodedPayload = JSON.parse(atob(payload));
    
    // Different token formats might use different fields for user ID
    return decodedPayload.sub || decodedPayload.id || decodedPayload.userId || null;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

export default function CreateScopePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [scope, setScope] = useState<any>(null);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Extract userId from token on client side
  useEffect(() => {
    const extractedUserId = getUserIdFromToken();
    setUserId(extractedUserId);
    
    if (!extractedUserId) {
      setError("Authentication required. Please log in again.");
      setLoading(false);
    }
  }, []);
  
  // Load project data once we have the userId
  useEffect(() => {
    const loadProjectData = async () => {
      if (!userId || !id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load project details
        let projectData;
        try {
          projectData = await getProjectById(id as string);
          setProject(projectData);
        } catch (projectError) {
          console.error("Failed to load project:", projectError);
          setError(`Failed to load project: ${projectError.message || "Unknown error"}`);
          setLoading(false);
          return;
        }
        
        // Check if user is project owner
        const isOwnerValue = userId === projectData.OwnerId;
        setIsOwner(isOwnerValue);
        
        if (!isOwnerValue) {
          setError("You don't have permission to create a scope for this project");
          setLoading(false);
          return;
        }
        
        // Create empty scope structure
        const emptyScope = createEmptyScope();
        setScope(emptyScope);
        
      } catch (error) {
        console.error("Unexpected error during load:", error);
        setError(`An unexpected error occurred: ${error.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadProjectData();
  }, [id, userId]);
  
  const createEmptyScope = () => {
    return {
      scopeManagementPlan: {
        ScopeDefinitionMethod: '',
        WBSDevelopmentMethod: '',
        ScopeBaselineApproval: '',
        DeliverablesImpactHandling: '',
      },
      requirementManagementPlan: {
        ReqPlanningApproach: '',
        ReqChangeControl: '',
        ReqPrioritization: '',
        ReqMetrics: '',
      },
      requirementDocumentation: {
        StakeholderNeeds: [''],
        QuantifiedExpectations: [''],
        Traceability: '',
      },
      projectScopeStatement: {
        EndProductScope: '',
        Deliverables: [''],
        AcceptanceCriteria: '',
        Exclusions: '',
        OptionalSOW: '',
      },
      workBreakdownStructure: {
        WorkPackages: [],
        ScopeBaselineReference: '',
      },
    };
  };
  
  const handleScopeChange = (section, field, value) => {
    setScope(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }));
  };
  
  const handleListChange = (section, field, index, value) => {
    const list = [...scope[section][field]];
    list[index] = value;
    
    handleScopeChange(section, field, list);
  };
  
  const handleAddListItem = (section, field) => {
    const list = [...scope[section][field], ''];
    handleScopeChange(section, field, list);
  };
  
  const handleRemoveListItem = (section, field, index) => {
    const list = [...scope[section][field]];
    if (list.length <= 1) return; // Keep at least one item
    
    list.splice(index, 1);
    handleScopeChange(section, field, list);
  };
  
  const handleAddWorkPackage = () => {
    const newWorkPackage = {
      Name: '',
      Description: '',
      EstimatedDuration: 0,
      EstimatedCost: 0,
    };
    
    setScope(prev => ({
      ...prev,
      workBreakdownStructure: {
        ...prev.workBreakdownStructure,
        WorkPackages: [
          ...prev.workBreakdownStructure.WorkPackages,
          newWorkPackage,
        ],
      },
    }));
  };
  
  const handleWorkPackageChange = (index, field, value) => {
    setScope(prev => {
      const updatedPackages = [...prev.workBreakdownStructure.WorkPackages];
      updatedPackages[index] = {
        ...updatedPackages[index],
        [field]: value,
      };
      
      return {
        ...prev,
        workBreakdownStructure: {
          ...prev.workBreakdownStructure,
          WorkPackages: updatedPackages,
        },
      };
    });
  };
  
  const handleRemoveWorkPackage = (index) => {
    setScope(prev => {
      const updatedPackages = [...prev.workBreakdownStructure.WorkPackages];
      updatedPackages.splice(index, 1);
      
      return {
        ...prev,
        workBreakdownStructure: {
          ...prev.workBreakdownStructure,
          WorkPackages: updatedPackages,
        },
      };
    });
  };
  
  const handleCancel = () => {
    router.push(`/projects/${id}/scope`);
  };
  
  const handleSaveScope = async () => {
    if (!scope) return;
    
    setSaving(true);
    try {
      await addProjectScope(id as string, scope);
      setSuccess(true);
      
      toast.success('Project scope created successfully');
      
      // Redirect after a brief delay to show success
      setTimeout(() => {
        router.push(`/projects/${id}/scope`);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to create project scope:', error);
      toast.error(`Failed to create project scope: ${error.message || "Unknown error"}`);
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h3 className="text-xl font-medium">Loading...</h3>
          <p className="text-muted-foreground mt-2">Preparing to create project scope</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GlassPanel className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="default" onClick={() => router.push(`/projects/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Project
          </Button>
        </GlassPanel>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GlassPanel className="p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Scope Created Successfully</h2>
          <p className="text-muted-foreground mb-4">Redirecting you back to the project scope...</p>
        </GlassPanel>
      </div>
    );
  }
  
  if (!project || !scope || !isOwner) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GlassPanel className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">Unable to prepare scope creation form</p>
          <Button onClick={() => router.push(`/projects/${id}/scope`)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Scope
          </Button>
        </GlassPanel>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen animate-gradientBackground pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push(`/projects/${id}/scope`)}
                className="mr-3 p-1.5 rounded-full hover-effect"
              >
                <ArrowLeft className="h-5 w-5 text-foreground/70" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-foreground/90">
                  Define Scope for {project.Name}
                </h1>
                <p className="text-sm text-foreground/60">
                  Create the project scope to define what is included and excluded from this project
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 self-end md:self-auto">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={saving}
                className="button-hover"
              >
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button 
                onClick={handleSaveScope}
                disabled={saving}
                className="save-button-animation"
              >
                {saving ? (
                  <>
                    <span className="inline-block animate-spin mr-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Scope
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Form instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassPanel className="p-6 border-l-4 border-blue-500">
              <h2 className="text-lg font-semibold mb-2">Scope Creation Guide</h2>
              <p className="text-muted-foreground">
                Define the scope of your project by filling out the sections below. Each section helps clarify what is included
                and excluded from the project, ensuring all stakeholders have a clear understanding of the work to be done.
              </p>
            </GlassPanel>
          </motion.div>
          
          {/* Scope Management Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ScopeManagementPlanSection
              data={scope.scopeManagementPlan}
              isEditing={true}
              onChange={(field, value) => handleScopeChange('scopeManagementPlan', field, value)}
            />
          </motion.div>
          
          {/* Requirement Management Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <RequirementManagementPlanSection
              data={scope.requirementManagementPlan}
              isEditing={true}
              onChange={(field, value) => handleScopeChange('requirementManagementPlan', field, value)}
            />
          </motion.div>
          
          {/* Requirement Documentation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <RequirementDocumentationSection
              data={scope.requirementDocumentation}
              isEditing={true}
              onChange={(field, value) => handleScopeChange('requirementDocumentation', field, value)}
              onListChange={handleListChange}
              onAddListItem={handleAddListItem}
              onRemoveListItem={handleRemoveListItem}
            />
          </motion.div>
          
          {/* Project Scope Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <ProjectScopeStatementSection
              data={scope.projectScopeStatement}
              isEditing={true}
              onChange={(field, value) => handleScopeChange('projectScopeStatement', field, value)}
              onListChange={handleListChange}
              onAddListItem={handleAddListItem}
              onRemoveListItem={handleRemoveListItem}
            />
          </motion.div>
          
          {/* Work Breakdown Structure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <WorkBreakdownStructureSection
              data={scope.workBreakdownStructure}
              isEditing={true}
              onChange={(field, value) => handleScopeChange('workBreakdownStructure', field, value)}
              onAddWorkPackage={handleAddWorkPackage}
              onWorkPackageChange={handleWorkPackageChange}
              onRemoveWorkPackage={handleRemoveWorkPackage}
            />
          </motion.div>
          
          {/* Save Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="flex justify-end gap-4 pt-4"
          >
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={saving}
              className="button-hover"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveScope}
              disabled={saving}
              className="save-button-animation"
              size="lg"
            >
              {saving ? 'Saving...' : 'Save Project Scope'}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}