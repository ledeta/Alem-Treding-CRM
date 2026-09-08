'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

interface ConnectionStatusProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ConnectionStatus({
  showLabel = true,
  size = 'sm',
}: ConnectionStatusProps) {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [socketStatus, setSocketStatus] = useState<{
    chat: boolean;
    notifications: boolean;
  }>({ chat: false, notifications: false });

  useEffect(() => {
    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkConnectionStatus = () => {
    try {
      const { getRealtimeConnectionStatus } = require('@/services/realtime-init');
      const connectionStatus = getRealtimeConnectionStatus();
      
      setSocketStatus(connectionStatus);
      
      if (connectionStatus.chat || connectionStatus.notifications) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      setStatus('disconnected');
    }
  };

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const isOnline = status === 'connected';

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {isOnline ? (
          <>
            <Wifi className={`${sizeClasses[size]} text-green-500`} />
            <span className={`absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-20`} />
          </>
        ) : (
          <WifiOff className={`${sizeClasses[size]} text-red-500`} />
        )}
      </div>
      
      {showLabel && (
        <div className={`${labelSizeClasses[size]}`}>
          <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
            {status === 'connected' && 'Online'}
            {status === 'connecting' && 'Connecting...'}
            {status === 'disconnected' && 'Offline'}
          </span>
          {size !== 'sm' && (
            <div className={`text-xs ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
              {socketStatus.chat && <span>💬 </span>}
              {socketStatus.notifications && <span>🔔 </span>}
              {!socketStatus.chat && !socketStatus.notifications && 'No connection'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
