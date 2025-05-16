'use client';

// Import CSS
import './scope.css';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById } from '@/api/ProjectAPI';
import { 
  getProjectScope, 
  addProjectScope, 
  editProjectScope, 
  deleteProjectScope,
  addScopeManagementPlan,
  addRequirementManagementPlan,
  addRequirementDocumentation,
  addProjectScopeStatement,
  addWorkBreakdownStructure
} from '@/api/ScopeAPI';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Components
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Plus, 
  FileText, 
  Paperclip,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';

// Project scope sections components
import { ScopeManagementPlanSection } from '@/components/scope/ScopeManagementPlanSection';
import { RequirementManagementPlanSection } from '@/components/scope/RequirementManagementPlanSection';
import { RequirementDocumentationSection } from '@/components/scope/RequirementDocumentationSection';
import { ProjectScopeStatementSection } from '@/components/scope/ProjectScopeStatementSection';
import { WorkBreakdownStructureSection } from '@/components/scope/WorkBreakdownStructureSection';
import { AttachmentsSection } from '@/components/scope/AttachmentsSection';
import { SectionAttachments } from '@/components/scope/SectionAttachments';
import { DeleteScopeDialog } from '@/components/scope/DeleteScopeDialog';
import { StepProgressBar } from '@/components/scope/StepProgressBar';

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

export default function ProjectScopePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [scope, setScope] = useState<any>(null);
  const [originalScope, setOriginalScope] = useState<any>(null);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [scopeExists, setScopeExists] = useState(false);
  const [activeSection, setActiveSection] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Step-by-step creation state
  const [creationStep, setCreationStep] = useState('scopeManagement');
  const contentRef = useRef<HTMLDivElement>(null);
  
  const creationSteps = [
    { id: 'scopeManagement', label: 'Scope Plan' },
    { id: 'requirementManagement', label: 'Requirements' },
    { id: 'scopeStatement', label: 'Scope Statement' },
    { id: 'wbs', label: 'Work Breakdown' },
    { id: 'review', label: 'Review' },
  ];
  
  // Extract userId from token on client side
  useEffect(() => {
    const extractedUserId = getUserIdFromToken();
    console.log("Extracted user ID from token:", extractedUserId);
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
        
        // Try to load existing scope
        try {
          const scopeData = await getProjectScope(id as string);
          setScope(scopeData);
          setOriginalScope(JSON.parse(JSON.stringify(scopeData))); // Deep copy
          setScopeExists(true);
        } catch (scopeError) {
          console.log("No existing scope found, creating empty structure");
          // Create empty scope structure
          const emptyScope = createEmptyScope();
          setScope(emptyScope);
          setOriginalScope(JSON.parse(JSON.stringify(emptyScope))); // Deep copy
          setScopeExists(false);
        }
      } catch (error) {
        console.error("Unexpected error during load:", error);
        setError(`An unexpected error occurred: ${error.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadProjectData();
  }, [id, userId]);
  
  // Scroll to top when changing steps
  useEffect(() => {
    if (contentRef.current && isCreateMode) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [creationStep, isCreateMode]);
  
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
  
  const handleStepContinue = async () => {
    // Save the current step
    try {
      setSaving(true);
      let saveResult;
      
      // Save specific section data
      switch (creationStep) {
        case 'scopeManagement':
          saveResult = await addScopeManagementPlan(id as string, scope.scopeManagementPlan);
          setCreationStep('requirementManagement');
          break;
        case 'requirementManagement':
          saveResult = await Promise.all([
            addRequirementManagementPlan(id as string, scope.requirementManagementPlan),
            addRequirementDocumentation(id as string, scope.requirementDocumentation)
          ]);
          setCreationStep('scopeStatement');
          break;
        case 'scopeStatement':
          saveResult = await addProjectScopeStatement(id as string, scope.projectScopeStatement);
          setCreationStep('wbs');
          break;
        case 'wbs':
          saveResult = await addWorkBreakdownStructure(id as string, scope.workBreakdownStructure);
          setCreationStep('review');
          break;
        case 'review':
          // Final save already happened, just exit review
          setIsCreateMode(false);
          setScopeExists(true);
          break;
      }
      
      toast.success(`Saved ${creationStep.replace(/([A-Z])/g, ' $1').trim()} successfully`);
    } catch (error) {
      console.error(`Failed to save ${creationStep}:`, error);
      toast.error(`Failed to save: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleStepNavigation = (stepId: string) => {
    setCreationStep(stepId);
  };
  
  const handleSaveScope = async () => {
    if (!scope) return;
    
    setSaving(true);
    try {
      if (scopeExists) {
        await editProjectScope(id as string, scope);
      } else {
        await addProjectScope(id as string, scope);
        setScopeExists(true);
      }
      
      setOriginalScope(JSON.parse(JSON.stringify(scope))); // Update original after save
      setIsEditing(false);
      setIsCreateMode(false);
      toast.success('Project scope saved successfully');
    } catch (error) {
      console.error('Failed to save project scope:', error);
      toast.error(`Failed to save project scope: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancelEdit = () => {
    // Revert to original scope
    setScope(JSON.parse(JSON.stringify(originalScope)));
    setIsEditing(false);
    setIsCreateMode(false);
  };
  
  const handleDeleteScope = async () => {
    try {
      await deleteProjectScope(id as string);
      // Reset the scope state
      const emptyScope = createEmptyScope();
      setScope(emptyScope);
      setOriginalScope(JSON.parse(JSON.stringify(emptyScope)));
      setScopeExists(false);
      toast.success('Project scope deleted successfully');
    } catch (error) {
      console.error('Failed to delete project scope:', error);
      toast.error(`Failed to delete project scope: ${error.message || "Unknown error"}`);
    }
  };
  
  const handleStartCreate = () => {
    setIsCreateMode(true);
    setCreationStep('scopeManagement');
  };
  
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin mb-4">
            <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium">Loading project scope...</h3>
          <p className="text-muted-foreground mt-2">Please wait while we retrieve your project data</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GlassPanel className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex flex-col space-y-3 items-center">
            <Button onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
            <Button variant="outline" onClick={() => router.push(`/projects/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Project
            </Button>
          </div>
        </GlassPanel>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GlassPanel className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">Unable to load project details.</p>
          <Button onClick={() => router.push('/projects')}>
            Return to Projects
          </Button>
        </GlassPanel>
      </div>
    );
  }
  
  if (!scope) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<GlassPanel className={cn("p-6 mb-8", {
  "border-l-4": true,
  "border-primary": true,
  "shadow-md": true,
})}>          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Scope Data Issue</h2>
          <p className="text-muted-foreground mb-4">There was an issue loading the project scope data.</p>
          <Button onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </GlassPanel>
      </div>
    );
  }
  
  const sections = [
    { id: 'all', label: 'All Sections', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'scopeManagementPlan', label: 'Scope Management', icon: <FileText className="h-4 w-4" /> },
    { id: 'requirementManagementPlan', label: 'Requirements', icon: <FileText className="h-4 w-4" /> },
    { id: 'projectScopeStatement', label: 'Scope Statement', icon: <FileText className="h-4 w-4" /> },
    { id: 'workBreakdownStructure', label: 'Work Breakdown', icon: <FileText className="h-4 w-4" /> },
    { id: 'attachments', label: 'Attachments', icon: <Paperclip className="h-4 w-4" /> },
  ];
  
  // Step-by-step creation mode
  if (isCreateMode) {
    return (
      <div className="min-h-screen animate-gradientBackground pb-20">
        {/* Header */}
        <div className="sticky top-0 z-40 glass-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
                      setIsCreateMode(false);
                    }
                  }}
                  className="mr-3 p-1.5 rounded-full hover-effect"
                >
                  <ArrowLeft className="h-5 w-5 text-foreground/70" />
                </button>
                
                <div>
                  <h1 className="text-xl font-semibold text-foreground/90">
                    Define Scope for {project.Name}
                  </h1>
                  <p className="text-sm text-foreground/60">
                    Step {creationSteps.findIndex(s => s.id === creationStep) + 1} of {creationSteps.length}: {creationSteps.find(s => s.id === creationStep)?.label}
                  </p>
                </div>
              </div>
              
              {/* Cancel and Save buttons */}
              <div className="flex gap-2 self-end md:self-auto">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
                      handleCancelEdit();
                    }
                  }}
                  disabled={saving}
                  className="button-hover"
                >
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
                
                {creationStep === 'review' ? (
                  <Button 
                    onClick={handleStepContinue}
                    disabled={saving}
                    className="save-button-animation"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Finalizing...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" /> Complete Scope Definition
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStepContinue}
                    disabled={saving}
                    className="save-button-animation"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress bar */}
          <div className="mb-8">
            <StepProgressBar 
              steps={creationSteps}
              currentStep={creationStep}
              onStepClick={handleStepNavigation}
            />
          </div>
          
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {/* Scope Management Plan Step */}
              {creationStep === 'scopeManagement' && (
                <motion.div
                  key="scopeManagement"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
<GlassPanel className={cn("p-6 mb-8", {
  "border-l-4": true,
  "border-primary": true,
  "shadow-md": true,
})}>                    <h2 className="text-lg font-semibold mb-2">Scope Management Plan</h2>
                    <p className="text-muted-foreground">
                      Define how the project scope will be defined, validated, and controlled. This is the foundation for the rest of your scope documentation.
                    </p>
                  </GlassPanel>
                  
                  <ScopeManagementPlanSection
                    data={scope.scopeManagementPlan}
                    isEditing={true}
                    onChange={(field, value) => handleScopeChange('scopeManagementPlan', field, value)}
                  />
                  
                  <SectionAttachments 
                    projectId={id as string}
                    sectionType="scopeManagementPlan"
                    userId={userId as string}
                    isOwner={isOwner}
                  />
                </motion.div>
              )}
              
              {/* Requirements Management Step */}
              {creationStep === 'requirementManagement' && (
                <motion.div
                  key="requirementManagement"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
<GlassPanel className={cn("p-6 mb-8", {
  "border-l-4": true,
  "border-primary": true,
  "shadow-md": true,
})}>                    <h2 className="text-lg font-semibold mb-2">Requirements Management</h2>
                    <p className="text-muted-foreground">
                      Define how project requirements will be analyzed, documented, and managed throughout the project lifecycle.
                    </p>
                  </GlassPanel>
                  
                  <RequirementManagementPlanSection
                    data={scope.requirementManagementPlan}
                    isEditing={true}
                    onChange={(field, value) => handleScopeChange('requirementManagementPlan', field, value)}
                  />
                  
                  <div className="mt-8">
                    <RequirementDocumentationSection
                      data={scope.requirementDocumentation}
                      isEditing={true}
                      onChange={(field, value) => handleScopeChange('requirementDocumentation', field, value)}
                      onListChange={handleListChange}
                      onAddListItem={handleAddListItem}
                      onRemoveListItem={handleRemoveListItem}
                    />
                  </div>
                  
                  <SectionAttachments 
                    projectId={id as string}
                    sectionType="requirementManagement"
                    userId={userId as string}
                    isOwner={isOwner}
                  />
                </motion.div>
              )}
              
              {/* Scope Statement Step */}
              {creationStep === 'scopeStatement' && (
                <motion.div
                  key="scopeStatement"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
<GlassPanel className={cn("p-6 mb-8", {
  "border-l-4": true,
  "border-primary": true,
  "shadow-md": true,
})}>                    <h2 className="text-lg font-semibold mb-2">Project Scope Statement</h2>
                    <p className="text-muted-foreground">
                      Clearly define what is included and excluded from the project, including deliverables and acceptance criteria.
                    </p>
                  </GlassPanel>
                  
                  <ProjectScopeStatementSection
                    data={scope.projectScopeStatement}
                    isEditing={true}
                    onChange={(field, value) => handleScopeChange('projectScopeStatement', field, value)}
                    onListChange={handleListChange}
                    onAddListItem={handleAddListItem}
                    onRemoveListItem={handleRemoveListItem}
                  />
                  
                  <SectionAttachments 
                    projectId={id as string}
                    sectionType="scopeStatement"
                    userId={userId as string}
                    isOwner={isOwner}
                  />
                </motion.div>
              )}
              
              {/* WBS Step */}
              {creationStep === 'wbs' && (
                <motion.div
                  key="wbs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
<GlassPanel className={cn("p-6 mb-8", {
  "border-l-4": true,
  "border-primary": true,
  "shadow-md": true,
})}>                    <h2 className="text-lg font-semibold mb-2">Work Breakdown Structure</h2>
                    <p className="text-muted-foreground">
                      Break down the project scope into manageable work packages. Define each component with descriptions, durations, and costs.
                    </p>
                  </GlassPanel>
                  
                  <WorkBreakdownStructureSection
                    data={scope.workBreakdownStructure}
                    isEditing={true}
                    onChange={(field, value) => handleScopeChange('workBreakdownStructure', field, value)}
                    onAddWorkPackage={handleAddWorkPackage}
                    onWorkPackageChange={handleWorkPackageChange}
                    onRemoveWorkPackage={handleRemoveWorkPackage}
                  />
                  
                  <SectionAttachments 
                    projectId={id as string}
                    sectionType="wbs"
                    userId={userId as string}
                    isOwner={isOwner}
                  />
                </motion.div>
              )}
              
              {/* Review Step */}
              {creationStep === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
<GlassPanel className={cn("p-6 mb-8", {
  "border-l-4": true,
  "border-primary": true,
  "shadow-md": true,
})}>                    <h2 className="text-lg font-semibold mb-2">Review & Complete</h2>
                    <p className="text-muted-foreground">
                      Review all components of your project scope before finalizing.
                    </p>
                  </GlassPanel>
                  
                  <div className="space-y-8">
                    <ScopeManagementPlanSection
                      data={scope.scopeManagementPlan}
                      isEditing={false}
                      onChange={() => {}}
                    />
                    
                    <RequirementManagementPlanSection
                      data={scope.requirementManagementPlan}
                      isEditing={false}
                      onChange={() => {}}
                    />
                    
                    <RequirementDocumentationSection
                      data={scope.requirementDocumentation}
                      isEditing={false}
                      onChange={() => {}}
                      onListChange={() => {}}
                      onAddListItem={() => {}}
                      onRemoveListItem={() => {}}
                    />
                    
                    <ProjectScopeStatementSection
                      data={scope.projectScopeStatement}
                      isEditing={false}
                      onChange={() => {}}
                      onListChange={() => {}}
                      onAddListItem={() => {}}
                      onRemoveListItem={() => {}}
                    />
                    
                    <WorkBreakdownStructureSection
                      data={scope.workBreakdownStructure}
                      isEditing={false}
                      onChange={() => {}}
                      onAddWorkPackage={() => {}}
                      onWorkPackageChange={() => {}}
                      onRemoveWorkPackage={() => {}}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen animate-gradientBackground text-foreground bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push(`/projects/${id}`)}
                className="mr-3 p-1.5 rounded-full hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {project.Name} - Scope Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Define and manage the project scope and requirements
                </p>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex gap-2 self-end md:self-auto">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveScope}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="animate-spin mr-2">
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
                  </>
                ) : (
                  <>
                    {scopeExists && (
                      <Button 
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950 dark:border-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Scope
                      </Button>
                    )}
                    {scopeExists ? (
                      <Button 
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit Scope
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStartCreate}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Define Scope
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Section Navigation */}
          {scopeExists && (
            <div className="flex items-center space-x-2 overflow-x-auto mt-4 pb-2 hide-scrollbar">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center px-3 py-1.5 text-sm rounded-full transition-colors",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {section.icon}
                  <span className="ml-1.5">{section.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scope Content */}
        {!scopeExists && !isEditing ? (
          <EmptyState
            title="No Scope Defined"
            description="The project scope has not been defined yet. Define the scope to clarify what is included and excluded from this project."
            icon={<FileText className="h-16 w-16" />}
            action={
              isOwner ? (
                <Button onClick={handleStartCreate} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Define Scope
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {/* Scope Management Plan */}
              {(activeSection === 'all' || activeSection === 'scopeManagementPlan') && (
                <motion.div
                  key="scopeManagementPlan"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ScopeManagementPlanSection
                    data={scope.scopeManagementPlan}
                    isEditing={isEditing}
                    onChange={(field, value) => handleScopeChange('scopeManagementPlan', field, value)}
                  />
                  
                  {!isEditing && (
                    <SectionAttachments 
                      projectId={id as string}
                      sectionType="scopeManagementPlan"
                      userId={userId as string}
                      isOwner={isOwner}
                    />
                  )}
                </motion.div>
              )}
              
              {/* Requirement Management Plan */}
              {(activeSection === 'all' || activeSection === 'requirementManagementPlan') && (
                <motion.div
                  key="requirementManagementPlan"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <RequirementManagementPlanSection
                    data={scope.requirementManagementPlan}
                    isEditing={isEditing}
                    onChange={(field, value) => handleScopeChange('requirementManagementPlan', field, value)}
                  />
                  
                  {!isEditing && (
                    <SectionAttachments 
                      projectId={id as string}
                      sectionType="requirementManagementPlan"
                      userId={userId as string}
                      isOwner={isOwner}
                    />
                  )}
                </motion.div>
              )}
              
              {/* Requirement Documentation */}
              {(activeSection === 'all' || activeSection === 'requirementManagementPlan') && (
                <motion.div
                  key="requirementDocumentation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <RequirementDocumentationSection
                    data={scope.requirementDocumentation}
                    isEditing={isEditing}
                    onChange={(field, value) => handleScopeChange('requirementDocumentation', field, value)}
                    onListChange={handleListChange}
                    onAddListItem={handleAddListItem}
                    onRemoveListItem={handleRemoveListItem}
                  />
                  
                  {!isEditing && (
                    <SectionAttachments 
                      projectId={id as string}
                      sectionType="requirementDocumentation"
                      userId={userId as string}
                      isOwner={isOwner}
                    />
                  )}
                </motion.div>
              )}
              
              {/* Project Scope Statement */}
              {(activeSection === 'all' || activeSection === 'projectScopeStatement') && (
                <motion.div
                  key="projectScopeStatement"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <ProjectScopeStatementSection
                    data={scope.projectScopeStatement}
                    isEditing={isEditing}
                    onChange={(field, value) => handleScopeChange('projectScopeStatement', field, value)}
                    onListChange={handleListChange}
                    onAddListItem={handleAddListItem}
                    onRemoveListItem={handleRemoveListItem}
                  />
                  
                  {!isEditing && (
                    <SectionAttachments 
                      projectId={id as string}
                      sectionType="projectScopeStatement"
                      userId={userId as string}
                      isOwner={isOwner}
                    />
                  )}
                </motion.div>
              )}
              
              {/* Work Breakdown Structure */}
              {(activeSection === 'all' || activeSection === 'workBreakdownStructure') && (
                <motion.div
                  key="workBreakdownStructure"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <WorkBreakdownStructureSection
                    data={scope.workBreakdownStructure}
                    isEditing={isEditing}
                    onChange={(field, value) => handleScopeChange('workBreakdownStructure', field, value)}
                    onAddWorkPackage={handleAddWorkPackage}
                    onWorkPackageChange={handleWorkPackageChange}
                    onRemoveWorkPackage={handleRemoveWorkPackage}
                  />
                  
                  {!isEditing && (
                    <SectionAttachments 
                      projectId={id as string}
                      sectionType="workBreakdownStructure"
                      userId={userId as string}
                      isOwner={isOwner}
                    />
                  )}
                </motion.div>
              )}
              
              {/* Attachments */}
              {(activeSection === 'all' || activeSection === 'attachments') && (
                <motion.div
                  key="attachments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <AttachmentsSection
                    attachments={[]} // Use global attachments here if needed
                    isOwner={isOwner}
                    onUpload={() => {}}
                    onDelete={() => {}}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <DeleteScopeDialog
        projectName={project.Name}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteScope}
      />
    </div>
  );
}

// Helper component for the step-by-step creation flow
function ArrowRight(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function Check(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}