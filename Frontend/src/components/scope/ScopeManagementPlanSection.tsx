import { GlassPanel } from '@/components/ui/GlassPanel';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScopeManagementPlanSectionProps {
  data: {
    ScopeDefinitionMethod: string;
    WBSDevelopmentMethod: string;
    ScopeBaselineApproval: string;
    DeliverablesImpactHandling: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

export function ScopeManagementPlanSection({
  data,
  isEditing,
  onChange
}: ScopeManagementPlanSectionProps) {
  return (
    <GlassPanel className="relative overflow-hidden transition-all duration-300 section-card">
      {/* Theme-aware accent strip */}
      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <ClipboardList className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-xl font-semibold">Scope Management Plan</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Scope Definition Method
            </label>
            {isEditing ? (
              <div className="form-field-focus-ring">
                <Textarea
                  value={data.ScopeDefinitionMethod || ''}
                  onChange={(e) => onChange('ScopeDefinitionMethod', e.target.value)}
                  placeholder="Describe the method that will be used to define the scope..."
                  className="min-h-[100px] bg-background/50 text-foreground"
                />
              </div>
            ) : (
              <div className="p-3 rounded-md bg-muted/20 text-foreground">
                {data.ScopeDefinitionMethod || (
                  <span className="italic opacity-50">No scope definition method defined</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              WBS Development Method
            </label>
            {isEditing ? (
              <div className="form-field-focus-ring">
                <Textarea
                  value={data.WBSDevelopmentMethod || ''}
                  onChange={(e) => onChange('WBSDevelopmentMethod', e.target.value)}
                  placeholder="Describe the method used for creating the work breakdown structure..."
                  className="min-h-[100px] bg-background/50 text-foreground"
                />
              </div>
            ) : (
              <div className="p-3 rounded-md bg-muted/20 text-foreground">
                {data.WBSDevelopmentMethod || (
                  <span className="italic opacity-50">No WBS development method defined</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Scope Baseline Approval Process
            </label>
            {isEditing ? (
              <div className="form-field-focus-ring">
                <Textarea
                  value={data.ScopeBaselineApproval || ''}
                  onChange={(e) => onChange('ScopeBaselineApproval', e.target.value)}
                  placeholder="Define the approval process for the scope baseline..."
                  className="min-h-[100px] bg-background/50 text-foreground"
                />
              </div>
            ) : (
              <div className="p-3 rounded-md bg-muted/20 text-foreground">
                {data.ScopeBaselineApproval || (
                  <span className="italic opacity-50">No scope baseline approval process defined</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Deliverables Impact Handling
            </label>
            {isEditing ? (
              <div className="form-field-focus-ring">
                <Textarea
                  value={data.DeliverablesImpactHandling || ''}
                  onChange={(e) => onChange('DeliverablesImpactHandling', e.target.value)}
                  placeholder="Describe how changes to deliverables that impact scope will be handled..."
                  className="min-h-[100px] bg-background/50 text-foreground"
                />
              </div>
            ) : (
              <div className="p-3 rounded-md bg-muted/20 text-foreground">
                {data.DeliverablesImpactHandling || (
                  <span className="italic opacity-50">No deliverables impact handling defined</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}