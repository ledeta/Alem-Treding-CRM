'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, User, Clock, Filter, Bell } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { buildApiUrl } from '@/lib/api-config';

interface Activity {
  id: string;
  type: 'message' | 'notification' | 'status_change' | 'payment' | 'credit' | 'refund';
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  action: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  read: boolean;
}

interface ActivitiesFeedProps {
  userId: number;
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export default function ActivitiesFeed({
  userId,
  limit = 10,
  showHeader = true,
  compact = false,
}: ActivitiesFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<'all' | 'messages' | 'payments' | 'approvals'>('all');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    loadActivities();
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('activity');
        socketRef.current.off('activities_update');
      }
    };
  }, [userId]);

  const loadActivities = async () => {
    try {
      const response = await fetch(
        buildApiUrl(`/activities?limit=${limit}`),
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(buildApiUrl('/dashboard'), {
      query: { userId: userId.toString() },
      transports: ['websocket', 'polling'],
    });

    socket.on('activities_update', (newActivities: Activity[]) => {
      setActivities((prev) => {
        const combined = [...newActivities, ...prev];
        return combined.slice(0, limit);
      });
    });

    socketRef.current = socket;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'notification':
        return <Bell className="w-4 h-4 text-purple-500" />;
      case 'status_change':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'payment':
        return <span className="text-lg">💳</span>;
      case 'credit':
        return <span className="text-lg">💵</span>;
      case 'refund':
        return <span className="text-lg">↩️</span>;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'payment':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'credit':
        return 'bg-orange-50 border-l-4 border-orange-500';
      case 'refund':
        return 'bg-red-50 border-l-4 border-red-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-300';
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    if (filter === 'messages') return activity.type === 'message';
    if (filter === 'payments') return ['payment', 'credit', 'refund'].includes(activity.type);
    if (filter === 'approvals') return activity.type === 'notification';
    return true;
  });

  if (compact && filteredActivities.length === 0) {
    return null;
  }

  return (
    <div className={`${compact ? '' : 'bg-white rounded-lg border'}`}>
      {showHeader && (
        <div className={`p-4 ${compact ? '' : 'border-b'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Recent Activities</h3>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>

          {!compact && (
            <div className="flex gap-2">
              {(['all', 'messages', 'payments', 'approvals'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    filter === f
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={`${compact ? 'space-y-2' : 'divide-y'}`}>
        {loading ? (
          <div className={`${compact ? 'p-2' : 'p-4'} text-center text-gray-500 text-sm`}>
            Loading activities...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className={`${compact ? 'p-2' : 'p-4'} text-center text-gray-500 text-sm`}>
            No activities
          </div>
        ) : (
          filteredActivities.slice(0, compact ? 5 : limit).map((activity) => (
            <div
              key={activity.id}
              className={`p-3 ${compact ? 'text-sm' : ''} hover:bg-gray-50 transition-colors ${
                compact ? '' : getActivityColor(activity.type)
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`${compact ? '' : 'font-medium'} text-gray-900`}>
                        <span className="font-semibold">{activity.user.name}</span>
                        {' '}{activity.action}
                      </p>
                      {!compact && (
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 mt-1`}>
                    {getTimeAgo(new Date(activity.timestamp))}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!compact && filteredActivities.length > 0 && (
        <div className="p-4 text-center border-t">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all activities →
          </button>
        </div>
      )}
    </div>
  );
}
