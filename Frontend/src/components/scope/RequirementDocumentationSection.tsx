import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileBarChart, Plus, Trash2 } from 'lucide-react';

interface RequirementDocumentationSectionProps {
  data: {
    StakeholderNeeds: string[];
    QuantifiedExpectations: string[];
    Traceability: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
  onListChange: (section: string, field: string, index: number, value: string) => void;
  onAddListItem: (section: string, field: string) => void;
  onRemoveListItem: (section: string, field: string, index: number) => void;
}

export function RequirementDocumentationSection({
  data,
  isEditing,
  onChange,
  onListChange,
  onAddListItem,
  onRemoveListItem
}: RequirementDocumentationSectionProps) {
  return (
    <GlassPanel className="relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <FileBarChart className="h-5 w-5 text-pink-500 mr-2" />
          <h2 className="text-xl font-semibold">Requirement Documentation</h2>
        </div>
        
        <div className="space-y-6">
          {/* Stakeholder Needs List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Stakeholder Needs
              </label>
              
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddListItem('requirementDocumentation', 'StakeholderNeeds')}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Need
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {data.StakeholderNeeds.length === 0 ? (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <span className="text-gray-400 dark:text-gray-500 italic">No stakeholder needs defined</span>
                </div>
              ) : (
                data.StakeholderNeeds.map((need, index) => (
                  <div key={index} className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Input
                          value={need || ''}
                          onChange={(e) => onListChange('requirementDocumentation', 'StakeholderNeeds', index, e.target.value)}
                          placeholder={`Stakeholder need #${index + 1}`}
                          className="flex-1"
                        />
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={() => onRemoveListItem('requirementDocumentation', 'StakeholderNeeds', index)}
                          disabled={data.StakeholderNeeds.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md w-full">
                        {need || <span className="text-gray-400 dark:text-gray-500 italic">Empty need</span>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Quantified Expectations List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantified Expectations
              </label>
              
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddListItem('requirementDocumentation', 'QuantifiedExpectations')}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Expectation
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {data.QuantifiedExpectations.length === 0 ? (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <span className="text-gray-400 dark:text-gray-500 italic">No quantified expectations defined</span>
                </div>
              ) : (
                data.QuantifiedExpectations.map((expectation, index) => (
                  <div key={index} className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Input
                          value={expectation || ''}
                          onChange={(e) => onListChange('requirementDocumentation', 'QuantifiedExpectations', index, e.target.value)}
                          placeholder={`Quantified expectation #${index + 1}`}
                          className="flex-1"
                        />
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={() => onRemoveListItem('requirementDocumentation', 'QuantifiedExpectations', index)}
                          disabled={data.QuantifiedExpectations.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md w-full">
                        {expectation || <span className="text-gray-400 dark:text-gray-500 italic">Empty expectation</span>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Traceability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Traceability
            </label>
            {isEditing ? (
              <Textarea
                value={data.Traceability || ''}
                onChange={(e) => onChange('Traceability', e.target.value)}
                placeholder="Describe how requirements will be traced throughout the project lifecycle..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {data.Traceability || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No traceability defined</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}