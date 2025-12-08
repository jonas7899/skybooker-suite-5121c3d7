import React from 'react';
import { formatDistanceToNow, format, parse } from 'date-fns';
import { hu } from 'date-fns/locale';
import { Check, Plane, X, Info, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/notification';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'booking_created':
      return <Plane className="h-4 w-4 text-primary" />;
    case 'booking_confirmed':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'booking_cancelled':
      return <X className="h-4 w-4 text-destructive" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
};

const formatTime = (timeString: string) => {
  try {
    const parsed = parse(timeString, 'HH:mm:ss', new Date());
    return format(parsed, 'HH:mm');
  } catch {
    return timeString;
  }
};

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead
}) => {
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nincsenek értesítések
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {notifications.map((notification) => (
        <button
          key={notification.id}
          onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
          className={cn(
            'w-full p-4 text-left border-b border-border last:border-0 hover:bg-muted/50 transition-colors',
            !notification.is_read && 'bg-primary/5'
          )}
        >
          <div className="flex gap-3">
            <div className="mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm',
                !notification.is_read && 'font-medium'
              )}>
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {notification.message}
              </p>
              {notification.booking && (
                <div className="mt-2 p-2 bg-muted/50 rounded-md space-y-1">
                  {notification.booking.flight_package?.name && (
                    <p className="text-xs font-medium text-foreground">
                      {notification.booking.flight_package.name}
                    </p>
                  )}
                  {notification.booking.time_slot && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(notification.booking.time_slot.slot_date), 'yyyy. MMM d.', { locale: hu })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(notification.booking.time_slot.start_time)}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: hu
                })}
              </p>
            </div>
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
