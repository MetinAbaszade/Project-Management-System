import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext'; 
import { useTheme } from '../../context/ThemeContext'; 
import { Eye, EyeOff } from 'lucide-react';

const Settings = () => { 
  const { user, logout } = useAuth(); 
  const { darkMode, toggleDarkMode } = useTheme(); 
  const navigate = useNavigate(); 
  
  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Account delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const [accountEmail, setAccountEmail] = useState(user?.email || ''); 
  const [notificationSettings, setNotificationSettings] = useState({ 
    email: true, 
    browser: true, 
    taskAssigned: true, 
    taskCompleted: true, 
    comments: true, 
    projectUpdates: true 
  }); 

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  }; 

  const handleDeleteAccount = () => {
    // In a real app, you would call an API to delete the account
    logout();
    navigate('/login');
  };

  const updateNotificationSetting = (key) => { 
    setNotificationSettings(prev => ({ 
      ...prev, 
      [key]: !prev[key] 
    })); 
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return { minLength, hasUppercase, hasSpecialChar, valid: minLength && hasUppercase && hasSpecialChar };
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess('');
    
    // Validate current password
    if (!currentPassword) {
      setPasswordErrors(prev => ({ ...prev, current: 'Current password is required' }));
      return;
    }
    
    // Validate new password
    if (!newPassword) {
      setPasswordErrors(prev => ({ ...prev, new: 'New password is required' }));
      return;
    }
    
    const pwdValidation = validatePassword(newPassword);
    if (!pwdValidation.valid) {
      let passwordError = 'Password must contain:';
      if (!pwdValidation.minLength) passwordError += ' at least 8 characters,';
      if (!pwdValidation.hasUppercase) passwordError += ' an uppercase letter,';
      if (!pwdValidation.hasSpecialChar) passwordError += ' a special character,';
      
      setPasswordErrors(prev => ({ ...prev, new: passwordError.slice(0, -1) }));
      return;
    }
    
    // Confirm passwords match
    if (newPassword !== confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirm: 'Passwords do not match' }));
      return;
    }
    
    // Simulate password change
    setIsPasswordChanging(true);
    setTimeout(() => {
      setIsPasswordChanging(false);
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    }, 1000);
  };

  return ( 
    <div className="p-6"> 
      <div className="max-w-4xl mx-auto"> 
        <h1 className="text-2xl font-bold mb-6">Settings</h1> 

        {/* Settings Sections */} 
        <div className="space-y-8"> 
          {/* Account Settings */} 
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"> 
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2> 
            <div className="space-y-4"> 
              <div> 
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label> 
                <input 
                  type="email" 
                  value={accountEmail} 
                  onChange={(e) => setAccountEmail(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700" 
                /> 
              </div> 
              <div> 
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label> 
                {!showChangePassword ? (
                  <button 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    onClick={() => setShowChangePassword(true)}
                  > 
                    Change Password 
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4 mt-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border ${passwordErrors.current ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.current && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {passwordErrors.current}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border ${passwordErrors.new ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.new ? (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {passwordErrors.new}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Must be at least 8 characters with 1 uppercase letter and 1 special character
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border ${passwordErrors.confirm ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirm && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {passwordErrors.confirm}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordErrors({});
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPasswordChanging}
                        className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg ${isPasswordChanging ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isPasswordChanging ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                )}
                {passwordSuccess && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm">
                    {passwordSuccess}
                  </div>
                )}
              </div> 
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"> 
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"> 
                  Save Changes 
                </button> 
              </div> 
            </div> 
          </div> 

          {/* Appearance Settings */} 
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"> 
            <h2 className="text-xl font-semibold mb-4">Appearance</h2> 
            <div className="space-y-4"> 
              <div className="flex items-center justify-between"> 
                <div> 
                  <p className="font-medium">Dark Mode</p> 
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p> 
                </div> 
                <label className="relative inline-flex items-center cursor-pointer"> 
                  <input 
                    type="checkbox" 
                    checked={darkMode} 
                    onChange={toggleDarkMode} 
                    className="sr-only peer" 
                  /> 
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div> 
                </label> 
              </div> 
            </div> 
          </div> 

          {/* Notification Settings */} 
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"> 
            <h2 className="text-xl font-semibold mb-4">Notifications</h2> 
            <div className="space-y-4"> 
              <div className="space-y-2"> 
                <h3 className="font-medium">Notification Channels</h3> 
                <div className="flex items-center"> 
                  <input 
                    id="email-notifications" 
                    type="checkbox" 
                    checked={notificationSettings.email} 
                    onChange={() => updateNotificationSetting('email')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Email notifications 
                  </label> 
                </div> 
                <div className="flex items-center"> 
                  <input 
                    id="browser-notifications" 
                    type="checkbox" 
                    checked={notificationSettings.browser} 
                    onChange={() => updateNotificationSetting('browser')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="browser-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Browser notifications 
                  </label> 
                </div> 
              </div> 

              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700"> 
                <h3 className="font-medium">Notification Types</h3> 
                <div className="flex items-center"> 
                  <input 
                    id="task-assigned" 
                    type="checkbox" 
                    checked={notificationSettings.taskAssigned} 
                    onChange={() => updateNotificationSetting('taskAssigned')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="task-assigned" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Task assignments 
                  </label> 
                </div> 
                <div className="flex items-center"> 
                  <input 
                    id="task-completed" 
                    type="checkbox" 
                    checked={notificationSettings.taskCompleted} 
                    onChange={() => updateNotificationSetting('taskCompleted')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="task-completed" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Task completions 
                  </label> 
                </div> 
                <div className="flex items-center"> 
                  <input 
                    id="comments" 
                    type="checkbox" 
                    checked={notificationSettings.comments} 
                    onChange={() => updateNotificationSetting('comments')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="comments" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Comments 
                  </label> 
                </div> 
                <div className="flex items-center"> 
                  <input 
                    id="project-updates" 
                    type="checkbox" 
                    checked={notificationSettings.projectUpdates} 
                    onChange={() => updateNotificationSetting('projectUpdates')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="project-updates" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Project updates 
                  </label> 
                </div> 
              </div> 
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"> 
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"> 
                  Save Preferences 
                </button> 
              </div> 
            </div> 
          </div> 

          {/* Account Actions */} 
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"> 
            <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-500">Danger Zone</h2> 
            <div className="space-y-4"> 
              <div> 
                <button 
                  onClick={handleLogout} 
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-left font-medium flex justify-between items-center" 
                > 
                  <span>Log out</span> 
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /> 
                  </svg> 
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full mt-4 px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-left font-medium flex justify-between items-center"
                >
                  <span>Delete account</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div> 
            </div> 
          </div> 
        </div> 
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Delete Account</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div> 
  ); 
};

export default Settings;