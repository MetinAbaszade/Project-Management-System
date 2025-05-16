// Frontend/src/app/(dashboard)/projects/[id]/team/[teamid]/components/EditTeamDialog.tsx

import { useState } from 'react';
import { X, Save, Check } from 'lucide-react';

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
    onSave(formData);
  };
  
  // Team colors
  const teamColors = [
    { name: 'Red', bg: 'bg-rose-500' },
    { name: 'Orange', bg: 'bg-orange-500' },
    { name: 'Amber', bg: 'bg-amber-500' },
    { name: 'Green', bg: 'bg-green-500' },
    { name: 'Sky', bg: 'bg-sky-500' },
    { name: 'Blue', bg: 'bg-blue-500' },
    { name: 'Violet', bg: 'bg-violet-500' },
    { name: 'Fuchsia', bg: 'bg-fuchsia-500' }
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Team</h3>
          <button 
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                id="name"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                className={`w-full p-2 rounded-md border ${errors.Name ? 'border-red-500' : 'border-input'} bg-background`}
              />
              {errors.Name && (
                <p className="text-red-500 text-xs mt-1">{errors.Name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-input bg-background min-h-[100px]"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Team Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {teamColors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorSelect(index)}
                    className={`w-full aspect-square rounded-full ${color.bg} flex items-center justify-center ${formData.ColorIndex === index ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  >
                    {formData.ColorIndex === index && (
                      <Check className="w-5 h-5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}