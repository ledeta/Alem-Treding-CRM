/**
 * Real-time services initialization
 * Initializes all WebSocket connections on app startup
 */

import { socketService } from './socket.service';

export function initializeRealtimeServices(userId: number, userName: string) {
  if (!userId) return;

  try {
    // Connect to chat socket
    socketService.connectChat(userId, userName);

    // Connect to notifications socket
    socketService.connectNotifications(userId);

    console.log('✓ Real-time services initialized');
  } catch (error) {
    console.error('✗ Failed to initialize real-time services:', error);
  }
}

export function disconnectRealtimeServices() {
  try {
    socketService.disconnectAll();
    console.log('✓ Real-time services disconnected');
  } catch (error) {
    console.error('✗ Failed to disconnect real-time services:', error);
  }
}

export function getRealtimeConnectionStatus() {
  return socketService.isConnected();
}
