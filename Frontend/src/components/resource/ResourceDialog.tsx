// src/components/resource/ResourceDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Loader2, 
  Save,
  ListChecks,
  BookOpen,
  Users,
  Package,
  Building
} from 'lucide-react';
import { createResource, updateResource } from '@/api/ResourceAPI';
import { toast } from '@/lib/toast';

interface ResourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  resource?: any;
  onSuccess?: (updatedData?: any) => void;
}

export function ResourceDialog({ isOpen, onClose, projectId, resource, onSuccess }: ResourceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState({
    Name: '',
    Type: 'Material',
    Description: '',
    Unit: '',
    Total: 0,
    Available: 0,
    ProjectId: projectId
  });

  // Load resource data when editing
  useEffect(() => {
    if (resource) {
      setForm({
        Name: resource.Name || '',
        Type: resource.Type || 'Material',
        Description: resource.Description || '',
        Unit: resource.Unit || '',
        Total: resource.Total || 0,
        Available: resource.Available || 0,
        ProjectId: projectId
      });
    } else {
      // Reset form for create
      setForm({
        Name: '',
        Type: 'Material',
        Description: '',
        Unit: '',
        Total: 0,
        Available: 0,
        ProjectId: projectId
      });
    }
  }, [resource, projectId, isOpen]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // Parse numeric values
    if (name === 'Total' || name === 'Available') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setForm({ ...form, [name]: parsedValue });
    
    // Clear error for this field
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.Name.trim()) {
      newErrors.Name = 'Name is required';
    }
    
    if (form.Total < 0) {
      newErrors.Total = 'Total amount cannot be negative';
    }
    
    if (form.Available < 0) {
      newErrors.Available = 'Available amount cannot be negative';
    }
    
    if (form.Available > form.Total) {
      newErrors.Available = 'Available amount cannot exceed total amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (resource) {
        // Update existing resource
        const updatedResource = await updateResource(resource.Id, form);
        toast.success('Resource updated successfully');
        
        if (onSuccess) {
          onSuccess(updatedResource);
        }
      } else {
        // Create new resource
        const newResource = await createResource(form);
        toast.success('Resource created successfully');
        
        if (onSuccess) {
          onSuccess(newResource);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save resource:', error);
      toast.error(resource ? 'Could not update resource' : 'Could not create resource');
    } finally {
      setLoading(false);
    }
  };

  // Get icon based on resource type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Material':
        return <Package className="h-4 w-4" />;
      case 'Equipment':
        return <Building className="h-4 w-4" />;
      case 'Human':
        return <Users className="h-4 w-4" />;
      case 'Knowledge':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <ListChecks className="h-4 w-4" />;
    }
  };

  // If dialog is not open, render nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-card rounded-xl shadow-lg overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-muted/50">
          <h2 className="text-xl font-semibold">
            {resource ? 'Edit Resource' : 'Create New Resource'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="Name" className="block text-sm font-medium">
                Resource Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="Name"
                name="Name"
                value={form.Name}
                onChange={handleChange}
                placeholder="Enter resource name"
                className={`w-full px-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all ${errors.Name ? 'border-red-500' : 'border-input'}`}
              />
              {errors.Name && (
                <p className="text-red-500 text-sm">{errors.Name}</p>
              )}
            </div>
            
            {/* Type */}
            <div className="space-y-2">
              <label htmlFor="Type" className="block text-sm font-medium">
                Resource Type
              </label>
              <select
                id="Type"
                name="Type"
                value={form.Type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
              >
                <option value="Material">Material</option>
                <option value="Equipment">Equipment</option>
                <option value="Human">Human Resource</option>
                <option value="Knowledge">Knowledge Resource</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="Description" className="block text-sm font-medium">
                Description
              </label>
              <textarea
                id="Description"
                name="Description"
                value={form.Description}
                onChange={handleChange}
                placeholder="Enter resource description"
                rows={3}
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
              ></textarea>
            </div>
            
            {/* Unit */}
            <div className="space-y-2">
              <label htmlFor="Unit" className="block text-sm font-medium">
                Unit of Measurement
              </label>
              <input
                type="text"
                id="Unit"
                name="Unit"
                value={form.Unit}
                onChange={handleChange}
                placeholder="e.g., hours, kg, pieces"
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
              />
            </div>
            
            {/* Quantities */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="Total" className="block text-sm font-medium">
                  Total Amount
                </label>
                <input
                  type="number"
                  id="Total"
                  name="Total"
                  value={form.Total}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all ${errors.Total ? 'border-red-500' : 'border-input'}`}
                />
                {errors.Total && (
                  <p className="text-red-500 text-sm">{errors.Total}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="Available" className="block text-sm font-medium">
                  Available Amount
                </label>
                <input
                  type="number"
                  id="Available"
                  name="Available"
                  value={form.Available}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all ${errors.Available ? 'border-red-500' : 'border-input'}`}
                />
                {errors.Available && (
                  <p className="text-red-500 text-sm">{errors.Available}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex justify-end gap-3 bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-input bg-background hover:bg-muted transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{resource ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{resource ? 'Update Resource' : 'Create Resource'}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}