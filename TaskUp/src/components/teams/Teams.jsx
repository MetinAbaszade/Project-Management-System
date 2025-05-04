import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, UserPlus, MoreHorizontal, X, ChevronRight, Settings, Calendar, CheckSquare, Clock } from 'lucide-react';
import AddTaskModal from '../tasks/AddTaskModal';

// Team colors for different team cards
const teamColors = [
  { primary: 'from-blue-500 to-blue-600', secondary: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' },
  { primary: 'from-purple-500 to-purple-600', secondary: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' },
  { primary: 'from-green-500 to-green-600', secondary: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' },
  { primary: 'from-yellow-500 to-yellow-600', secondary: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' },
  { primary: 'from-red-500 to-red-600', secondary: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300' },
  { primary: 'from-indigo-500 to-indigo-600', secondary: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300' },
];

const TeamMemberItem = ({ member, isLeader, onRemove }) => {
  return (
    <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-semibold">
        {member.avatar || member.name.charAt(0)}
      </div>
      <div className="ml-3 flex-1">
        <div className="text-sm font-medium flex items-center">
          {member.name}
          {isLeader && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              Team Lead
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{member.role}</div>
      </div>
      <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
        {member.joinedDate}
      </div>
      {onRemove && (
        <button 
          onClick={() => onRemove(member.id)} 
          className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

const TeamCard = ({ team, index, onSelect }) => {
  // Get a consistent color based on team id or index
  const colorIndex = parseInt(team.id) % teamColors.length || index % teamColors.length;
  const color = teamColors[colorIndex];

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 animate-fade-in h-full"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`h-3 bg-gradient-to-r ${color.primary}`}></div>
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 rounded-xl ${color.secondary} flex items-center justify-center font-bold text-xl`}>
            {team.name.charAt(0)}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold">{team.name}</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">{team.projectName}</div>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 h-10">
          {team.description}
        </p>
        
        <div className="mt-5 flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.members.slice(0, 3).map((member, index) => (
              <div 
                key={index} 
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium overflow-hidden"
              >
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name.charAt(0)
                )}
              </div>
            ))}
            {team.members.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium">
                +{team.members.length - 3}
              </div>
            )}
          </div>
          <button 
            onClick={() => onSelect(team)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium transition-colors flex items-center"
          >
            Details
            <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AddMemberModal = ({ isOpen, onClose, onSave, team }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  // Mock users data
  const availableUsers = [
    { id: '20', name: 'Thomas Wright', role: 'UX Designer' },
    { id: '21', name: 'Rachel Green', role: 'Frontend Developer' },
    { id: '22', name: 'Carlos Rodriguez', role: 'Product Manager' },
    { id: '23', name: 'Sophia Chen', role: 'Data Analyst' },
    { id: '24', name: 'James Wilson', role: 'Backend Developer' },
  ];
  
  // Filter out users who are already team members
  const filteredUsers = availableUsers.filter(user => 
    !team.members.some(member => member.id === user.id) &&
    (searchQuery === '' || 
     user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };
  
  const handleSave = () => {
    if (selectedMembers.length === 0) return;
    
    const newMembers = selectedMembers.map(memberId => {
      const user = availableUsers.find(u => u.id === memberId);
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
    
    onSave(newMembers);
    setSelectedMembers([]);
    setSearchQuery('');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Add Team Members</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Selected: {selectedMembers.length}</p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
            {filteredUsers.map(user => (
              <div 
                key={user.id} 
                className={`flex items-center p-2 rounded cursor-pointer ${
                  selectedMembers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
                onClick={() => toggleMember(user.id)}
              >
                <input 
                  type="checkbox" 
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => {}}
                  className="mr-3 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.role}</div>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No matching users found' : 'No available users'}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedMembers.length === 0}
          >
            Add Members
          </button>
        </div>
      </div>
    </div>
  );
};

const TeamDetail = ({ team, onClose, onEdit, onAddMember, onAddTask, onUpdateTeam }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('members');
  const [teamLeaderId, setTeamLeaderId] = useState(team?.members[0]?.id || '');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTeam, setEditedTeam] = useState({...team});
  const [selectedColor, setSelectedColor] = useState(parseInt(team.id) % teamColors.length);
  
  // Get a consistent color based on team id
  const colorIndex = parseInt(team.id) % teamColors.length;
  const color = teamColors[colorIndex];

  const handleAddMember = (newMembers) => {
    onAddMember(team.id, newMembers);
  };

  const handleAddTask = (newTask) => {
    onAddTask(team.id, newTask);
    setShowAddTaskModal(false);
  };

  const handleRemoveMember = (memberId) => {
    const updatedMembers = team.members.filter(member => member.id !== memberId);
    onUpdateTeam({
      ...team,
      members: updatedMembers
    });
  };

  const handleSaveTeamEdits = () => {
    onUpdateTeam({
      ...editedTeam,
      colorIndex: selectedColor
    });
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditedTeam({...team});
    setSelectedColor(parseInt(team.id) % teamColors.length);
    setEditMode(false);
  };

  const handleTeamLeaderChange = (leaderId) => {
    setTeamLeaderId(leaderId);
    const updatedMembers = team.members.map(member => ({
      ...member,
      isLeader: member.id === leaderId
    }));
    
    onUpdateTeam({
      ...team,
      members: updatedMembers
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl animate-fade-in overflow-hidden">
      {/* Header */}
      <div className={`h-3 bg-gradient-to-r ${color.primary}`}></div>
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {editMode ? (
          <div className="flex-1">
            <input
              type="text"
              value={editedTeam.name}
              onChange={(e) => setEditedTeam({...editedTeam, name: e.target.value})}
              className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
              placeholder="Team Name"
            />
            <input
              type="text"
              value={editedTeam.projectName}
              onChange={(e) => setEditedTeam({...editedTeam, projectName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
              placeholder="Project Name"
            />
          </div>
        ) : (
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-xl ${color.secondary} flex items-center justify-center font-bold text-xl`}>
              {team.name.charAt(0)}
            </div>
            <div className="ml-3">
              <h3 className="text-xl font-semibold">{team.name}</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">{team.projectName}</div>
            </div>
          </div>
        )}
        <div className="flex items-center">
          <button 
            onClick={() => setEditMode(!editMode)}
            className="mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings size={18} />
          </button>
          <button 
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {editMode ? (
        <div className="p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editedTeam.description}
                onChange={(e) => setEditedTeam({...editedTeam, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                placeholder="Team description"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Team Color</label>
              <div className="flex flex-wrap gap-2">
                {teamColors.map((color, index) => (
                  <button 
                    key={index}
                    type="button"
                    onClick={() => setSelectedColor(index)}
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${color.primary} ${selectedColor === index ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  ></button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Team Leader</label>
              <select
                value={teamLeaderId}
                onChange={(e) => setTeamLeaderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
              >
                {team.members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTeamEdits}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex px-5">
              {[
                { id: 'members', label: 'Members' },
                { id: 'tasks', label: 'Tasks' },
                { id: 'settings', label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`py-4 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5">
            {activeTab === 'members' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium">Team Members ({team.members.length})</h4>
                  <button 
                    onClick={() => setShowAddMemberModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center text-sm shadow-sm transition-colors"
                  >
                    <UserPlus size={16} className="mr-1.5" />
                    <span>Add Member</span>
                  </button>
                </div>
                {team.members.map(member => (
                  <TeamMemberItem 
                    key={member.id} 
                    member={member} 
                    isLeader={member.id === teamLeaderId} 
                    onRemove={handleRemoveMember}
                  />
                ))}
              </div>
            )}
            
            {activeTab === 'tasks' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium">Team Tasks ({team.tasks?.length || 0})</h4>
                  <button 
                    onClick={() => setShowAddTaskModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center text-sm shadow-sm transition-colors"
                  >
                    <Plus size={16} className="mr-1.5" />
                    <span>Add Task</span>
                  </button>
                </div>
                {team.tasks && team.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {team.tasks.map(task => (
                      <div 
                        key={task.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.status}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No tasks assigned to this team yet</p>
                    <button 
                      onClick={() => setShowAddTaskModal(true)}
                      className="mt-3 text-blue-500 font-medium"
                    >
                      Assign a task
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h4 className="text-lg font-medium mb-4">Team Settings</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar size={16} className="mr-2 text-gray-500" />
                      <span className="text-sm font-medium">Created on</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{team.createdDate || 'Unknown'}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{team.description}</p>
                  </div>
                  
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-sm"
                  >
                    Edit Team
                  </button>
                  
                  <button
                    className="w-full px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete Team
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onSave={handleAddMember}
          team={team}
        />
      )}

      {/* Add Task Modal - with pre-selected project and project selection disabled */}
      {showAddTaskModal && (
        <AddTaskModal 
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onAddTask={handleAddTask}
          projects={[{ id: team.id, name: team.projectName }]}
          preSelectedProject={team.id}
          disableProjectSelection={true}
        />
      )}
    </div>
  );
};

const CreateTeamModal = ({ isOpen, onClose, onSave }) => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [teamLeader, setTeamLeader] = useState('');
  
  // Mock projects and users data
  const projects = [
    { id: '1', name: 'Website Redesign' },
    { id: '2', name: 'Mobile App Development' },
    { id: '3', name: 'Marketing Campaign' },
  ];
  
  const availableUsers = [
    { id: '1', name: 'John Doe', role: 'UX Designer' },
    { id: '2', name: 'Sarah Miller', role: 'Developer' },
    { id: '3', name: 'Michael Chen', role: 'Project Manager' },
    { id: '4', name: 'Emily Wong', role: 'UI Designer' },
    { id: '5', name: 'Alex Johnson', role: 'Backend Developer' },
  ];
  
  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
      if (teamLeader === userId) {
        setTeamLeader('');
      }
    } else {
      setSelectedMembers([...selectedMembers, userId]);
      if (selectedMembers.length === 0) {
        setTeamLeader(userId); // Set first member as team leader by default
      }
    }
  };
  
  const handleSave = () => {
    if (!teamName || !selectedProject || selectedMembers.length === 0 || !teamLeader) {
      // Show validation error
      return;
    }
    
    const newTeam = {
      id: `new-${Date.now()}`,
      name: teamName,
      projectName: projects.find(p => p.id === selectedProject)?.name,
      projectId: selectedProject,
      description,
      colorIndex: selectedColor,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      members: selectedMembers.map(memberId => {
        const user = availableUsers.find(u => u.id === memberId);
        return {
          id: user.id,
          name: user.name,
          role: user.role,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          isLeader: memberId === teamLeader
        };
      }),
      tasks: []
    };
    
    onSave(newTeam);
    
    // Reset form
    setTeamName('');
    setDescription('');
    setSelectedProject('');
    setSelectedColor(0);
    setSelectedMembers([]);
    setTeamLeader('');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Create New Team</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Team Name*</label>
              <input 
                type="text" 
                value={teamName} 
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Project*</label>
              <select 
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the team's purpose and goals"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
            ></textarea>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Team Color</label>
            <div className="flex flex-wrap gap-3">
              {teamColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedColor(index)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${color.primary} ${selectedColor === index ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                ></button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Team Members* ({selectedMembers.length} selected)</label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-60 overflow-y-auto p-1">
              {availableUsers.map(user => (
                <div 
                  key={user.id} 
                  className={`flex items-center p-2 rounded cursor-pointer ${
                    selectedMembers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                  onClick={() => toggleMember(user.id)}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => {}}
                    className="mr-3 h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Team Leader*</label>
            <select 
              value={teamLeader}
              onChange={(e) => setTeamLeader(e.target.value)}
              disabled={selectedMembers.length === 0}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select team leader</option>
              {selectedMembers.map(memberId => {
                const user = availableUsers.find(u => u.id === memberId);
                return (
                  <option key={memberId} value={memberId}>{user.name}</option>
                );
              })}
            </select>
            {selectedMembers.length === 0 && (
              <p className="text-xs text-yellow-500">Select team members first</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!teamName || !selectedProject || selectedMembers.length === 0 || !teamLeader}
          >
            Create Team
          </button>
        </div>
      </div>
    </div>
  );
};

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock data loading
  useEffect(() => {
    setTimeout(() => {
      setTeams([
        {
          id: '1',
          name: 'Design Team',
          projectName: 'Website Redesign',
          description: 'Responsible for UI/UX design, visual elements, and overall user experience of the website.',
          createdDate: 'Apr 2, 2025',
          members: [
            { id: '1', name: 'John Doe', role: 'Team Lead', joinedDate: 'Apr 2, 2025' },
            { id: '2', name: 'Sarah Miller', role: 'UI Designer', joinedDate: 'Apr 3, 2025' },
            { id: '3', name: 'Michael Chen', role: 'UX Researcher', joinedDate: 'Apr 5, 2025' },
            { id: '4', name: 'Emily Wong', role: 'Graphic Designer', joinedDate: 'Apr 7, 2025' }
          ],
          tasks: [
            { id: '1', title: 'Design homepage mockup', status: 'In Progress' },
            { id: '2', title: 'Create design system', status: 'Not Started' }
          ]
        },
        {
          id: '2',
          name: 'Development Team',
          projectName: 'Mobile App Development',
          description: 'Frontend and backend developers working on the mobile application architecture, features, and performance.',
          createdDate: 'Apr 3, 2025',
          members: [
            { id: '5', name: 'Alex Johnson', role: 'Tech Lead', joinedDate: 'Apr 3, 2025' },
            { id: '6', name: 'Lisa Park', role: 'Frontend Developer', joinedDate: 'Apr 4, 2025' },
            { id: '7', name: 'David Garcia', role: 'Backend Developer', joinedDate: 'Apr 4, 2025' },
            { id: '8', name: 'Olivia Kim', role: 'Mobile Developer', joinedDate: 'Apr 5, 2025' },
            { id: '9', name: 'Ryan Martinez', role: 'QA Engineer', joinedDate: 'Apr 6, 2025' }
          ],
          tasks: [
            { id: '3', title: 'Implement authentication', status: 'In Progress' },
            { id: '4', title: 'Optimize database queries', status: 'In Progress' }
          ]
        },
        {
          id: '3',
          name: 'Marketing Team',
          projectName: 'Marketing Campaign',
          description: 'Responsible for planning and executing marketing strategies, content creation, and campaign analytics.',
          createdDate: 'Apr 5, 2025',
          members: [
            { id: '10', name: 'Jessica Lee', role: 'Marketing Manager', joinedDate: 'Apr 5, 2025' },
            { id: '11', name: 'Brian Wilson', role: 'Content Creator', joinedDate: 'Apr 6, 2025' },
            { id: '12', name: 'Amanda Taylor', role: 'Social Media Specialist', joinedDate: 'Apr 7, 2025' }
          ],
          tasks: [
            { id: '5', title: 'Create content for social media', status: 'Completed' }
          ]
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectTeam = (team) => {
    // Find the most up-to-date version of the team
    const updatedTeam = teams.find(t => t.id === team.id) || team;
    setSelectedTeam(updatedTeam);
    setIsEditing(false);
  };
  
  const handleCloseTeamDetail = () => {
    setSelectedTeam(null);
    setIsEditing(false);
  };
  
  const handleCreateTeam = (newTeam) => {
    setTeams([...teams, newTeam]);
  };
  
  const handleEditTeam = () => {
    setIsEditing(true);
  };
  
  const handleAddMemberToTeam = (teamId, newMembers) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: [...team.members, ...newMembers]
        };
      }
      return team;
    }));

    // Update the selected team if it's the one being modified
    if (selectedTeam && selectedTeam.id === teamId) {
      setSelectedTeam({
        ...selectedTeam,
        members: [...selectedTeam.members, ...newMembers]
      });
    }
  };

  const handleAddTaskToTeam = (teamId, newTask) => {
    const taskWithId = {
      ...newTask,
      id: `task-${Date.now()}`
    };

    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: [...(team.tasks || []), taskWithId]
        };
      }
      return team;
    }));

    // Update the selected team if it's the one being modified
    if (selectedTeam && selectedTeam.id === teamId) {
      setSelectedTeam({
        ...selectedTeam,
        tasks: [...(selectedTeam.tasks || []), taskWithId]
      });
    }
  };

  const handleUpdateTeam = (updatedTeam) => {
    setTeams(teams.map(team => 
      team.id === updatedTeam.id ? updatedTeam : team
    ));
    
    setSelectedTeam(updatedTeam);
  };
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Teams</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
          >
            <Plus size={18} className="mr-2" />
            <span>New Team</span>
          </button>
        </div>
        
        {/* Search */}
        <div className="mt-6 relative">
          <input
            type="text"
            placeholder="Search teams by name or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search size={18} />
          </div>
        </div>
      </div>
      
      {/* Team List and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team List */}
        <div className={`${selectedTeam ? 'hidden lg:block' : ''} ${selectedTeam ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 animate-pulse">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex space-x-1">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredTeams.map((team, index) => (
                <TeamCard key={team.id} team={team} index={index} onSelect={handleSelectTeam} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-xl font-medium">No teams found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {searchQuery ? 'Try a different search term' : 'Create your first team to get started'}
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center shadow-sm transition-colors"
              >
                <Plus size={18} className="mr-2" />
                <span>New Team</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Team Detail */}
        {selectedTeam && (
          <div className="lg:col-span-2">
            <TeamDetail 
              team={selectedTeam} 
              onClose={handleCloseTeamDetail} 
              onEdit={handleEditTeam}
              onAddMember={handleAddMemberToTeam}
              onAddTask={handleAddTaskToTeam}
              onUpdateTeam={handleUpdateTeam}
            />
          </div>
        )}
      </div>
      
      {/* Create Team Modal */}
      <CreateTeamModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSave={handleCreateTeam}
      />
    </div>
  );
};

export default Teams;