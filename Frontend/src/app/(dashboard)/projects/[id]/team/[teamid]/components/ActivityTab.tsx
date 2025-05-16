// Frontend/src/app/(dashboard)/projects/[id]/team/[teamid]/components/ActivityTab.tsx

import { ClipboardList, User, Calendar, PenSquare, Trash2, UserPlus, UserMinus } from 'lucide-react';

interface ActivityTabProps {
  teamId: string;
}

export default function ActivityTab({ teamId }: ActivityTabProps) {
  // Since this is hardcoded with no backend, we'll create some mock activity data
  const activities = [
    {
      id: 1,
      type: 'member_added',
      user: 'John Doe',
      timestamp: '2025-05-15T14:30:00Z',
      details: 'Added to the team as a Member'
    },
    {
      id: 2,
      type: 'task_created',
      user: 'Sarah Johnson',
      timestamp: '2025-05-14T11:20:00Z',
      details: 'Created task "Update design documentation"'
    },
    {
      id: 3,
      type: 'team_updated',
      user: 'Michael Smith',
      timestamp: '2025-05-12T09:45:00Z',
      details: 'Updated team description'
    },
    {
      id: 4,
      type: 'task_completed',
      user: 'Emily Chen',
      timestamp: '2025-05-10T16:15:00Z',
      details: 'Completed task "Setup development environment"'
    },
    {
      id: 5,
      type: 'member_removed',
      user: 'Alex Brown',
      timestamp: '2025-05-09T10:30:00Z',
      details: 'Removed from the team'
    }
  ];
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_added':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'member_removed':
        return <UserMinus className="w-4 h-4 text-red-500" />;
      case 'task_created':
        return <ClipboardList className="w-4 h-4 text-blue-500" />;
      case 'task_completed':
        return <ClipboardList className="w-4 h-4 text-green-500" />;
      case 'team_updated':
        return <PenSquare className="w-4 h-4 text-amber-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <ClipboardList className="w-5 h-5 mr-2" />
          Recent Activity
        </h3>
      </div>
      
      <div className="relative pl-4">
        {/* Timeline line */}
        <div className="absolute top-0 bottom-0 left-4 border-l-2 border-muted"></div>
        
        <div className="space-y-6 relative">
          {activities.map((activity) => (
            <div key={activity.id} className="ml-6 relative">
              {/* Timeline node */}
              <div className="absolute -left-10 mt-1 w-4 h-4 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="bg-card border border-border p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center mb-1">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{activity.user}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{activity.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}