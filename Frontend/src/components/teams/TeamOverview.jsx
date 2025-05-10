import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, UserPlus, Calendar, Briefcase, CheckSquare, Users } from 'lucide-react';

const TeamOverview = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTeam, setEditedTeam] = useState({});
  
  // Available team colors
  const teamColors = [
    { name: 'Blue', value: 'blue' },
    { name: 'Purple', value: 'purple' },
    { name: 'Green', value: 'green' },
    { name: 'Red', value: 'red' },
    { name: 'Yellow', value: 'yellow' },
    { name: 'Indigo', value: 'indigo' }
  ];
  
  // Map color strings to CSS classes
  const getColorClass = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'indigo': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Fetch team data
  useEffect(() => {
    // Simulate fetching team data from API
    setTimeout(() => {
      // Mock team data
      const teamData = {
        id: teamId,
        name: teamId === '1' ? 'Design Team' : teamId === '2' ? 'Development Team' : 'Marketing Team',
        description: 'Responsible for UI/UX design, visual elements, and overall user experience of the website.',
        color: teamId === '1' ? 'blue' : teamId === '2' ? 'purple' : 'green',
        project: teamId === '1' ? 'Website Redesign' : teamId === '2' ? 'Mobile App Development' : 'Marketing Campaign',
        leader: teamId === '1' ? { id: '1', name: 'John Doe' } : teamId === '2' ? { id: '5', name: 'Alex Johnson' } : { id: '10', name: 'Jessica Lee' },
        members: teamId === '1' ? [
          { id: '1', name: 'John Doe', role: 'Team Lead', joinedDate: 'Apr 2, 2025' },
          { id: '2', name: 'Sarah Miller', role: 'UI Designer', joinedDate: 'Apr 3, 2025' },
          { id: '3', name: 'Michael Chen', role: 'UX Researcher', joinedDate: 'Apr 5, 2025' },
          { id: '4', name: 'Emily Wong', role: 'Graphic Designer', joinedDate: 'Apr 7, 2025' }
        ] : teamId === '2' ? [
          { id: '5', name: 'Alex Johnson', role: 'Tech Lead', joinedDate: 'Apr 3, 2025' },
          { id: '6', name: 'Lisa Park', role: 'Frontend Developer', joinedDate: 'Apr 4, 2025' },
          { id: '7', name: 'David Garcia', role: 'Backend Developer', joinedDate: 'Apr 4, 2025' },
          { id: '8', name: 'Olivia Kim', role: 'Mobile Developer', joinedDate: 'Apr 5, 2025' },
          { id: '9', name: 'Ryan Martinez', role: 'QA Engineer', joinedDate: 'Apr 6, 2025' }
        ] : [
          { id: '10', name: 'Jessica Lee', role: 'Marketing Manager', joinedDate: 'Apr 5, 2025' },
          { id: '11', name: 'Brian Wilson', role: 'Content Creator', joinedDate: 'Apr 6, 2025' },
          { id: '12', name: 'Amanda Taylor', role: 'Social Media Specialist', joinedDate: 'Apr 7, 2025' }
        ],
        tasks: teamId === '1' ? [
          { id: '1', title: 'Design homepage mockup', status: 'In Progress' },
          { id: '2', title: 'Create design system', status: 'Not Started' }
        ] : teamId === '2' ? [
          { id: '3', title: 'Implement authentication', status: 'In Progress' },
          { id: '4', title: 'Optimize database queries', status: 'In Progress' }
        ] : [
          { id: '5', title: 'Create content for social media', status: 'Completed' }
        ],
        createdAt: 'April 2, 2025'
      };
      
      setTeam(teamData);
      setEditedTeam(teamData);
      setLoading(false);
    }, 1000);
  }, [teamId]);
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setTeam(editedTeam);
    }
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTeam({
      ...editedTeam,
      [name]: value
    });
  };
  
  const handleDeleteTeam = () => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      // Delete team logic would go here
      navigate('/app/teams');
    }
  };
  
  const handleAddMember = () => {
    // Add member logic would go here
    alert('Add member functionality would be implemented here');
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-4xl">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mr-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Team Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The team you're looking for doesn't exist or has been deleted.</p>
          <button 
            onClick={() => navigate('/app/teams')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Teams
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/app/teams')}
          className="p-2 mr-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <h1 className="text-2xl font-bold flex-1">{isEditing ? 'Edit Team' : 'Team Overview'}</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={handleEditToggle}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={handleDeleteTeam}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Team Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start">
            <div className={`w-16 h-16 ${getColorClass(team.color)} rounded-xl flex items-center justify-center text-white text-2xl font-bold mr-4`}>
              {team.name.charAt(0)}
            </div>
            
            {isEditing ? (
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Team Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedTeam.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editedTeam.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Team Color</label>
                  <div className="flex flex-wrap gap-2">
                    {teamColors.map(color => (
                      <div 
                        key={color.value}
                        onClick={() => setEditedTeam({...editedTeam, color: color.value})}
                        className={`w-8 h-8 rounded-full ${getColorClass(color.value)} cursor-pointer transition-transform ${editedTeam.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500 transform scale-110' : ''}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{team.name}</h2>
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                  <Briefcase className="w-4 h-4 mr-1" />
                  <span className="text-sm">{team.project}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{team.description}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Created on {team.createdAt}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
            <div className="p-6">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <Users className="w-5 h-5 mr-2" />
                <h3 className="font-medium">Members</h3>
              </div>
              <div className="text-2xl font-semibold">{team.members.length}</div>
            </div>
            <div className="p-6">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <CheckSquare className="w-5 h-5 mr-2" />
                <h3 className="font-medium">Tasks</h3>
              </div>
              <div className="text-2xl font-semibold">{team.tasks.length}</div>
            </div>
            <div className="p-6">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="font-medium">Team Lead</h3>
              </div>
              <div className="text-lg font-semibold">{team.leader.name}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Team Members */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Team Members</h2>
          <button
            onClick={handleAddMember}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            <span>Add Member</span>
          </button>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {team.members.map(member => (
            <div key={member.id} className="p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-semibold mr-3">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{member.role}</div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Joined {member.joinedDate}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Team Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Team Tasks</h2>
          <button
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Task</span>
          </button>
        </div>
        
        {team.tasks.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {team.tasks.map(task => (
              <div key={task.id} className="p-4 flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  task.status === 'Completed' 
                    ? 'bg-green-500' 
                    : task.status === 'In Progress'
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <div className="font-medium">{task.title}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  task.status === 'Completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : task.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {task.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No tasks assigned to this team yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamOverview;