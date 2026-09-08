# Phase 4 Real-Time Features - Quick Reference

## 🚀 Quick Start

### Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

---

## 💬 Chat Feature

### Access
- **Link**: Sidebar → Chat (💬)
- **URL**: http://localhost:3000/chat

### How to Use
1. Navigate to Chat page
2. You'll be connected to the group conversation
3. Type a message and press Enter (or click Send)
4. See messages from other users in real-time
5. Typing indicator shows when others are typing
6. Click edit (✏️) to edit your messages
7. Click delete (🗑️) to remove your messages

### Features
- ✅ Real-time message delivery
- ✅ Edit/delete messages
- ✅ Typing indicators
- ✅ Active users list
- ✅ Connection status
- ✅ 30-message history limit

---

## 🔔 Notifications Feature

### Access
- **Link**: Sidebar → Notifications (🔔)
- **URL**: http://localhost:3000/notifications

### How to Use
1. Navigate to Notifications page
2. View all notifications or filter by:
   - **All**: Show all notifications
   - **Unread**: Only unread notifications
   - **Approvals**: Only approval notifications
3. Click checkmark (✓) to mark as read
4. Click delete (🗑️) to remove notification
5. View notification metadata if available

### Features
- ✅ Real-time notification delivery
- ✅ Toast alerts when new notifications arrive
- ✅ Filter by type
- ✅ Mark as read/unread
- ✅ Delete notifications
- ✅ Metadata display
- ✅ Unread count badge

### Notification Bell
The bell icon (🔔) in the top-right shows:
- Unread count badge
- Quick access to notifications
- Connection status (red if disconnected)

---

## 📊 Live Dashboard Feature

### Access
- **Link**: Sidebar → Dashboard (📊)
- **URL**: http://localhost:3000/dashboard

### How to Use
1. Navigate to Dashboard
2. View KPI cards that update every 30 seconds
3. Check connection status indicator
4. See last update timestamp
5. Click refresh button to get immediate update

### Real-Time Data
- Total Sales (updates live)
- Total Customers (updates live)
- Net Profit (updates live)
- Pending Payments (updates live)
- Outstanding Credits (updates live)
- New Customers (updates live)
- Connection Status (Live/Updating)
- Last Updated (timestamp)

---

## 🔌 WebSocket Architecture

### Connection Flow
```
Frontend Login
    ↓
Stores user info in localStorage
    ↓
MainLayout initializes real-time services
    ↓
Connects to:
  • Chat socket (/chat namespace)
  • Notifications socket (/notifications namespace)
  • Dashboard socket (/dashboard namespace - lazy load)
```

### Namespaces
- `/chat` - Group conversations and direct messaging
- `/notifications` - User alerts and notifications
- `/dashboard` - Business metrics and KPIs
- `/` - General broadcasts

### Reconnection
- Automatic on disconnect
- Exponential backoff (1s, 2s, 4s, 8s...)
- Max 5 reconnection attempts
- Manual reconnection available

---

## 🛠️ Developer Notes

### Socket Service
```typescript
// Initialize manually (usually done in MainLayout)
import { initializeRealtimeServices } from '@/services/realtime-init';
initializeRealtimeServices(userId, userName);

// Get connection status
import { getRealtimeConnectionStatus } from '@/services/realtime-init';
const status = getRealtimeConnectionStatus();
// Returns: { chat: boolean, notifications: boolean }

// Disconnect
import { disconnectRealtimeServices } from '@/services/realtime-init';
disconnectRealtimeServices();
```

### useChat Hook
```typescript
const {
  messages,           // Array of messages
  typingUsers,        // Array of typing users
  activeUsers,        // Array of active users
  connected,          // Boolean connection status
  sendMessage,        // (msg, type?, metadata?) => void
  editMessage,        // (id, newMsg) => void
  deleteMessage,      // (id) => void
  setTyping,          // (isTyping) => void
  markAsRead,         // (id) => void
  markAllAsRead,      // () => void
  fetchActiveUsers,   // () => void
} = useChat(userId, userName, conversationId);
```

### useRealtimeNotifications Hook
```typescript
const {
  notifications,      // Array of notifications
  unreadCount,        // Number of unread
  connected,          // Boolean connection status
  fetchNotifications, // (page?, limit?) => void
  markAsRead,         // (id) => void
  markAllAsRead,      // () => void
  deleteNotification, // (id) => void
  getStatistics,      // () => void
  ping,              // () => void
} = useRealtimeNotifications(userId, showToast);
```

### useLivedashboard Hook
```typescript
const {
  dashboardData,      // DashboardUpdate object
  connected,          // Boolean connection status
  refreshDashboard,   // () => void
} = useLivedashboard(userId);
```

---

## 📱 Client Events (What Frontend Sends)

### Chat Events
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `send_message` - Send a new message
- `edit_message` - Edit a sent message
- `delete_message` - Delete a message
- `typing` - Send typing indicator
- `mark_read` - Mark message as read
- `mark_conversation_read` - Mark all messages as read
- `get_active_users` - Get users in conversation

### Notification Events
- `fetch_notifications` - Get notification history
- `mark_read` - Mark notification as read
- `mark_all_read` - Mark all as read
- `delete_notification` - Delete a notification
- `get_unread_count` - Get unread count
- `get_statistics` - Get notification stats
- `ping` - Test connection

### Dashboard Events
- `get_dashboard_data` - Request full dashboard data

---

## 📡 Server Events (What Backend Sends)

### Chat Events
- `message_received` - New message
- `message_edited` - Message was edited
- `message_deleted` - Message was deleted
- `message_read` - Message marked as read
- `conversation_read` - Conversation marked as read
- `user_typing` - User is typing
- `user_online` - User came online
- `user_offline` - User went offline
- `user_joined` - User joined conversation
- `user_left` - User left conversation
- `error` - Error occurred

### Notification Events
- `unread_count` - Current unread count
- `notification` - New notification received
- `notification_read` - Notification marked as read
- `all_notifications_read` - All marked as read
- `notification_deleted` - Notification deleted
- `notifications_fetched` - Notification list received
- `statistics` - Notification stats

### Dashboard Events
- `dashboard_update` - Full dashboard data
- `kpi_update` - KPI update only
- `activities_update` - Activities update only
- `requests_update` - Pending requests update

---

## 🐛 Troubleshooting

### Chat not connecting?
1. Check backend is running: `npm run start:dev` in backend folder
2. Check NEXT_PUBLIC_API_URL in frontend/.env.local
3. Look for connection errors in browser console

### Notifications not appearing?
1. Check notifications socket connection status
2. Verify user is logged in and has ID
3. Check browser console for Socket.io errors

### Dashboard not updating?
1. Ensure backend is running
2. Check connection indicator on dashboard page
3. Click refresh button to trigger update
4. Check browser network tab for WebSocket traffic

### Connection drops frequently?
1. Check network stability
2. Verify backend is responsive
3. Check browser console for errors
4. Reconnection will happen automatically

---

## 🔒 Security Notes

- Socket connections use the same JWT token as HTTP requests
- User ID extracted from token for validation
- CORS configured to allow frontend origin only
- All connections require valid user ID

---

## 📚 Files Reference

### Frontend (Real-Time)
- `/frontend/src/services/socket.service.ts` - Socket manager
- `/frontend/src/services/realtime-init.ts` - Initialization
- `/frontend/src/hooks/useChat.ts` - Chat hook
- `/frontend/src/hooks/useRealtimeNotifications.ts` - Notifications hook
- `/frontend/src/hooks/useLivedashboard.ts` - Dashboard hook
- `/frontend/src/app/chat/page.tsx` - Chat page
- `/frontend/src/app/notifications/page.tsx` - Notifications page

### Backend (Gateways)
- `/backend/src/modules/chat/chat.gateway.ts` - Chat gateway
- `/backend/src/modules/notifications/notifications.gateway.ts` - Notifications gateway
- `/backend/src/modules/dashboard/dashboard.gateway.ts` - Dashboard gateway

---

## ✅ What's Ready for Testing

- [x] Real-time chat
- [x] Typing indicators
- [x] Edit/delete messages
- [x] Live notifications
- [x] Toast alerts
- [x] Dashboard KPI updates
- [x] Connection status indicators
- [x] Automatic reconnection
- [x] User presence tracking
- [x] Notification history

---

## 🎯 Next Steps (Optional)

- Implement message search
- Add file upload to chat
- Implement notification sound alerts
- Add notification preferences
- Implement read receipts
- Add message reactions
- Implement message threads

---

Generated: July 20, 2026
Status: Phase 4 Complete ✅
