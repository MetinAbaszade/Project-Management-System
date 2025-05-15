import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList } from 'lucide-react';

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
    <GlassPanel className="relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <ClipboardList className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">Scope Management Plan</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scope Definition Method
            </label>
            {isEditing ? (
              <Textarea
                value={data.ScopeDefinitionMethod || ''}
                onChange={(e) => onChange('ScopeDefinitionMethod', e.target.value)}
                placeholder="Describe the method that will be used to define the scope..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {data.ScopeDefinitionMethod || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No scope definition method defined</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              WBS Development Method
            </label>
            {isEditing ? (
              <Textarea
                value={data.WBSDevelopmentMethod || ''}
                onChange={(e) => onChange('WBSDevelopmentMethod', e.target.value)}
                placeholder="Describe the method used for creating the work breakdown structure..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {data.WBSDevelopmentMethod || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No WBS development method defined</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scope Baseline Approval Process
            </label>
            {isEditing ? (
              <Textarea
                value={data.ScopeBaselineApproval || ''}
                onChange={(e) => onChange('ScopeBaselineApproval', e.target.value)}
                placeholder="Define the approval process for the scope baseline..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {data.ScopeBaselineApproval || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No scope baseline approval process defined</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deliverables Impact Handling
            </label>
            {isEditing ? (
              <Textarea
                value={data.DeliverablesImpactHandling || ''}
                onChange={(e) => onChange('DeliverablesImpactHandling', e.target.value)}
                placeholder="Describe how changes to deliverables that impact scope will be handled..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {data.DeliverablesImpactHandling || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No deliverables impact handling defined</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}