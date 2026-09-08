import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface DashboardKPI {
  totalCustomers: number;
  newCustomers: number;
  totalSales: number;
  totalAssets: number;
  totalStockItems: number;
  pendingPayments: number;
  netProfit: number;
  outstandingCredits: number;
  pendingRefunds: number;
  noVisitCustomers: number;
  timestamp: Date;
}

export interface DashboardUpdate {
  kpis: DashboardKPI;
  recentActivities: any[];
  pendingRequests: {
    payments: number;
    credits: number;
    refunds: number;
  };
}

export function useLivedashboard(userId: number) {
  const [dashboardData, setDashboardData] = useState<DashboardUpdate | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Create a dedicated socket for dashboard updates
    const dashboardSocket = io(`${BACKEND_URL}/dashboard`, {
      query: { userId: userId.toString() },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(dashboardSocket);

    dashboardSocket.on('connect', () => {
      setConnected(true);
      // Request initial dashboard data
      dashboardSocket.emit('get_dashboard_data');
    });

    dashboardSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen for dashboard updates (every 30 seconds)
    dashboardSocket.on('dashboard_update', (data: DashboardUpdate) => {
      setDashboardData(data);
    });

    // Listen for KPI updates (real-time when data changes)
    dashboardSocket.on('kpi_update', (data: DashboardKPI) => {
      setDashboardData((prev) =>
        prev ? { ...prev, kpis: data } : { kpis: data, recentActivities: [], pendingRequests: { payments: 0, credits: 0, refunds: 0 } }
      );
    });

    // Listen for recent activities update
    dashboardSocket.on('activities_update', (activities: any[]) => {
      setDashboardData((prev) =>
        prev ? { ...prev, recentActivities: activities } : { kpis: {} as DashboardKPI, recentActivities: activities, pendingRequests: { payments: 0, credits: 0, refunds: 0 } }
      );
    });

    // Listen for pending requests update
    dashboardSocket.on('requests_update', (requests: any) => {
      setDashboardData((prev) =>
        prev ? { ...prev, pendingRequests: requests } : { kpis: {} as DashboardKPI, recentActivities: [], pendingRequests: requests }
      );
    });

    dashboardSocket.on('connect_error', (error) => {
      console.error('Dashboard socket connection error:', error);
    });

    return () => {
      dashboardSocket.off('connect');
      dashboardSocket.off('disconnect');
      dashboardSocket.off('dashboard_update');
      dashboardSocket.off('kpi_update');
      dashboardSocket.off('activities_update');
      dashboardSocket.off('requests_update');
      dashboardSocket.disconnect();
    };
  }, [userId]);

  const refreshDashboard = useCallback(() => {
    if (socket) {
      socket.emit('get_dashboard_data');
    }
  }, [socket]);

  return {
    dashboardData,
    connected,
    refreshDashboard,
  };
}
