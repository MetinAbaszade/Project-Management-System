// Frontend/src/app/(dashboard)/projects/[id]/team/[teamid]/components/EditTeamDialog.tsx

import { useState } from 'react';
import { X, Save, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EditTeamDialogProps {
  team: {
    Name: string;
    Description: string;
    ColorIndex: number;
  };
  onClose: () => void;
  onSave: (data: { Name: string; Description: string; ColorIndex: number }) => void;
}

export default function EditTeamDialog({ team, onClose, onSave }: EditTeamDialogProps) {
  const [formData, setFormData] = useState({
    Name: team.Name || '',
    Description: team.Description || '',
    ColorIndex: team.ColorIndex || 0
  });
  
  const [errors, setErrors] = useState<{Name?: string}>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when editing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Handle color selection
  const handleColorSelect = (index: number) => {
    setFormData(prev => ({ ...prev, ColorIndex: index }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {Name?: string} = {};
    if (!formData.Name.trim()) {
      newErrors.Name = 'Team name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    setSubmitting(true);
    onSave(formData);
  };
  
  // Team colors that use theme variables
  const teamColors = [
    { name: 'Ruby', bg: 'bg-rose-500' },
    { name: 'Orange', bg: 'bg-orange-500' },
    { name: 'Amber', bg: 'bg-amber-500' },
    { name: 'Green', bg: 'bg-green-500' },
    { name: 'Sky', bg: 'bg-sky-500' },
    { name: 'Blue', bg: 'bg-blue-500' },
    { name: 'Violet', bg: 'bg-violet-500' },
    { name: 'Fuchsia', bg: 'bg-fuchsia-500' }
  ];
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Edit Team</h3>
          <motion.button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted/70 transition-colors text-muted-foreground hover:text-foreground"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground" htmlFor="name">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                id="name"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                className={cn(
                  "w-full p-3 rounded-xl border bg-background/50 text-foreground transition-colors focus:ring-1 focus:ring-primary focus:outline-none",
                  errors.Name ? "border-red-500" : "border-border/50"
                )}
                disabled={submitting}
              />
              {errors.Name && (
                <p className="text-red-500 text-xs mt-1">{errors.Name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-foreground min-h-[100px] focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                disabled={submitting}
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3 text-foreground">
                Team Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {teamColors.map((color, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => handleColorSelect(index)}
                    className={cn(
                      "w-full aspect-square rounded-full", 
                      color.bg,
                      "flex items-center justify-center",
                      formData.ColorIndex === index ? "ring-2 ring-offset-2 ring-primary" : ""
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={submitting}
                  >
                    {formData.ColorIndex === index && (
                      <Check className="w-5 h-5 text-white drop-shadow-md" />
                    )}
                  </motion.button>
                ))}
              </div>
              <p className="text-center text-sm mt-2 text-muted-foreground">
                {teamColors[formData.ColorIndex]?.name || 'Select a color'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <motion.button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-muted/50 hover:bg-muted text-foreground rounded-full text-sm transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={submitting}
            >
              Cancel
            </motion.button>
            <motion.button 
              type="submit"
              className="px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-sm transition-colors flex items-center"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}