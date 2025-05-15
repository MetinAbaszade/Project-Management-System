import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileBarChart, GitBranch, Plus, Trash2, DollarSign, Clock } from 'lucide-react';

interface WorkPackage {
  Name: string;
  Description: string;
  EstimatedDuration: number;
  EstimatedCost: number;
}

interface WorkBreakdownStructureSectionProps {
  data: {
    WorkPackages: WorkPackage[];
    ScopeBaselineReference: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
  onAddWorkPackage: () => void;
  onWorkPackageChange: (index: number, field: string, value: any) => void;
  onRemoveWorkPackage: (index: number) => void;
}

export function WorkBreakdownStructureSection({
  data,
  isEditing,
  onChange,
  onAddWorkPackage,
  onWorkPackageChange,
  onRemoveWorkPackage
}: WorkBreakdownStructureSectionProps) {
  // Calculate total cost & duration
  const totalCost = data.WorkPackages.reduce((sum, pkg) => sum + (pkg.EstimatedCost || 0), 0);
  const totalDuration = data.WorkPackages.reduce((sum, pkg) => sum + (pkg.EstimatedDuration || 0), 0);
  
  return (
    <GlassPanel className="relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <GitBranch className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-xl font-semibold">Work Breakdown Structure</h2>
        </div>
        
        <div className="space-y-6">
          {/* Scope Baseline Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scope Baseline Reference
            </label>
            {isEditing ? (
              <Textarea
                value={data.ScopeBaselineReference || ''}
                onChange={(e) => onChange('ScopeBaselineReference', e.target.value)}
                placeholder="Reference to the scope baseline document or description..."
                className="min-h-[80px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {data.ScopeBaselineReference || (
                  <span className="text-gray-400 dark:text-gray-500 italic">No scope baseline reference defined</span>
                )}
              </div>
            )}
          </div>
          
          {/* Work Packages */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-medium">Work Packages</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Breakdown of project work into smaller, manageable components
                </p>
              </div>
              
              {isEditing && (
                <Button
                  onClick={onAddWorkPackage}
                  size="sm"
                  className="ml-auto"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Work Package
                </Button>
              )}
            </div>
            
            {/* Summary Stats - only show if at least one work package exists */}
            {data.WorkPackages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center">
                  <DollarSign className="h-6 w-6 text-green-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Estimated Cost</div>
                    <div className="text-lg font-semibold">${totalCost.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center">
                  <Clock className="h-6 w-6 text-blue-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Duration (days)</div>
                    <div className="text-lg font-semibold">{totalDuration}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Work Package List */}
            <div className="space-y-4">
              {data.WorkPackages.length === 0 ? (
                <div className="p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-md">
                  <GitBranch className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">No work packages defined yet</p>
                  {isEditing && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={onAddWorkPackage}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Work Package
                    </Button>
                  )}
                </div>
              ) : (
                data.WorkPackages.map((pkg, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
                  >
                    <div className="flex justify-between mb-4">
                      <div className="font-medium">Work Package #{index + 1}</div>
                      
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={() => onRemoveWorkPackage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        {isEditing ? (
                          <Input
                            value={pkg.Name || ''}
                            onChange={(e) => onWorkPackageChange(index, 'Name', e.target.value)}
                            placeholder="Work package name"
                          />
                        ) : (
                          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                            {pkg.Name || <span className="text-gray-400 dark:text-gray-500 italic">No name provided</span>}
                          </div>
                        )}
                      </div>
                      
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        {isEditing ? (
                          <Textarea
                            value={pkg.Description || ''}
                            onChange={(e) => onWorkPackageChange(index, 'Description', e.target.value)}
                            placeholder="Work package description"
                            className="min-h-[80px]"
                          />
                        ) : (
                          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                            {pkg.Description || <span className="text-gray-400 dark:text-gray-500 italic">No description provided</span>}
                          </div>
                        )}
                      </div>
                      
                      {/* Estimated Duration and Cost */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Estimated Duration (days)
                          </label>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              value={pkg.EstimatedDuration || 0}
                              onChange={(e) => onWorkPackageChange(index, 'EstimatedDuration', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                              {pkg.EstimatedDuration || 0} days
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Estimated Cost ($)
                          </label>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              value={pkg.EstimatedCost || 0}
                              onChange={(e) => onWorkPackageChange(index, 'EstimatedCost', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                              ${(pkg.EstimatedCost || 0).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}