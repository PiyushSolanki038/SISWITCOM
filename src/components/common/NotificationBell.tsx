import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '@/config/api';

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const NotificationBell: React.FC = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/messages/notifications`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      const data = await res.json();
      if (res.ok && data?.notifications) {
        setNotifications(data.notifications as Notification[]);
        setUnreadCount(Number(data.unreadCount || 0));
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      await fetch(`${API_CONFIG.baseUrl}/messages/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchNotifications();
    }
  };

  useEffect(() => {
    if (!user) return;
    if (!token) return;
    const url = `${API_CONFIG.baseUrl}/chat/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    const onNotif = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.notifications) {
          setNotifications(data.notifications as Notification[]);
          setUnreadCount(Number(data.unreadCount || 0));
        }
      } catch {}
    };
    es.addEventListener('notifications', onNotif as any);
    es.onerror = () => {};
    return () => {
      es.removeEventListener('notifications', onNotif as any);
      es.close();
    };
  }, [user, token]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-50 text-slate-500 hover:text-[#1A3C34] rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#EB5E4C] ring-2 ring-white animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-xl border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs bg-[#EB5E4C]/10 text-[#EB5E4C] px-2 py-0.5 rounded-full font-medium">
              {unreadCount} New
            </span>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`p-4 hover:bg-slate-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        {notification.link && (
                          <Link 
                            to={notification.link} 
                            className="text-[10px] text-[#1A3C34] font-medium hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        className="text-slate-400 hover:text-[#1A3C34] p-1"
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
