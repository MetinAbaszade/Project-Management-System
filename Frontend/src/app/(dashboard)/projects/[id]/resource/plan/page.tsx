'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

// Icons
import {
  ArrowLeft,
  Calendar,
  Settings,
  Save,
  Plus,
  FileUp,
  FileText,
  Download,
  Trash2,
  Package,
  Database,
  Edit,
  Table,
  BarChart,
  MoreHorizontal,
  Briefcase,
  XCircle,
  HardHat,
  ExternalLink,
  UserPlus,
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Table as UITable,
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  TableCaption 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ResourcePlanPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  
  const [resources, setResources] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [planNotes, setPlanNotes] = useState('');
  const [showAddAttachmentDialog, setShowAddAttachmentDialog] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  // Load resources and plan from localStorage
  useEffect(() => {
    setLoading(true);
    
    // Small delay to simulate loading
    const timer = setTimeout(() => {
      try {
        // Get resources from localStorage
        const storedResources = localStorage.getItem(`project_${projectId}_resources`);
        if (storedResources) {
          setResources(JSON.parse(storedResources));
        }
        
        // Get resource plan from localStorage
        const storedPlan = localStorage.getItem(`project_${projectId}_resource_plan`);
        if (storedPlan) {
          const planData = JSON.parse(storedPlan);
          setPlan(planData);
          setPlanNotes(planData.Notes || '');
          setAttachments(planData.Attachments || []);
        } else {
          // Create a new empty plan
          const newPlan = {
            Id: uuidv4(),
            ProjectId: projectId,
            OwnerId: 'current-user-id', // In a real app, this would be the current user's ID
            Notes: '',
            CreatedAt: new Date().toISOString(),
            IsDeleted: false,
            Attachments: []
          };
          localStorage.setItem(`project_${projectId}_resource_plan`, JSON.stringify(newPlan));
          setPlan(newPlan);
        }
      } catch (error) {
        console.error("Error loading resource plan:", error);
        toast.error("Failed to load resource plan");
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [projectId]);
  
  // Save plan notes
  const handleSavePlanNotes = () => {
    try {
      const updatedPlan = { ...plan, Notes: planNotes };
      localStorage.setItem(`project_${projectId}_resource_plan`, JSON.stringify(updatedPlan));
      setPlan(updatedPlan);
      setIsEditMode(false);
      toast.success("Resource plan updated successfully");
    } catch (error) {
      console.error("Error saving resource plan:", error);
      toast.error("Failed to save resource plan");
    }
  };
  
  // Handle file attachment
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Create attachment objects
    const newAttachments = files.map(file => ({
      id: uuidv4(),
      name: file.name,
      size: file.size,
      type: file.type,
      // In a real app, we'd upload the file to a server or store it
      // Here we just create an object URL to simulate
      url: URL.createObjectURL(file)
    }));
    
    try {
      const updatedAttachments = [...attachments, ...newAttachments];
      const updatedPlan = { ...plan, Attachments: updatedAttachments };
      
      // Save to localStorage
      localStorage.setItem(`project_${projectId}_resource_plan`, JSON.stringify(updatedPlan));
      
      // Update state
      setAttachments(updatedAttachments);
      setPlan(updatedPlan);
      setShowAddAttachmentDialog(false);
      
      toast.success(`Added ${files.length} attachment${files.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error("Error adding attachment:", error);
      toast.error("Failed to add attachment");
    }
  };
  
  // Remove an attachment
  const handleRemoveAttachment = (attachmentId) => {
    try {
      const updatedAttachments = attachments.filter(a => a.id !== attachmentId);
      const updatedPlan = { ...plan, Attachments: updatedAttachments };
      
      // Save to localStorage
      localStorage.setItem(`project_${projectId}_resource_plan`, JSON.stringify(updatedPlan));
      
      // Update state
      setAttachments(updatedAttachments);
      setPlan(updatedPlan);
      
      toast.success("Attachment removed");
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast.error("Failed to remove attachment");
    }
  };
  
  // Calculate resource statistics
  const resourceStats = {
    total: resources.length,
    byType: resources.reduce((acc, resource) => {
      acc[resource.Type] = (acc[resource.Type] || 0) + 1;
      return acc;
    }, {}),
    availableResources: resources.filter(r => r.Available && r.Available > 0).length,
    lowStock: resources.filter(r => 
      r.Available !== null && r.Total !== null && 
      r.Available > 0 && r.Available < (r.Total * 0.2)
    ).length,
    outOfStock: resources.filter(r => r.Available === 0).length,
  };
  
  // Group resources by type for display in table
  const resourcesByType = resources.reduce((acc, resource) => {
    if (!acc[resource.Type]) {
      acc[resource.Type] = [];
    }
    acc[resource.Type].push(resource);
    return acc;
  }, {});

  // Resource type icons
  const resourceTypeIcons = {
    'Human': <UserPlus className="h-5 w-5 text-blue-500" />,
    'Equipment': <Settings className="h-5 w-5 text-amber-500" />,
    'Material': <Package className="h-5 w-5 text-green-500" />,
    'Tool': <Briefcase className="h-5 w-5 text-purple-500" />,
    'Vehicle': <HardHat className="h-5 w-5 text-red-500" />,
    'Space': <Table className="h-5 w-5 text-indigo-500" />,
    'Other': <Package className="h-5 w-5 text-gray-500" />,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.push(`/projects/${projectId}/resource`)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <h2 className="text-sm font-medium text-muted-foreground">Resources</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Resource Plan</h1>
            
            <div className="flex items-center gap-3">
              <Link href={`/projects/${projectId}/resource/create`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Resource
                </Button>
              </Link>
              
              <Button size="sm" onClick={() => setShowAddAttachmentDialog(true)}>
                <FileUp className="h-4 w-4 mr-2" /> Add Attachment
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content - left and center columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resource Plan Notes */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-card rounded-xl p-6 shadow-sm border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Resource Plan Notes</h2>
                  
                  {isEditMode ? (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setPlanNotes(plan.Notes || '');
                          setIsEditMode(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSavePlanNotes}
                      >
                        <Save className="h-4 w-4 mr-2" /> Save
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditMode(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit Notes
                    </Button>
                  )}
                </div>
                
                {isEditMode ? (
                  <Textarea
                    value={planNotes}
                    onChange={(e) => setPlanNotes(e.target.value)}
                    placeholder="Enter resource planning notes, allocation strategy, or requirements..."
                    className="min-h-[200px]"
                  />
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    {plan.Notes ? (
                      <div className="whitespace-pre-wrap">{plan.Notes}</div>
                    ) : (
                      <div className="text-muted-foreground italic">
                        No resource plan notes have been added yet. Click "Edit Notes" to add information about your resource planning, allocation strategy, or requirements.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              
              {/* Resources Overview */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-card rounded-xl p-6 shadow-sm border border-border"
              >
                <h2 className="text-lg font-semibold mb-4">Resources Overview</h2>
                
                {resources.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
                    <Database className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground mb-3">No resources have been added yet</p>
                    <Link href={`/projects/${projectId}/resource/create`}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" /> Add Your First Resource
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Tabs defaultValue="summary">
                    <TabsList className="mb-6">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                      <TabsTrigger value="chart">Chart</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-primary/10 rounded-lg p-4">
                          <div className="text-sm text-muted-foreground mb-1">Total Resources</div>
                          <div className="text-2xl font-semibold">{resourceStats.total}</div>
                        </div>
                        
                        <div className="bg-green-500/10 rounded-lg p-4">
                          <div className="text-sm text-muted-foreground mb-1">Available Resources</div>
                          <div className="text-2xl font-semibold">{resourceStats.availableResources}</div>
                        </div>
                        
                        <div className="bg-red-500/10 rounded-lg p-4">
                          <div className="text-sm text-muted-foreground mb-1">Low/Out of Stock</div>
                          <div className="text-2xl font-semibold">{resourceStats.lowStock + resourceStats.outOfStock}</div>
                        </div>
                      </div>
                      
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Resources by Type
                      </h3>
                      
                      <div className="space-y-3">
                        {Object.entries(resourceStats.byType).map(([type, count]) => (
                          <div 
                            key={type}
                            className="flex items-center justify-between bg-muted/50 p-3 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {resourceTypeIcons[type] || <Package className="h-5 w-5 text-muted-foreground" />}
                              <span>{type}</span>
                            </div>
                            <div className="bg-background px-2 py-1 rounded text-sm">
                              {count} resource{count !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="table" className="mt-0">
                      <UITable>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Available</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resources.map(resource => (
                            <TableRow key={resource.Id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {resourceTypeIcons[resource.Type] || <Package className="h-4 w-4 text-muted-foreground" />}
                                  <span>{resource.Type}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                <Link 
                                  href={`/projects/${projectId}/resource/${resource.Id}`}
                                  className="hover:underline text-primary"
                                >
                                  {resource.Name}
                                </Link>
                              </TableCell>
                              <TableCell className="text-right">{resource.Available ?? '-'}</TableCell>
                              <TableCell className="text-right">{resource.Total ?? '-'}</TableCell>
                              <TableCell>{resource.Unit || '-'}</TableCell>
                              <TableCell className="text-right">
                                <div className={cn(
                                  "inline-block px-2 py-1 rounded-md text-xs font-medium",
                                  resource.Available === 0 
                                    ? "bg-red-500/10 text-red-500" 
                                    : resource.Available < resource.Total * 0.2
                                      ? "bg-amber-500/10 text-amber-500"
                                      : "bg-green-500/10 text-green-500"
                                )}>
                                  {resource.Available === 0 ? "Out of stock" : 
                                  resource.Available < resource.Total * 0.2 ? "Low stock" : 
                                  "Available"}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </UITable>
                    </TabsContent>
                    
                    <TabsContent value="chart" className="mt-0">
                      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
                        <BarChart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Resource visualization charts coming soon
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </motion.div>
              
              {/* Resource Requirements */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-card rounded-xl p-6 shadow-sm border border-border"
              >
                <h2 className="text-lg font-semibold mb-4">Resource Requirements</h2>
                
                <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
                  <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground mb-1">
                    No resource requirements defined yet
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Define the resources needed for each phase of your project
                  </p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Add Requirements
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Plan Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-card rounded-xl p-6 shadow-sm border border-border"
              >
                <h2 className="text-lg font-semibold mb-4">Plan Info</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan ID</span>
                    <span className="text-sm font-mono">{plan.Id.substring(0, 8)}</span>
                  </div>
                  <div className="border-t border-border"></div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{format(new Date(plan.CreatedAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="border-t border-border"></div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{format(new Date(), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="border-t border-border"></div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Resources</span>
                    <span>{resourceStats.total}</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Attachments */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-card rounded-xl p-6 shadow-sm border border-border"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Attachments</h2>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddAttachmentDialog(true)}
                  >
                    <FileUp className="h-4 w-4 mr-2" /> Add Files
                  </Button>
                </div>
                
                {attachments.length > 0 ? (
                  <div className="space-y-3">
                    {attachments.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-muted/50 p-3 rounded-md"
                      >
                        <div className="flex items-center overflow-hidden">
                          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                            {file.type.includes('image') ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <FileText className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB • Added {format(new Date(), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleRemoveAttachment(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
                    <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground mb-3">No attachments added yet</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAddAttachmentDialog(true)}
                    >
                      <FileUp className="h-4 w-4 mr-2" /> Add Files
                    </Button>
                  </div>
                )}
              </motion.div>
              
              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-card rounded-xl p-6 shadow-sm border border-border"
              >
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit Plan Notes
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowAddAttachmentDialog(true)}
                  >
                    <FileUp className="h-4 w-4 mr-2" /> Upload Attachment
                  </Button>
                  
                  <Link href={`/projects/${projectId}/resource/create`}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add New Resource
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      toast.info("Export feature coming soon");
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export Plan
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Attachment Dialog */}
      <Dialog open={showAddAttachmentDialog} onOpenChange={setShowAddAttachmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
            <DialogDescription>
              Upload documents, spreadsheets, or images related to your resource plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="border border-dashed border-border rounded-lg p-8 text-center">
            <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="mb-4 text-muted-foreground">
              Drag & drop files or <label htmlFor="attachment-upload" className="text-primary cursor-pointer hover:underline">browse</label>
            </p>
            <Input
              id="attachment-upload"
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('attachment-upload').click()}
            >
              <Plus className="h-4 w-4 mr-2" /> Select Files
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAttachmentDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-48 bg-muted rounded"></div>
            <div className="h-9 w-24 bg-muted rounded"></div>
          </div>
          <div className="h-24 w-full bg-muted rounded"></div>
        </div>
        
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
          <div className="h-6 w-48 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-24 w-full bg-muted rounded"></div>
            <div className="h-24 w-full bg-muted rounded"></div>
            <div className="h-24 w-full bg-muted rounded"></div>
          </div>
          <div className="h-6 w-32 bg-muted rounded mb-3"></div>
          <div className="space-y-3">
            <div className="h-12 w-full bg-muted rounded"></div>
            <div className="h-12 w-full bg-muted rounded"></div>
            <div className="h-12 w-full bg-muted rounded"></div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
          <div className="h-6 w-48 bg-muted rounded mb-4"></div>
          <div className="h-40 w-full bg-muted rounded"></div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
          <div className="h-6 w-32 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-16 bg-muted rounded"></div>
            </div>
            <div className="h-px w-full bg-muted"></div>
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-muted rounded"></div>
              <div className="h-4 w-24 bg-muted rounded"></div>
            </div>
            <div className="h-px w-full bg-muted"></div>
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-24 bg-muted rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-32 bg-muted rounded"></div>
            <div className="h-9 w-24 bg-muted rounded"></div>
          </div>
          <div className="h-40 w-full bg-muted rounded"></div>
        </div>
        
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-pulse">
          <div className="h-6 w-40 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 w-full bg-muted rounded"></div>
            <div className="h-10 w-full bg-muted rounded"></div>
            <div className="h-10 w-full bg-muted rounded"></div>
            <div className="h-10 w-full bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}