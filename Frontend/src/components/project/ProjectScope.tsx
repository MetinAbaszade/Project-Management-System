'use client'

import { useEffect, useState } from 'react'
import {
  ProjectScope as ScopeType,
  addProjectScope,
  editProjectScope,
  ScopeManagementPlan,
  RequirementManagementPlan,
  RequirementDocumentation,
  ProjectScopeStatement,
  WorkBreakdownStructure,
  WorkPackage
} from '@/api/ScopeAPI'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/lib/toast'
import { ClipboardList, Edit, FileText, Plus, Save, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ProjectScope({ projectId }: { projectId: string }) {
  const { user } = useUser()
  const [scope, setScope] = useState<ScopeType | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [scopeExists, setScopeExists] = useState(false)
  
  // Determine if user can edit scope (project owner or team leader)
  const canEditScope = user?.Id === scope?.ownerId || user?.Role === 'project_owner' || user?.Role === 'team_leader'
  
  useEffect(() => {
    const fetchScope = async () => {
      setLoading(true)
      try {
        // Try to fetch existing scope
        const response = await fetch(`/api/projects/${projectId}/scope`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('taskup_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setScope(data);
          setScopeExists(true);
        } else if (response.status === 404) {
          // Create empty scope structure
          const emptyScope: ScopeType = {
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
          setScope(emptyScope);
          setScopeExists(false);
        } else {
          throw new Error('Failed to fetch scope data');
        }
      } catch (error) {
        console.error('Error fetching project scope:', error);
        toast.error('Failed to load project scope');
      } finally {
        setLoading(false);
      }
    };

    fetchScope();
  }, [projectId]);
  
  const handleChange = (section: keyof ScopeType, field: string, value: any) => {
    if (!scope) return;
    
    setScope(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };
  
  const handleListChange = (section: keyof ScopeType, field: string, index: number, value: string) => {
    if (!scope) return;
    
    const list = [...(scope[section][field] as string[])];
    list[index] = value;
    
    handleChange(section, field, list);
  };
  
  const handleAddListItem = (section: keyof ScopeType, field: string) => {
    if (!scope) return;
    
    const list = [...(scope[section][field] as string[]), ''];
    handleChange(section, field, list);
  };
  
  const handleRemoveListItem = (section: keyof ScopeType, field: string, index: number) => {
    if (!scope) return;
    
    const list = [...(scope[section][field] as string[])];
    if (list.length <= 1) return; // Keep at least one item
    
    list.splice(index, 1);
    handleChange(section, field, list);
  };
  
  const handleAddWorkPackage = () => {
    if (!scope) return;
    
    const newWorkPackage: WorkPackage = {
      Name: '',
      Description: '',
      EstimatedDuration: 0,
      EstimatedCost: 0,
    };
    
    setScope(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        workBreakdownStructure: {
          ...prev.workBreakdownStructure,
          WorkPackages: [
            ...prev.workBreakdownStructure.WorkPackages,
            newWorkPackage,
          ],
        },
      };
    });
  };
  
  const handleWorkPackageChange = (index: number, field: keyof WorkPackage, value: any) => {
    if (!scope) return;
    
    setScope(prev => {
      if (!prev) return prev;
      
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
  
  const handleRemoveWorkPackage = (index: number) => {
    if (!scope) return;
    
    setScope(prev => {
      if (!prev) return prev;
      
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
  
  const handleSave = async () => {
    if (!scope) return;
    
    setSaving(true);
    try {
      if (scopeExists) {
        await editProjectScope(projectId, scope);
      } else {
        await addProjectScope(projectId, scope);
        setScopeExists(true);
      }
      
      setEditing(false);
      toast.success('Project scope saved successfully');
    } catch (error) {
      console.error('Failed to save project scope:', error);
      toast.error('Failed to save project scope');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <GlassPanel className="p-6">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </GlassPanel>
    );
  }
  
  if (!scope) {
    return (
      <GlassPanel className="p-6">
        <EmptyState
          title="No Scope Defined"
          description="Define the project's scope to clarify what is included and excluded."
          icon={<FileText className="h-12 w-12" />}
          action={
            canEditScope && (
              <Button onClick={() => {
                setEditing(true);
              }}>
                Define Scope
              </Button>
            )
          }
        />
      </GlassPanel>
    );
  }
  
  return (
    <GlassPanel className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Project Scope</h2>
        
        {canEditScope && !editing && (
          <Button onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" /> Edit Scope
          </Button>
        )}
        
        {canEditScope && editing && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Scope'}
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-8">
        {/* Scope Management Plan */}
        <Section title="Scope Management Plan" editing={editing}>
          <Field
            label="Scope Definition Method"
            value={scope.scopeManagementPlan.ScopeDefinitionMethod}
            editable={editing}
            onChange={(value) => handleChange('scopeManagementPlan', 'ScopeDefinitionMethod', value)}
          />
          <Field
            label="WBS Development Method"
            value={scope.scopeManagementPlan.WBSDevelopmentMethod}
            editable={editing}
            onChange={(value) => handleChange('scopeManagementPlan', 'WBSDevelopmentMethod', value)}
          />
          <Field
            label="Scope Baseline Approval Process"
            value={scope.scopeManagementPlan.ScopeBaselineApproval}
            editable={editing}
            onChange={(value) => handleChange('scopeManagementPlan', 'ScopeBaselineApproval', value)}
          />
          <Field
            label="Deliverables Impact Handling"
            value={scope.scopeManagementPlan.DeliverablesImpactHandling}
            editable={editing}
            onChange={(value) => handleChange('scopeManagementPlan', 'DeliverablesImpactHandling', value)}
          />
        </Section>
        
        {/* Requirement Management Plan */}
        <Section title="Requirement Management Plan" editing={editing}>
          <Field
            label="Requirements Planning Approach"
            value={scope.requirementManagementPlan.ReqPlanningApproach}
            editable={editing}
            onChange={(value) => handleChange('requirementManagementPlan', 'ReqPlanningApproach', value)}
          />
          <Field
            label="Requirements Change Control"
            value={scope.requirementManagementPlan.ReqChangeControl}
            editable={editing}
            onChange={(value) => handleChange('requirementManagementPlan', 'ReqChangeControl', value)}
          />
          <Field
            label="Requirements Prioritization"
            value={scope.requirementManagementPlan.ReqPrioritization}
            editable={editing}
            onChange={(value) => handleChange('requirementManagementPlan', 'ReqPrioritization', value)}
          />
          <Field
            label="Requirements Metrics"
            value={scope.requirementManagementPlan.ReqMetrics}
            editable={editing}
            onChange={(value) => handleChange('requirementManagementPlan', 'ReqMetrics', value)}
          />
        </Section>
        
        {/* Requirement Documentation */}
        <Section title="Requirement Documentation" editing={editing}>
          <ListField
            label="Stakeholder Needs"
            items={scope.requirementDocumentation.StakeholderNeeds}
            editable={editing}
            onChange={(index, value) => handleListChange('requirementDocumentation', 'StakeholderNeeds', index, value)}
            onAdd={() => handleAddListItem('requirementDocumentation', 'StakeholderNeeds')}
            onRemove={(index) => handleRemoveListItem('requirementDocumentation', 'StakeholderNeeds', index)}
          />
          <ListField
            label="Quantified Expectations"
            items={scope.requirementDocumentation.QuantifiedExpectations}
            editable={editing}
            onChange={(index, value) => handleListChange('requirementDocumentation', 'QuantifiedExpectations', index, value)}
            onAdd={() => handleAddListItem('requirementDocumentation', 'QuantifiedExpectations')}
            onRemove={(index) => handleRemoveListItem('requirementDocumentation', 'QuantifiedExpectations', index)}
          />
          <Field
            label="Traceability"
            value={scope.requirementDocumentation.Traceability}
            editable={editing}
            onChange={(value) => handleChange('requirementDocumentation', 'Traceability', value)}
          />
        </Section>
        
        {/* Project Scope Statement */}
        <Section title="Project Scope Statement" editing={editing}>
          <Field
            label="End Product Scope Description"
            value={scope.projectScopeStatement.EndProductScope}
            editable={editing}
            onChange={(value) => handleChange('projectScopeStatement', 'EndProductScope', value)}
            textarea
          />
          <ListField
            label="Deliverables"
            items={scope.projectScopeStatement.Deliverables}
            editable={editing}
            onChange={(index, value) => handleListChange('projectScopeStatement', 'Deliverables', index, value)}
            onAdd={() => handleAddListItem('projectScopeStatement', 'Deliverables')}
            onRemove={(index) => handleRemoveListItem('projectScopeStatement', 'Deliverables', index)}
          />
          <Field
            label="Acceptance Criteria"
            value={scope.projectScopeStatement.AcceptanceCriteria}
            editable={editing}
            onChange={(value) => handleChange('projectScopeStatement', 'AcceptanceCriteria', value)}
            textarea
          />
          <Field
            label="Exclusions"
            value={scope.projectScopeStatement.Exclusions}
            editable={editing}
            onChange={(value) => handleChange('projectScopeStatement', 'Exclusions', value)}
            textarea
          />
          <Field
            label="Optional Statement of Work"
            value={scope.projectScopeStatement.OptionalSOW}
            editable={editing}
            onChange={(value) => handleChange('projectScopeStatement', 'OptionalSOW', value)}
            textarea
          />
        </Section>
        
        {/* Work Breakdown Structure */}
        <Section title="Work Breakdown Structure" editing={editing}>
          <Field
            label="Scope Baseline Reference"
            value={scope.workBreakdownStructure.ScopeBaselineReference}
            editable={editing}
            onChange={(value) => handleChange('workBreakdownStructure', 'ScopeBaselineReference', value)}
          />
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Work Packages</h4>
              {editing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddWorkPackage}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Package
                </Button>
              )}
            </div>
            
            {scope.workBreakdownStructure.WorkPackages.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2">
                No work packages defined yet.
                {editing && " Use the button above to add packages."}
              </div>
            ) : (
              <div className="space-y-4">
                {scope.workBreakdownStructure.WorkPackages.map((pkg, index) => (
                  <div 
                    key={index}
                    className="border border-white/10 rounded-md p-3 space-y-3 bg-white/5"
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="text-sm font-medium">Package #{index + 1}</h5>
                      {editing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveWorkPackage(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    
                    <Field
                      label="Name"
                      value={pkg.Name}
                      editable={editing}
                      onChange={(value) => handleWorkPackageChange(index, 'Name', value)}
                    />
                    <Field
                      label="Description"
                      value={pkg.Description}
                      editable={editing}
                      onChange={(value) => handleWorkPackageChange(index, 'Description', value)}
                      textarea
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Estimated Duration (days)"
                        value={pkg.EstimatedDuration.toString()}
                        editable={editing}
                        onChange={(value) => handleWorkPackageChange(index, 'EstimatedDuration', Number(value) || 0)}
                        type="number"
                      />
                      <Field
                        label="Estimated Cost ($)"
                        value={pkg.EstimatedCost.toString()}
                        editable={editing}
                        onChange={(value) => handleWorkPackageChange(index, 'EstimatedCost', Number(value) || 0)}
                        type="number"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>
      </div>
    </GlassPanel>
  );
}

// Helper Components

function Section({ 
  title, 
  children, 
  editing 
}: { 
  title: string;
  children: React.ReactNode;
  editing: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className={cn(
        "border-b pb-1",
        editing ? "border-primary/30" : "border-white/10"
      )}>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className={cn(
        "space-y-4 transition-all",
        editing ? "pl-0" : "pl-0"
      )}>
        {children}
      </div>
    </section>
  );
}

function Field({ 
  label, 
  value, 
  editable, 
  onChange,
  textarea = false,
  type = "text"
}: { 
  label: string; 
  value: string; 
  editable: boolean; 
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      
      {editable ? (
        textarea ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[100px]"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        )
      ) : (
        <div className="text-sm">
          {value || <span className="text-muted-foreground italic">Not specified</span>}
        </div>
      )}
    </div>
  );
}

function ListField({ 
  label, 
  items, 
  editable, 
  onChange, 
  onAdd, 
  onRemove 
}: { 
  label: string; 
  items: string[]; 
  editable: boolean; 
  onChange: (index: number, value: string) => void; 
  onAdd: () => void; 
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        
        {editable && (
          <Button variant="ghost" size="sm" onClick={onAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {editable ? (
              <>
                <Input
                  value={item}
                  onChange={(e) => onChange(index, e.target.value)}
                  placeholder={`${label} item ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onRemove(index)}
                  disabled={items.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <div className="text-sm flex items-center">
                <span className="mr-2">•</span>
                {item || <span className="text-muted-foreground italic">Not specified</span>}
              </div>
            )}
          </div>
        ))}
        
        {items.length === 0 && !editable && (
          <div className="text-sm text-muted-foreground italic">No items specified</div>
        )}
      </div>
    </div>
  );
}