'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Briefcase,
  Key, 
  Mail, 
  LogOut, 
  Trash2, 
  AlertTriangle,
  Save,
  Check
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { useTheme } from '@/hooks/useTheme';
import { getCurrentUser, logout, deleteAccount } from '@/api/UserAPI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { CardSection } from '@/components/ui/CardSection';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { FormInput } from '@/components/ui/FormInput';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/axios';
import { jwtDecode } from 'jwt-decode';

export default function SettingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form for editable fields
  const [profileForm, setProfileForm] = useState({
    FirstName: '',
    LastName: '',
    Profession: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      // Decode JWT token to get user data
    const decoded = jwtDecode(token);
console.log('Decoded JWT token:', decoded);

const userData = {
  Id: decoded.sub || decoded.id || decoded.userId || '',
  FirstName: decoded.firstName || decoded.first_name || '',
  LastName: decoded.lastName || decoded.last_name || '',
  Email: decoded.email || '',
  Profession: decoded.profession || decoded.role || '',
};

      // Initialize form with user data
      setProfileForm({
        FirstName: userData.FirstName,
        LastName: userData.LastName,
        Profession: userData.Profession,
      });
      
      setUser(userData);
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      toast.error('Failed to load user data');
      router.push('/login');
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSaveProfile = async () => {
    if (!profileForm.FirstName || !profileForm.LastName) {
      toast.error('Name fields cannot be empty');
      return;
    }
    
    setSaving(true);
    try {
      // Here you would call an API to update the user profile
      // For example:
      // await api.put('/users/profile', profileForm);
      
      // Update the local user object with form data
      setUser(prev => ({
        ...prev,
        ...profileForm
      }));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setChangingPassword(true);
    
    try {
      // Call the password reset API
      await api.post('/users/reset-password', {
        Email: user.Email,
        NewPassword: passwordForm.newPassword
      });
      
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'delete my account') {
      toast.error('Please type the confirmation text correctly');
      return;
    }
    
    setDeletingAccount(true);
    
    try {
      await deleteAccount();
      toast.success('Your account has been deleted');
      router.push('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        {/* User Profile Section */}
        <GlassPanel className="mb-8">
          <CardSection 
            title="Profile Information" 
            description="Your account details and information"
          >
            <div className="flex items-center mb-6 gap-4">
              <Avatar 
                name={`${profileForm.FirstName || ''} ${profileForm.LastName || ''}`} 
                size="lg" 
              />
              <div>
                <h3 className="text-lg font-medium">{`${profileForm.FirstName || ''} ${profileForm.LastName || ''}`}</h3>
                <p className="text-sm text-muted-foreground">{user?.Email || ''}</p>
                {profileForm.Profession && (
                  <Badge className="mt-2">
                    {profileForm.Profession}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FormInput
                label="First Name"
                icon={<User className="h-4 w-4" />}
                inputProps={{
                  value: profileForm.FirstName,
                  onChange: (e) => setProfileForm({...profileForm, FirstName: e.target.value}),
                  placeholder: "Enter your first name",
                  required: true
                }}
              />
              
              <FormInput
                label="Last Name"
                icon={<User className="h-4 w-4" />}
                inputProps={{
                  value: profileForm.LastName,
                  onChange: (e) => setProfileForm({...profileForm, LastName: e.target.value}),
                  placeholder: "Enter your last name",
                  required: true
                }}
              />
              
              <FormInput
                label="Email (Not Editable)"
                icon={<Mail className="h-4 w-4" />}
                inputProps={{
                  value: user?.Email || '',
                  disabled: true
                }}
              />
              
              <FormInput
                label="Profession"
                icon={<Briefcase className="h-4 w-4" />}
                inputProps={{
                  value: profileForm.Profession,
                  onChange: (e) => setProfileForm({...profileForm, Profession: e.target.value}),
                  placeholder: "Enter your profession"
                }}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardSection>
        </GlassPanel>
        
        {/* Theme Settings */}
        <GlassPanel className="mb-8 relative z-30">
          <CardSection 
            title="Theme Settings" 
            description="Customize the appearance of your workspace"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Current Theme</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {theme}
                </p>
              </div>
              
              <div className="z-50">
                <ThemeSwitcher />
              </div>
            </div>
          </CardSection>
        </GlassPanel>
        
        {/* Password Section */}
        <GlassPanel className="mb-8 relative z-20">
          <CardSection 
            title="Password Settings" 
            description="Update your password to keep your account secure"
          >
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <FormInput
                label="Current Password"
                icon={<Key className="h-4 w-4" />}
                inputProps={{
                  type: "password",
                  value: passwordForm.currentPassword,
                  onChange: (e) => setPasswordForm({...passwordForm, currentPassword: e.target.value}),
                  required: true,
                  placeholder: "Enter your current password"
                }}
              />
              
              <FormInput
                label="New Password"
                icon={<Key className="h-4 w-4" />}
                inputProps={{
                  type: "password",
                  value: passwordForm.newPassword,
                  onChange: (e) => setPasswordForm({...passwordForm, newPassword: e.target.value}),
                  required: true,
                  placeholder: "Enter new password (min. 8 characters)"
                }}
              />
              
              <FormInput
                label="Confirm New Password"
                icon={<Key className="h-4 w-4" />}
                inputProps={{
                  type: "password",
                  value: passwordForm.confirmPassword,
                  onChange: (e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value}),
                  required: true,
                  placeholder: "Confirm your new password"
                }}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={changingPassword}
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </CardSection>
        </GlassPanel>
        
        {/* Account Management Section */}
        <GlassPanel className="relative z-10">
          <CardSection 
            title="Account Management" 
            description="Manage your account settings and preferences"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-white/10">
                <div>
                  <h3 className="font-medium">Logout from TaskUp</h3>
                  <p className="text-sm text-muted-foreground">
                    End your current session
                  </p>
                </div>
                <Button onClick={handleLogout} variant="ghost" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                <div>
                  <h3 className="font-medium text-red-500">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone
                  </p>
                </div>
                <Button 
                  onClick={() => setDeleteDialogOpen(true)} 
                  variant="ghost" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardSection>
        </GlassPanel>
      </motion.div>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Account"
        description="This action cannot be undone. All your data, projects, and tasks will be permanently deleted."
      >
        <div className="bg-red-500/10 p-4 rounded-lg mb-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            Deleting your account will remove all your data from our systems. 
            You will lose access to all projects, tasks, and other information associated with your account.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            To confirm, type "delete my account"
          </label>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="delete my account"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deletingAccount}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={deletingAccount || deleteConfirmText !== 'delete my account'}
          >
            {deletingAccount ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}