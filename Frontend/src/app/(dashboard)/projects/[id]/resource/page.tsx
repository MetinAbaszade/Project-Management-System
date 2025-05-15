'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

// Icons
import {
  ArrowLeft,
  Database,
  Package,
  PlusCircle,
  Search,
  FilePlus,
  LayoutGrid,
  LayoutList,
  Settings,
  Plus,
  UserPlus,
  FileText,
  Clock,
  CheckSquare,
  Filter,
  XCircle,
  Briefcase,
  HardHat,
  Box,
  TruckIcon,
  Wrench,
  Table2,
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Resource type mapping to icons
const resourceTypeIcons = {
  'Human': <UserPlus className="h-10 w-10 text-blue-500" />,
  'Equipment': <Wrench className="h-10 w-10 text-amber-500" />,
  'Material': <Box className="h-10 w-10 text-green-500" />,
  'Tool': <Briefcase className="h-10 w-10 text-purple-500" />,
  'Vehicle': <TruckIcon className="h-10 w-10 text-red-500" />,
  'Space': <Table2 className="h-10 w-10 text-indigo-500" />,
  'Other': <Package className="h-10 w-10 text-gray-500" />,
};

export default function ResourcePage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');

  // Load resources from localStorage
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
      } catch (error) {
        console.error("Error loading resources:", error);
        toast.error("Failed to load resources");
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [projectId]);

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          resource.Description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') {
      return matchesSearch;
    }
    
    return resource.Type === activeFilter && matchesSearch;
  });

  // Render the appropriate icon based on resource type
  const renderResourceIcon = (type) => {
    return resourceTypeIcons[type] || resourceTypeIcons['Other'];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => router.push(`/projects/${projectId}`)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <h2 className="text-sm font-medium text-muted-foreground">Project Resources</h2>
            </div>
            <h1 className="text-2xl font-semibold">Resource Management</h1>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search resources..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute right-2.5 top-2.5"
                  onClick={() => setSearchTerm('')}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Filter</span>
                  {activeFilter !== 'all' && <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 ml-1">1</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  className={cn(activeFilter === 'all' && "bg-muted")}
                  onClick={() => setActiveFilter('all')}
                >
                  All Resources
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className={cn(activeFilter === 'Human' && "bg-muted")}
                  onClick={() => setActiveFilter('Human')}
                >
                  <UserPlus className="h-4 w-4 mr-2 text-blue-500" /> Human Resources
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(activeFilter === 'Equipment' && "bg-muted")}
                  onClick={() => setActiveFilter('Equipment')}
                >
                  <Wrench className="h-4 w-4 mr-2 text-amber-500" /> Equipment
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(activeFilter === 'Material' && "bg-muted")}
                  onClick={() => setActiveFilter('Material')}
                >
                  <Box className="h-4 w-4 mr-2 text-green-500" /> Materials
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(activeFilter === 'Tool' && "bg-muted")}
                  onClick={() => setActiveFilter('Tool')}
                >
                  <Briefcase className="h-4 w-4 mr-2 text-purple-500" /> Tools
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(activeFilter === 'Vehicle' && "bg-muted")}
                  onClick={() => setActiveFilter('Vehicle')}
                >
                  <TruckIcon className="h-4 w-4 mr-2 text-red-500" /> Vehicles
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(activeFilter === 'Space' && "bg-muted")}
                  onClick={() => setActiveFilter('Space')}
                >
                  <Table2 className="h-4 w-4 mr-2 text-indigo-500" /> Spaces
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="bg-muted rounded-md p-1 flex">
              <button
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === 'grid' ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === 'list' ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>

            <Link href={`/projects/${projectId}/resource/plan`}>
              <Button variant="outline" size="sm" className="gap-1">
                <Settings className="h-4 w-4" /> Resource Plan
              </Button>
            </Link>

            <Link href={`/projects/${projectId}/resource/create`}>
              <Button className="gap-1">
                <Plus className="h-4 w-4" /> Add Resource
              </Button>
            </Link>
          </div>
        </div>

        {/* Resources content */}
        <div className="my-4">
          <Tabs defaultValue="resources" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="resources">All Resources</TabsTrigger>
              <TabsTrigger value="assigned">Assigned to Tasks</TabsTrigger>
              <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resources" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                      <div className="h-10 w-10 bg-muted rounded-md mb-4"></div>
                      <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-6 bg-muted rounded w-1/4"></div>
                        <div className="h-6 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {filteredResources.length > 0 ? (
                    viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResources.map(resource => (
                          <motion.div
                            key={resource.Id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/projects/${projectId}/resource/${resource.Id}`)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                {renderResourceIcon(resource.Type)}
                                <h3 className="text-lg font-semibold mt-3">{resource.Name}</h3>
                                <div className="text-sm text-muted-foreground">{resource.Type}</div>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {resource.Description || "No description provided"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                              <div className="text-xs text-muted-foreground">
                                Created {format(new Date(resource.CreatedAt), 'MMM d, yyyy')}
                              </div>
                              
                              <div className="flex items-center">
                                {resource.Available !== undefined && resource.Total !== undefined && (
                                  <div className={cn(
                                    "text-xs px-2 py-1 rounded",
                                    resource.Available === 0 
                                      ? "bg-red-500/10 text-red-500" 
                                      : resource.Available < resource.Total * 0.2
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "bg-green-500/10 text-green-500"
                                  )}>
                                    {resource.Available}/{resource.Total} {resource.Unit || "Units"}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredResources.map(resource => (
                          <motion.div
                            key={resource.Id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center"
                            onClick={() => router.push(`/projects/${projectId}/resource/${resource.Id}`)}
                          >
                            <div className="mr-4">
                              {renderResourceIcon(resource.Type)}
                            </div>
                            
                            <div className="flex-grow">
                              <h3 className="text-lg font-semibold">{resource.Name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {resource.Description || "No description provided"}
                              </p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <div className={cn(
                                "text-xs px-2 py-1 rounded",
                                resource.Available === 0 
                                  ? "bg-red-500/10 text-red-500" 
                                  : resource.Available < resource.Total * 0.2
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-green-500/10 text-green-500"
                              )}>
                                {resource.Available}/{resource.Total} {resource.Unit || "Units"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Created {format(new Date(resource.CreatedAt), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )
                  ) : (
                    <EmptyResourcesState projectId={projectId} searchTerm={searchTerm} activeFilter={activeFilter} />
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="assigned" className="mt-0">
              <EmptyAssignedResourcesState projectId={projectId} />
            </TabsContent>
            
            <TabsContent value="unassigned" className="mt-0">
              <EmptyUnassignedResourcesState projectId={projectId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function EmptyResourcesState({ projectId, searchTerm, activeFilter }) {
  return (
    <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
      {searchTerm || activeFilter !== 'all' ? (
        <>
          <XCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No matching resources found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Try adjusting your search or filters to find what you're looking for
          </p>
        </>
      ) : (
        <>
          <Database className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No resources added yet</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Add resources to track equipment, materials, and human resources for your project
          </p>
        </>
      )}
      <Link href={`/projects/${projectId}/resource/create`}>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Your First Resource
        </Button>
      </Link>
    </div>
  );
}

function EmptyAssignedResourcesState({ projectId }) {
  return (
    <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
      <CheckSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
      <h3 className="text-lg font-semibold">No assigned resources</h3>
      <p className="text-muted-foreground mt-1 mb-4">
        Resources that are assigned to tasks will appear here
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/projects/${projectId}/resource/create`}>
          <Button variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Resource
          </Button>
        </Link>
        <Link href={`/projects/${projectId}/tasks`}>
          <Button>
            <Clock className="h-4 w-4 mr-2" /> Manage Tasks
          </Button>
        </Link>
      </div>
    </div>
  );
}

function EmptyUnassignedResourcesState({ projectId }) {
  return (
    <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
      <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
      <h3 className="text-lg font-semibold">No unassigned resources</h3>
      <p className="text-muted-foreground mt-1 mb-4">
        Resources that haven't been assigned to any task will appear here
      </p>
      <Link href={`/projects/${projectId}/resource/create`}>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Resource
        </Button>
      </Link>
    </div>
  );
}