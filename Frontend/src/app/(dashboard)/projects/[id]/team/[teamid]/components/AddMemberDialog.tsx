// Frontend/src/app/(dashboard)/projects/[id]/team/[teamid]/components/AddMemberDialog.tsx

import { useState } from 'react';
import { X, UserPlus, Search, Check, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Get available members (project members not in team)
  const availableMembers = projectMembers.filter(pm => 
    !members.some(m => m.UserId === pm.UserId)
  );
  
  // Filter by search query
  const filteredMembers = availableMembers.filter(member => {
    const fullName = `${member.User?.FirstName || member.FirstName} ${member.User?.LastName || member.LastName}`.toLowerCase();
    const email = (member.User?.Email || member.Email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) return;
    
    setSubmitting(true);
    onAddMember(selectedUserId, role, isLeader);
  };
  
  // Common role options
  const roleOptions = [
    'Member',
    'Developer',
    'Designer',
    'Tester',
    'Analyst',
    'Product Manager',
    'Stakeholder',
    'Consultant'
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
          <h3 className="text-lg font-semibold text-foreground">Add Team Member</h3>
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
        
        {availableMembers.length === 0 ? (
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus size={28} className="text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">All project members are already in this team.</p>
            <motion.button
              onClick={onClose}
              className="px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-sm transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Close
            </motion.button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..."
                  className="w-full p-3 pl-10 pr-10 rounded-xl border border-border/50 bg-background/50 text-foreground transition-colors focus:ring-1 focus:ring-primary focus:outline-none"
                  disabled={submitting}
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground p-1 hover:bg-muted/50 rounded-full"
                    disabled={submitting}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              {/* Member selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground" htmlFor="userId">
                  Select User <span className="text-red-500">*</span>
                </label>
                <div className="max-h-[200px] overflow-y-auto border border-border/50 rounded-xl bg-background/50 overflow-hidden">
                  {filteredMembers.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No matching members found
                    </div>
                  ) : (
                    filteredMembers.map((member) => (
                      <motion.div
                        key={member.UserId}
                        onClick={() => !submitting && setSelectedUserId(member.UserId)}
                        className={cn(
                          "flex items-center p-3 cursor-pointer border-l-[3px]",
                          selectedUserId === member.UserId 
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted/30 border-transparent",
                          submitting ? "opacity-50 pointer-events-none" : ""
                        )}
                        whileHover={{ x: 2 }}
                      >
                        <div className="h-8 w-8 rounded-full bg-muted/70 flex items-center justify-center text-foreground font-medium mr-3">
                          {(member.User?.FirstName?.[0] || member.FirstName?.[0] || 'U').toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {member.User?.FirstName || member.FirstName} {member.User?.LastName || member.LastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.User?.Email || member.Email}
                          </div>
                        </div>
                        {selectedUserId === member.UserId && (
                          <div className="bg-primary/10 p-1 rounded-full">
                            <Check className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Role selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground" htmlFor="role">
                  Role
                </label>
                <div className="relative">
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-foreground appearance-none pr-10 focus:ring-1 focus:ring-primary focus:outline-none"
                    disabled={submitting}
                  >
                    {roleOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                    <option value="custom">Custom...</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-foreground">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {role === 'custom' && (
                  <input 
                    type="text" 
                    placeholder="Enter custom role"
                    className="w-full p-3 rounded-xl border border-border/50 bg-background/50 text-foreground mt-2 focus:ring-1 focus:ring-primary focus:outline-none"
                    onChange={(e) => setRole(e.target.value)}
                    disabled={submitting}
                  />
                )}
              </div>
              
              {/* Team leader toggle */}
              <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <input 
                      type="checkbox" 
                      id="isLeader"
                      checked={isLeader}
                      onChange={(e) => setIsLeader(e.target.checked)}
                      className="h-4 w-4 rounded border-muted/70 text-primary focus:ring-primary"
                      disabled={submitting}
                    />
                  </div>
                  <label htmlFor="isLeader" className="flex items-center cursor-pointer text-foreground">
                    <Shield className="h-4 w-4 mr-1.5 text-primary" /> 
                    <span className="font-medium">Make team leader</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-7">
                  Team leaders can add members, create tasks, and manage team resources.
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
                disabled={!selectedUserId || submitting}
                className="px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-sm transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!(!selectedUserId || submitting) ? { scale: 1.03 } : {}}
                whileTap={!(!selectedUserId || submitting) ? { scale: 0.97 } : {}}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </>
                )}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}