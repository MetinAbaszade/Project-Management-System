import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface ProjectScopeStatementSectionProps {
  data: {
    EndProductScope: string;
    Deliverables: string[];
    AcceptanceCriteria: string;
    Exclusions: string;
    OptionalSOW: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
  onListChange: (section: string, field: string, index: number, value: string) => void;
  onAddListItem: (section: string, field: string) => void;
  onRemoveListItem: (section: string, field: string, index: number) => void;
}

export function ProjectScopeStatementSection({
  data,
  isEditing,
  onChange,
  onListChange,
  onAddListItem,
  onRemoveListItem
}: ProjectScopeStatementSectionProps) {
  return (
    <GlassPanel className="relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-amber-500 mr-2" />
          <h2 className="text-xl font-semibold">Project Scope Statement</h2>
        </div>
        
        <div className="space-y-6">
          {/* End Product Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Product Scope Description
            </label>
            {isEditing ? (
              <Textarea
                value={data.EndProductScope || ''}
                onChange={(e) => onChange('EndProductScope', e.target.value)}
                placeholder="Describe the final product or service that will be delivered..."
                className="min-h-[120px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {data.EndProductScope || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No end product scope description defined</span>
                )}
              </div>
            )}
          </div>
          
          {/* Deliverables */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Deliverables
              </label>
              
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddListItem('projectScopeStatement', 'Deliverables')}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Deliverable
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {data.Deliverables.length === 0 ? (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <span className="text-gray-400 dark:text-gray-500 italic">No deliverables defined</span>
                </div>
              ) : (
                data.Deliverables.map((deliverable, index) => (
                  <div key={index} className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Input
                          value={deliverable || ''}
                          onChange={(e) => onListChange('projectScopeStatement', 'Deliverables', index, e.target.value)}
                          placeholder={`Deliverable #${index + 1}`}
                          className="flex-1"
                        />
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={() => onRemoveListItem('projectScopeStatement', 'Deliverables', index)}
                          disabled={data.Deliverables.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md w-full">
                        {deliverable || <span className="text-gray-400 dark:text-gray-500 italic">Empty deliverable</span>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Acceptance Criteria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Acceptance Criteria
            </label>
            {isEditing ? (
              <Textarea
                value={data.AcceptanceCriteria || ''}
                onChange={(e) => onChange('AcceptanceCriteria', e.target.value)}
                placeholder="Define the criteria that will be used to accept project deliverables..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {data.AcceptanceCriteria || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No acceptance criteria defined</span>
                )}
              </div>
            )}
          </div>
          
          {/* Exclusions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Exclusions
            </label>
            {isEditing ? (
              <Textarea
                value={data.Exclusions || ''}
                onChange={(e) => onChange('Exclusions', e.target.value)}
                placeholder="Explicitly state what is NOT included in the project scope..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {data.Exclusions || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No exclusions defined</span>
                )}
              </div>
            )}
          </div>
          
          {/* Optional Statement of Work */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Optional Statement of Work
            </label>
            {isEditing ? (
              <Textarea
                value={data.OptionalSOW || ''}
                onChange={(e) => onChange('OptionalSOW', e.target.value)}
                placeholder="Additional details or statement of work..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {data.OptionalSOW || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No optional statement of work defined</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}