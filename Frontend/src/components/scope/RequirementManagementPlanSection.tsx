import { GlassPanel } from '@/components/ui/GlassPanel';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequirementManagementPlanSectionProps {
  data: {
    ReqPlanningApproach: string;
    ReqChangeControl: string;
    ReqPrioritization: string;
    ReqMetrics: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

export function RequirementManagementPlanSection({
  data,
  isEditing,
  onChange
}: RequirementManagementPlanSectionProps) {
  return (
    <GlassPanel className="relative overflow-hidden transition-all duration-300 section-card">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Requirement Management Plan</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Requirement Planning Approach
            </label>
            {isEditing ? (
              <div className="form-field-focus-ring">
                <Textarea
                  value={data.ReqPlanningApproach || ''}
                  onChange={(e) => onChange('ReqPlanningApproach', e.target.value)}
                  placeholder="Describe the approach for planning project requirements..."
                  className="min-h-[100px] bg-background/50"
                />
              </div>
            ) : (
              <div className="p-3 bg-muted/20 rounded-md text-foreground">
                {data.ReqPlanningApproach || (
                  <span className="text-muted-foreground italic">No requirement planning approach defined</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Requirement Change Control
            </label>
            {isEditing ? (
              <div className="form-field-focus-ring">
                <Textarea
                  value={data.ReqChangeControl || ''}
                  onChange={(e) => onChange('ReqChangeControl', e.target.value)}
                  placeholder="Define how requirement changes will be controlled throughout the project..."
                  className="min-h-[100px] bg-background/50"
                />
              </div>
            ) : (
              <div className="p-3 bg-muted/20 rounded-md text-foreground">
                {data.ReqChangeControl || (
                  <span className="text-muted-foreground italic">No requirement change control defined</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Requirement Prioritization
            </label>
            {isEditing ? (
              <div className="form-field-focus-ring">
                <Textarea
                  value={data.ReqPrioritization || ''}
                  onChange={(e) => onChange('ReqPrioritization', e.target.value)}
                  placeholder="Define the method for prioritizing requirements..."
                  className="min-h-[100px] bg-background/50"
                />
              </div>
            ) : (
              <div className="p-3 bg-muted/20 rounded-md text-foreground">
                {data.ReqPrioritization || (
                  <span className="text-muted-foreground italic">No requirement prioritization defined</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Requirement Metrics
            </label>
            {isEditing ? (
              <div className="form-field-focus-ring">
                <Textarea
                  value={data.ReqMetrics || ''}
                  onChange={(e) => onChange('ReqMetrics', e.target.value)}
                  placeholder="Define the metrics that will be used to track requirements..."
                  className="min-h-[100px] bg-background/50"
                />
              </div>
            ) : (
              <div className="p-3 bg-muted/20 rounded-md text-foreground">
                {data.ReqMetrics || (
                  <span className="text-muted-foreground italic">No requirement metrics defined</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}