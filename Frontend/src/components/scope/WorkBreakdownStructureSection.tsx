import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileBarChart, GitBranch, Plus, Trash2, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <GitBranch className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Work Breakdown Structure</h2>
        </div>
        
        <div className="space-y-6">
          {/* Scope Baseline Reference */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Scope Baseline Reference
            </label>
            {isEditing ? (
              <Textarea
                value={data.ScopeBaselineReference || ''}
                onChange={(e) => onChange('ScopeBaselineReference', e.target.value)}
                placeholder="Reference to the scope baseline document or description..."
                className="min-h-[80px] bg-background/50"
              />
            ) : (
              <div className="p-3 bg-muted/20 rounded-md text-foreground">
                {data.ScopeBaselineReference || (
                  <span className="text-muted-foreground italic">No scope baseline reference defined</span>
                )}
              </div>
            )}
          </div>
          
          {/* Work Packages */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-medium">Work Packages</h3>
                <p className="text-sm text-muted-foreground">
                  Breakdown of project work into smaller, manageable components
                </p>
              </div>
              
              {isEditing && (
                <Button
                  onClick={onAddWorkPackage}
                  size="sm"
                  className="ml-auto bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Work Package
                </Button>
              )}
            </div>
            
            {/* Summary Stats - only show if at least one work package exists */}
            {data.WorkPackages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/10 rounded-lg p-4 flex items-center">
                  <DollarSign className="h-6 w-6 text-primary mr-2" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Estimated Cost</div>
                    <div className="text-lg font-semibold">${totalCost.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="bg-primary/10 rounded-lg p-4 flex items-center">
                  <Clock className="h-6 w-6 text-primary mr-2" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Duration (days)</div>
                    <div className="text-lg font-semibold">{totalDuration}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Work Package List */}
            <div className="space-y-4">
              {data.WorkPackages.length === 0 ? (
                <div className="p-6 text-center bg-muted/20 rounded-md">
                  <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No work packages defined yet</p>
                  {isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onAddWorkPackage}
                      className="mt-2 border-primary text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Work Package
                    </Button>
                  )}
                </div>
              ) : (
                data.WorkPackages.map((pkg, index) => (
                  <div 
                    key={index} 
                    className="border border-border rounded-lg p-4 bg-background/50 shadow-sm"
                  >
                    <div className="flex justify-between mb-4">
                      <div className="font-medium">Work Package #{index + 1}</div>
                      
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          onClick={() => onRemoveWorkPackage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Name
                        </label>
                        {isEditing ? (
                          <Input
                            value={pkg.Name || ''}
                            onChange={(e) => onWorkPackageChange(index, 'Name', e.target.value)}
                            placeholder="Work package name"
                            className="bg-background"
                          />
                        ) : (
                          <div className="p-2 bg-muted/20 rounded-md text-foreground">
                            {pkg.Name || <span className="text-muted-foreground italic">No name provided</span>}
                          </div>
                        )}
                      </div>
                      
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Description
                        </label>
                        {isEditing ? (
                          <Textarea
                            value={pkg.Description || ''}
                            onChange={(e) => onWorkPackageChange(index, 'Description', e.target.value)}
                            placeholder="Work package description"
                            className="min-h-[80px] bg-background/50"
                          />
                        ) : (
                          <div className="p-2 bg-muted/20 rounded-md text-foreground">
                            {pkg.Description || <span className="text-muted-foreground italic">No description provided</span>}
                          </div>
                        )}
                      </div>
                      
                      {/* Estimated Duration and Cost */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Estimated Duration (days)
                          </label>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              value={pkg.EstimatedDuration || 0}
                              onChange={(e) => onWorkPackageChange(index, 'EstimatedDuration', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="bg-background"
                            />
                          ) : (
                            <div className="p-2 bg-muted/20 rounded-md text-foreground">
                              {pkg.EstimatedDuration || 0} days
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Estimated Cost ($)
                          </label>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              value={pkg.EstimatedCost || 0}
                              onChange={(e) => onWorkPackageChange(index, 'EstimatedCost', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="bg-background"
                            />
                          ) : (
                            <div className="p-2 bg-muted/20 rounded-md text-foreground">
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