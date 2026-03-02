import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, FileText, FileCheck, Clock, X } from 'lucide-react';
import { customerService, CustomerNotification } from '../services/customerService';
import { cn } from '@/lib/utils';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);

  useEffect(() => {
    setNotifications(customerService.getNotifications());
  }, []);

  const markAsRead = (id: string) => {
    customerService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) customerService.markNotificationRead(n.id);
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: CustomerNotification['type']) => {
    switch (type) {
      case 'quote': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'contract': return <FileCheck className="h-5 w-5 text-amber-600" />;
      case 'document': return <FileText className="h-5 w-5 text-purple-600" />;
      case 'system': return <Bell className="h-5 w-5 text-slate-600" />;
      default: return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };

  const getBgColor = (type: CustomerNotification['type']) => {
    switch (type) {
      case 'quote': return 'bg-blue-100';
      case 'contract': return 'bg-amber-100';
      case 'document': return 'bg-purple-100';
      case 'system': return 'bg-slate-100';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">Notifications</h2>
          <p className="text-slate-500 mt-2">Stay updated with your latest activities and alerts.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                notification.read ? "bg-white border-slate-200" : "bg-blue-50/50 border-blue-100"
              )}
            >
              <div className={cn("p-2 rounded-lg flex-shrink-0", getBgColor(notification.type))}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className={cn("text-sm font-medium", notification.read ? "text-slate-900" : "text-[#1A3C34]")}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Clock size={12} />
                      {notification.date}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle2 size={16} />
                    </Button>
                  )}
                </div>
                {notification.link && (
                  <Button variant="link" className="px-0 h-auto mt-2 text-primary" asChild>
                    <a href={notification.link}>View Details</a>
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No notifications</h3>
            <p className="text-slate-500 mt-2">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
