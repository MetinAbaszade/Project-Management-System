'use client';

import { useEffect, useState } from 'react';
import { getProjectResources, createResource, getProjectResourcePlans, createResourcePlan } from '@/api/ResourceAPI';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  PlusCircle, 
  DollarSign, 
  BriefcaseBusiness, 
  Users, 
  PackageOpen,
  BarChart 
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { BudgetChart } from '@/components/budget/BudgetChart';
import { ResourceTable } from '@/components/budget/ResourceTable';
import { ResourcePlanTable } from '@/components/budget/ResourcePlanTable';

interface Props {
  projectId: string;
  userRole: string | null;
  budget: number;
}

export function ProjectBudget({ projectId, userRole, budget }: Props) {
  const { user } = useAuthContext();
  const [resources, setResources] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  
  const [resourceForm, setResourceForm] = useState({
    Name: '',
    Type: 'Material',
    Description: '',
    Unit: '',
    UnitCost: 0,
    Total: 0,
    Available: 0
  });
  
  const [planForm, setPlanForm] = useState({
    Notes: ''
  });

  const canManageBudget = userRole === 'project_owner' || userRole === 'team_leader';

  useEffect(() => {
    fetchBudgetData();
  }, [projectId]);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const [resourcesData, plansData] = await Promise.all([
        getProjectResources(projectId),
        getProjectResourcePlans(projectId)
      ]);
      
      setResources(resourcesData);
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to load budget data:', error);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceCreate = async () => {
    if (!resourceForm.Name || !resourceForm.Unit) {
      toast.error('Name and unit are required');
      return;
    }
    
    try {
      await createResource({
        ProjectId: projectId,
        Name: resourceForm.Name,
        Type: resourceForm.Type,
        Description: resourceForm.Description,
        Unit: resourceForm.Unit,
        Total: resourceForm.Total,
        Available: resourceForm.Available
      });
      
      setResourceDialogOpen(false);
      toast.success('Resource created successfully');
      fetchBudgetData();
      
      // Reset form
      setResourceForm({
        Name: '',
        Type: 'Material',
        Description: '',
        Unit: '',
        UnitCost: 0,
        Total: 0,
        Available: 0
      });
    } catch (error) {
      console.error('Failed to create resource:', error);
      toast.error('Failed to create resource');
    }
  };

  const handlePlanCreate = async () => {
    try {
      await createResourcePlan({
        ProjectId: projectId,
        Notes: planForm.Notes
      });
      
      setPlanDialogOpen(false);
      toast.success('Resource plan created successfully');
      fetchBudgetData();
      
      // Reset form
      setPlanForm({
        Notes: ''
      });
    } catch (error) {
      console.error('Failed to create resource plan:', error);
      toast.error('Failed to create resource plan');
    }
  };

  const totalResourceCost = resources.reduce((sum, resource) => {
    return sum + ((resource.UnitCost || 0) * (resource.Total || 0));
  }, 0);
  
  const availableResourceCost = resources.reduce((sum, resource) => {
    return sum + ((resource.UnitCost || 0) * (resource.Available || 0));
  }, 0);
  
  const usedBudget = totalResourceCost;
  const remainingBudget = budget - usedBudget;
  const budgetPercentUsed = budget > 0 ? (usedBudget / budget) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Resources', value: 'resources' },
    { label: 'Resource Plans', value: 'plans' }
  ];

  const resourceTypeOptions = [
    { label: 'Material', value: 'Material' },
    { label: 'Human', value: 'Human' },
    { label: 'Equipment', value: 'Equipment' },
    { label: 'Service', value: 'Service' }
  ];

  return (
    <div className="space-y-6">
      <Tabs
        tabs={tabs}
        value={activeTab}
        onChange={setActiveTab}
      />
      
      {activeTab === 'overview' && (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Total Budget</h3>
              </div>
              <p className="text-2xl font-bold mt-2">${budget.toLocaleString()}</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <PackageOpen className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Used Budget</h3>
              </div>
              <p className="text-2xl font-bold mt-2">${usedBudget.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{budgetPercentUsed.toFixed(1)}% of total</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Remaining</h3>
              </div>
              <p className={`text-2xl font-bold mt-2 ${remainingBudget < 0 ? 'text-red-500' : ''}`}>
                ${remainingBudget.toLocaleString()}
              </p>
            </div>
          </div>
          
          {budget > 0 ? (
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Budget Usage</h3>
              </div>
              <BudgetChart 
                budget={budget} 
                used={usedBudget} 
                resources={resources}
              />
            </Card>
          ) : (
            <EmptyState
              title="No Budget Set"
              description="No budget has been set for this project."
              icon={<DollarSign className="h-12 w-12" />}
            />
          )}
        </>
      )}
      
      {activeTab === 'resources' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Project Resources</h3>
            {canManageBudget && (
              <Button onClick={() => setResourceDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-1" /> Add Resource
              </Button>
            )}
          </div>
          
          {resources.length === 0 ? (
            <EmptyState
              title="No Resources"
              description="No resources have been added to this project."
              icon={<PackageOpen className="h-12 w-12" />}
              action={
                canManageBudget && (
                  <Button onClick={() => setResourceDialogOpen(true)}>
                    Add Resource
                  </Button>
                )
              }
            />
          ) : (
            <ResourceTable 
              resources={resources} 
              canEdit={canManageBudget} 
              onRefresh={fetchBudgetData}
            />
          )}
        </>
      )}
      
      {activeTab === 'plans' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Resource Plans</h3>
            {canManageBudget && (
              <Button onClick={() => setPlanDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-1" /> Add Plan
              </Button>
            )}
          </div>
          
          {plans.length === 0 ? (
            <EmptyState
              title="No Resource Plans"
              description="No resource plans have been created for this project."
              icon={<Users className="h-12 w-12" />}
              action={
                canManageBudget && (
                  <Button onClick={() => setPlanDialogOpen(true)}>
                    Create Plan
                  </Button>
                )
              }
            />
          ) : (
            <ResourcePlanTable 
              plans={plans} 
              canEdit={canManageBudget} 
              onRefresh={fetchBudgetData}
            />
          )}
        </>
      )}
      
      {/* Resource Dialog */}
      <Dialog
        open={resourceDialogOpen}
        onOpenChange={setResourceDialogOpen}
        title="Add Resource"
        description="Add a new resource to the project"
      >
        <div className="space-y-4">
          <Input
            placeholder="Resource name"
            value={resourceForm.Name}
            onChange={e => setResourceForm({...resourceForm, Name: e.target.value})}
          />
          
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              className="w-full p-2 border rounded-md"
              value={resourceForm.Type}
              onChange={e => setResourceForm({...resourceForm, Type: e.target.value})}
            >
              {resourceTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <Textarea
            placeholder="Description (optional)"
            value={resourceForm.Description}
            onChange={e => setResourceForm({...resourceForm, Description: e.target.value})}
            rows={2}
          />
          
          <Input
            placeholder="Unit (e.g., hours, kg, pieces)"
            value={resourceForm.Unit}
            onChange={e => setResourceForm({...resourceForm, Unit: e.target.value})}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Unit Cost ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={resourceForm.UnitCost}
                onChange={e => setResourceForm({...resourceForm, UnitCost: parseFloat(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Total Quantity</label>
              <Input
                type="number"
                placeholder="0"
                value={resourceForm.Total}
                onChange={e => setResourceForm({...resourceForm, Total: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Available Quantity</label>
            <Input
              type="number"
              placeholder="0"
              value={resourceForm.Available}
              onChange={e => setResourceForm({...resourceForm, Available: parseFloat(e.target.value)})}
            />
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Total Cost: ${(resourceForm.UnitCost * resourceForm.Total).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setResourceDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleResourceCreate}>
            Create Resource
          </Button>
        </div>
      </Dialog>
      
      {/* Resource Plan Dialog */}
      <Dialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        title="Create Resource Plan"
        description="Document your resource allocation strategy"
      >
        <div className="space-y-4">
          <Textarea
            placeholder="Resource plan notes and allocation strategy"
            value={planForm.Notes}
            onChange={e => setPlanForm({...planForm, Notes: e.target.value})}
            rows={6}
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePlanCreate}>
            Create Plan
          </Button>
        </div>
      </Dialog>
    </div>
  );
}