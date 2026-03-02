import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerService, CustomerActivity } from '../services/customerService';
import { 
  FileText, 
  FileCheck, 
  FolderOpen, 
  PenTool, 
  User, 
  MessageSquare, 
  Bell,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Activity: React.FC = () => {
  const [activities, setActivities] = useState<CustomerActivity[]>([]);

  useEffect(() => {
    setActivities(customerService.getActivity());
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'quote': return <FileText className="h-5 w-5" />;
      case 'contract': return <FileCheck className="h-5 w-5" />;
      case 'document': return <FolderOpen className="h-5 w-5" />;
      case 'sign': return <PenTool className="h-5 w-5" />;
      case 'profile': return <User className="h-5 w-5" />;
      case 'support': return <MessageSquare className="h-5 w-5" />;
      case 'notification': return <Bell className="h-5 w-5" />;
      case 'check': return <CheckCircle2 className="h-5 w-5" />;
      case 'x': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getIconColor = (iconName: string) => {
    switch (iconName) {
      case 'quote': return 'text-blue-600 bg-blue-100';
      case 'contract': return 'text-amber-600 bg-amber-100';
      case 'document': return 'text-purple-600 bg-purple-100';
      case 'sign': return 'text-green-600 bg-green-100';
      case 'check': return 'text-green-600 bg-green-100';
      case 'x': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">Activity Timeline</h2>
          <p className="text-slate-500 mt-2">A complete history of your interactions and updates.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 border-l border-slate-200 space-y-8 my-4">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={activity.id} className="relative">
                  <span className={cn(
                    "absolute -left-[37px] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white",
                    getIconColor(activity.icon)
                  )}>
                    {getIcon(activity.icon)}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A3C34]">{activity.action}</h4>
                      <p className="text-sm text-slate-500 mt-1">{activity.description}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded">
                      {activity.date}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">No activity recorded yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Activity;
