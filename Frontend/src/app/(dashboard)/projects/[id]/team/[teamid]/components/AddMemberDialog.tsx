// Frontend/src/app/(dashboard)/projects/[id]/team/[teamid]/components/AddMemberDialog.tsx

import { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';

interface AddMemberDialogProps {
  projectMembers: any[];
  members: any[];
  onClose: () => void;
  onAddMember: (userId: string, role: string, isLeader: boolean) => void;
}

export default function AddMemberDialog({ 
  projectMembers, 
  members, 
  onClose, 
  onAddMember 
}: AddMemberDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('Member');
  const [isLeader, setIsLeader] = useState(false);
  
  // Get available members (project members not in team)
  const availableMembers = projectMembers.filter(pm => 
    !members.some(m => m.UserId === pm.UserId)
  );
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) return;
    
    onAddMember(selectedUserId, role, isLeader);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Team Member</h3>
          <button 
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {availableMembers.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-muted-foreground mb-4">All project members are already in this team.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="userId">
                  Select User <span className="text-red-500">*</span>
                </label>
                <select
                  id="userId"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Select a user...</option>
                  {availableMembers.map((member) => (
                    <option key={member.UserId} value={member.UserId}>
                      {member.User?.FirstName || member.FirstName} {member.User?.LastName || member.LastName}
                      {member.User?.Email && ` (${member.User.Email})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="role">
                  Role
                </label>
                <input 
                  type="text" 
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Developer, Designer, etc."
                  className="w-full p-2 rounded-md border border-input bg-background"
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="isLeader"
                  checked={isLeader}
                  onChange={(e) => setIsLeader(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isLeader" className="text-sm">Make team leader</label>
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
                disabled={!selectedUserId}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}