'use client';

// Import CSS
import './scope.css';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectScope, addProjectScope, editProjectScope } from '@/api/ScopeAPI';
import { getAttachmentsByEntity, uploadAttachment, deleteAttachment } from '@/api/AttachmentAPI';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Components
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
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
  RefreshCw
} from 'lucide-react';

// Project scope sections components
import { ScopeManagementPlanSection } from '@/components/scope/ScopeManagementPlanSection';
import { RequirementManagementPlanSection } from '@/components/scope/RequirementManagementPlanSection';
import { RequirementDocumentationSection } from '@/components/scope/RequirementDocumentationSection';
import { ProjectScopeStatementSection } from '@/components/scope/ProjectScopeStatementSection';
import { WorkBreakdownStructureSection } from '@/components/scope/WorkBreakdownStructureSection';
import { AttachmentsSection } from '@/components/scope/AttachmentsSection';

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
  const [attachments, setAttachments] = useState<any[]>([]);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [scopeExists, setScopeExists] = useState(false);
  const [activeSection, setActiveSection] = useState('all');
  
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
          // Create empty scope structure
          const emptyScope = createEmptyScope();
          setScope(emptyScope);
          setOriginalScope(JSON.parse(JSON.stringify(emptyScope))); // Deep copy
          setScopeExists(false);
        }
        
        // Load scope attachments
        try {
          const attachmentsData = await getAttachmentsByEntity(id as string, 'Scope', id as string);
          setAttachments(attachmentsData);
        } catch (attachmentsError) {
          setAttachments([]);
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
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const newAttachment = await uploadAttachment(file, 'Scope', id as string, id as string);
      setAttachments(prev => [...prev, newAttachment]);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error(`Failed to upload file: ${error.message || "Unknown error"}`);
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };
  
  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(att => att.Id !== attachmentId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error(`Failed to delete file: ${error.message || "Unknown error"}`);
    }
  };
  
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };
  
  const redirectToScopeCreate = () => {
    router.push(`/projects/${id}/scope/create`);
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
        <GlassPanel className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
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
                  <Button 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> {scopeExists ? 'Edit Scope' : 'Define Scope'}
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Section Navigation */}
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
                <Button onClick={() => setIsEditing(true)}>
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
                    attachments={attachments}
                    isOwner={isOwner}
                    onUpload={handleFileUpload}
                    onDelete={handleDeleteAttachment}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}