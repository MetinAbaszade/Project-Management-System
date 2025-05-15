'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

// Icons
import {
  ArrowLeft,
  UserPlus,
  Wrench,
  Box,
  Briefcase,
  TruckIcon,
  Table2,
  Package,
  Save,
  FileUp,
  Plus,
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// Resource type definitions
const resourceTypes = [
  { id: 'Human', label: 'Human Resource', icon: <UserPlus className="h-5 w-5 text-blue-500" /> },
  { id: 'Equipment', label: 'Equipment', icon: <Wrench className="h-5 w-5 text-amber-500" /> },
  { id: 'Material', label: 'Material', icon: <Box className="h-5 w-5 text-green-500" /> },
  { id: 'Tool', label: 'Tool', icon: <Briefcase className="h-5 w-5 text-purple-500" /> },
  { id: 'Vehicle', label: 'Vehicle', icon: <TruckIcon className="h-5 w-5 text-red-500" /> },
  { id: 'Space', label: 'Space', icon: <Table2 className="h-5 w-5 text-indigo-500" /> },
  { id: 'Other', label: 'Other', icon: <Package className="h-5 w-5 text-gray-500" /> },
];

export default function CreateResourcePage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    Name: '',
    Type: '',
    Total: '',
    Available: '',
    Description: '',
    Unit: '',
  });
  
  const [selectedType, setSelectedType] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle resource type selection
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setFormData(prev => ({ ...prev, Type: typeId }));
    
    // Clear type error if it exists
    if (errors.Type) {
      setErrors(prev => ({ ...prev, Type: null }));
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
    
    setAttachments(prev => [...prev, ...newAttachments]);
    toast.success(`Added ${files.length} attachment${files.length > 1 ? 's' : ''}`);
  };
  
  // Remove an attachment
  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name.trim()) {
      newErrors.Name = 'Resource name is required';
    }
    
    if (!formData.Type) {
      newErrors.Type = 'Please select a resource type';
    }
    
    if (formData.Total && isNaN(Number(formData.Total))) {
      newErrors.Total = 'Total must be a number';
    }
    
    if (formData.Available && isNaN(Number(formData.Available))) {
      newErrors.Available = 'Available must be a number';
    }
    
    if (formData.Total && formData.Available && 
        Number(formData.Available) > Number(formData.Total)) {
      newErrors.Available = 'Available cannot exceed total';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Create new resource object
    const newResource = {
      Id: uuidv4(),
      ProjectId: projectId,
      Name: formData.Name.trim(),
      Type: formData.Type,
      Total: formData.Total ? Number(formData.Total) : null,
      Available: formData.Available ? Number(formData.Available) : null,
      Description: formData.Description.trim(),
      Unit: formData.Unit.trim(),
      IsDeleted: false,
      CreatedAt: new Date().toISOString(),
      Attachments: attachments
    };
    
    try {
      // Get existing resources from localStorage or initialize empty array
      const storedResources = localStorage.getItem(`project_${projectId}_resources`);
      const resources = storedResources ? JSON.parse(storedResources) : [];
      
      // Add new resource
      resources.push(newResource);
      
      // Save back to localStorage
      localStorage.setItem(`project_${projectId}_resources`, JSON.stringify(resources));
      
      toast.success('Resource added successfully!');
      
      // Redirect to resource overview
      router.push(`/projects/${projectId}/resource`);
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
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
          <h1 className="text-2xl font-semibold">Add New Resource</h1>
        </div>

        {/* Create resource form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Resource Details</CardTitle>
                <CardDescription>
                  Add information about the resource you want to add to your project.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Resource Type Selection */}
                <div className="space-y-3">
                  <Label htmlFor="resource-type">Resource Type <span className="text-red-500">*</span></Label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {resourceTypes.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        className={cn(
                          "flex flex-col items-center p-4 rounded-lg border border-border transition-all",
                          selectedType === type.id
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted"
                        )}
                        onClick={() => handleTypeSelect(type.id)}
                      >
                        {type.icon}
                        <span className="mt-2 text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  {errors.Type && <p className="text-sm text-red-500">{errors.Type}</p>}
                </div>
                
                {/* Resource Name */}
                <div className="space-y-3">
                  <Label htmlFor="resource-name">Resource Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="resource-name"
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    placeholder="Enter resource name"
                  />
                  {errors.Name && <p className="text-sm text-red-500">{errors.Name}</p>}
                </div>
                
                {/* Resource Description */}
                <div className="space-y-3">
                  <Label htmlFor="resource-description">Description</Label>
                  <Textarea
                    id="resource-description"
                    name="Description"
                    value={formData.Description}
                    onChange={handleChange}
                    placeholder="Enter a description of this resource"
                    rows={4}
                  />
                </div>
                
                {/* Quantity Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="resource-total">Total Quantity</Label>
                    <Input
                      id="resource-total"
                      name="Total"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.Total}
                      onChange={handleChange}
                      placeholder="Total available"
                    />
                    {errors.Total && <p className="text-sm text-red-500">{errors.Total}</p>}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="resource-available">Available Now</Label>
                    <Input
                      id="resource-available"
                      name="Available"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.Available}
                      onChange={handleChange}
                      placeholder="Currently available"
                    />
                    {errors.Available && <p className="text-sm text-red-500">{errors.Available}</p>}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="resource-unit">Unit of Measure</Label>
                    <Input
                      id="resource-unit"
                      name="Unit"
                      value={formData.Unit}
                      onChange={handleChange}
                      placeholder="e.g., Hours, Pieces, Kg"
                    />
                  </div>
                </div>
                
                {/* Attachments */}
                <div className="space-y-3">
                  <Label>Attachments</Label>
                  
                  <div className="border border-dashed border-border rounded-lg p-8 text-center">
                    <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="mb-4 text-muted-foreground">
                      Drag & drop files or <label htmlFor="file-upload" className="text-primary cursor-pointer hover:underline">browse</label>
                    </p>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Select Files
                    </Button>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <Label>Uploaded Files</Label>
                      {attachments.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-muted p-3 rounded-md"
                        >
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center mr-3">
                              {file.type.includes('image') ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <FileUp className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-medium text-sm truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(file.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/projects/${projectId}/resource`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Save Resource
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}