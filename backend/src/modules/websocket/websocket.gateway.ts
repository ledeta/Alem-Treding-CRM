import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Injectable } from '@nestjs/common'

interface ConnectedUser {
  userId: string
  socketId: string
  connectedAt: Date
}

@Injectable()
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private connectedUsers: Map<string, ConnectedUser[]> = new Map()
  private socketToUser: Map<string, string> = new Map()

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string
    if (!userId) {
      socket.disconnect()
      return
    }

    this.socketToUser.set(socket.id, userId)

    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, [])
    }

    this.connectedUsers.get(userId).push({
      userId,
      socketId: socket.id,
      connectedAt: new Date(),
    })

    socket.emit('connected', { userId, message: 'Connected to notifications' })
  }

  handleDisconnect(socket: Socket) {
    const userId = this.socketToUser.get(socket.id)
    if (userId) {
      const userSockets = this.connectedUsers.get(userId)
      if (userSockets) {
        const index = userSockets.findIndex((u) => u.socketId === socket.id)
        if (index > -1) {
          userSockets.splice(index, 1)
        }
      }
      this.socketToUser.delete(socket.id)
    }
  }

  @SubscribeMessage('ping')
  handlePing(socket: Socket): void {
    socket.emit('pong')
  }

  sendNotification(userId: string, notification: any): void {
    const userSockets = this.connectedUsers.get(userId)
    if (userSockets && userSockets.length > 0) {
      userSockets.forEach((user) => {
        this.server.to(user.socketId).emit('notification', notification)
      })
    }
  }

  broadcastNotification(notification: any): void {
    this.server.emit('notification', notification)
  }

  sendToRole(role: string, notification: any): void {
    this.server.emit(`notification:${role}`, notification)
  }

  sendMessage(userId: string, message: string): void {
    const userSockets = this.connectedUsers.get(userId)
    if (userSockets && userSockets.length > 0) {
      userSockets.forEach((user) => {
        this.server.to(user.socketId).emit('message', { text: message })
      })
    }
  }

  getConnectedUsersCount(): number {
    return this.connectedUsers.size
  }

  isUserConnected(userId: string): boolean {
    const userSockets = this.connectedUsers.get(userId)
    return userSockets && userSockets.length > 0
  }
}
