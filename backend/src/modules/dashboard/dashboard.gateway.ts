import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { DashboardService } from './dashboard.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  namespace: '/dashboard',
})
export class DashboardGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(DashboardGateway.name);

  @WebSocketServer()
  server: Server;

  // Map to track active connections
  private userConnections = new Map<number, Set<string>>();

  // Interval for periodic updates
  private updateIntervals = new Map<number, NodeJS.Timeout>();

  constructor(private readonly dashboardService: DashboardService) {}

  afterInit(server: Server) {
    this.logger.log('Dashboard Gateway initialized');
  }

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      const userId = parseInt(socket.handshake.query.userId as string);

      if (!userId) {
        socket.disconnect();
        return;
      }

      socket.userId = userId;

      // Track user connection
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId).add(socket.id);

      this.logger.log(`User ${userId} connected to dashboard - Socket: ${socket.id}`);

      // Send initial dashboard data
      const dashboardData = await this.dashboardService.getDashboardData({});
      socket.emit('dashboard_update', dashboardData);

      // Start periodic updates (every 30 seconds)
      if (!this.updateIntervals.has(userId)) {
        const interval = setInterval(async () => {
          const updated = await this.dashboardService.getDashboardData({});
          
          // Emit to all sockets of this user
          const sockets = this.userConnections.get(userId);
          if (sockets) {
            sockets.forEach((socketId) => {
              this.server.to(socketId).emit('dashboard_update', updated);
            });
          }
        }, 30000); // Update every 30 seconds

        this.updateIntervals.set(userId, interval);
      }
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    if (socket.userId) {
      const connections = this.userConnections.get(socket.userId);
      if (connections) {
        connections.delete(socket.id);
        if (connections.size === 0) {
          this.userConnections.delete(socket.userId);
          this.logger.log(`User ${socket.userId} disconnected from dashboard (all sockets)`);

          // Clear interval
          const interval = this.updateIntervals.get(socket.userId);
          if (interval) {
            clearInterval(interval);
            this.updateIntervals.delete(socket.userId);
          }
        }
      }
    }
  }

  /**
   * Get dashboard data on demand
   */
  @SubscribeMessage('get_dashboard_data')
  async handleGetDashboardData(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    try {
      const dashboardData = await this.dashboardService.getDashboardData({});
      socket.emit('dashboard_update', dashboardData);
      return { success: true };
    } catch (error) {
      this.logger.error(`Get dashboard data error: ${error.message}`);
      socket.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Broadcast dashboard update to all admins
   */
  broadcastDashboardUpdate(update: any) {
    this.server.emit('dashboard_update', update);
  }

  /**
   * Send KPI update to specific user
   */
  sendKPIUpdate(userId: number, kpis: any) {
    const sockets = this.userConnections.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('kpi_update', kpis);
      });
    }
  }

  /**
   * Send activities update to specific user
   */
  sendActivitiesUpdate(userId: number, activities: any[]) {
    const sockets = this.userConnections.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('activities_update', activities);
      });
    }
  }

  /**
   * Send pending requests update to specific user
   */
  sendRequestsUpdate(userId: number, requests: any) {
    const sockets = this.userConnections.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('requests_update', requests);
      });
    }
  }
}
