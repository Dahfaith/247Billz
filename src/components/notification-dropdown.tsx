"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Clock, Info, Check } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export function NotificationDropdown() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    // Fetch notifications on mount and occasionally
    const fetchNotifs = async () => {
      const data = await getNotifications();
      setNotifications(data || []);
    };
    
    fetchNotifs();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(current => 
      current.map(n => n.id === id ? { ...n, read: true } : n)
    );
    await markNotificationRead(id);
    router.refresh();
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(current => 
      current.map(n => ({ ...n, read: true }))
    );
    await markAllNotificationsRead();
    router.refresh();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative p-2 text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 border-2 border-card text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:underline font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-[350px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              You have no notifications right now.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex gap-3 p-4 border-b border-border/50 transition-colors hover:bg-muted/50 ${!notification.read ? 'bg-primary/5' : ''}`}
                >
                  <div className={`mt-0.5 rounded-full p-1.5 h-8 w-8 flex items-center justify-center shrink-0 ${
                    notification.type === 'success' ? 'bg-green-100 text-green-600' :
                    notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                     notification.type === 'warning' ? <Clock className="w-4 h-4" /> :
                     <Info className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-none ${!notification.read ? 'text-foreground' : 'text-foreground/80'}`}>
                        {notification.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 font-medium">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <button 
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
