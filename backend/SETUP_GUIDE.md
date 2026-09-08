# Backend Setup Guide

Quick start guide for setting up and running the ALEM CRM backend modules.

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` file in backend directory:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=alem_crm

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Application
NODE_ENV=development
PORT=3001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### 3. Database Setup
```bash
# Run migrations
npm run migration:run

# Or generate new migration
npm run migration:generate -- -n InitialSchema
```

### 4. Start Development Server
```bash
# Watch mode with auto-reload
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build
npm run start:prod
```

Server will start on `http://localhost:3001`

## Module File Structure

```
src/modules/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── dto/
│   ├── entities/
│   └── strategies/
├── customers/
│   ├── customers.controller.ts ✅
│   ├── customers.module.ts ✅
│   ├── customers.service.ts (existing)
│   ├── dto/
│   └── entities/
├── uploads/ ✅
│   ├── uploads.controller.ts
│   ├── uploads.module.ts
│   ├── uploads.service.ts
│   ├── dto/
│   └── entities/
├── dashboard/ ✅
│   ├── dashboard.controller.ts
│   ├── dashboard.module.ts
│   ├── dashboard.service.ts
│   └── dto/
├── approvals/ ✅
│   ├── approvals.controller.ts
│   ├── approvals.module.ts
│   ├── approvals.service.ts
│   ├── dto/
│   └── entities/
├── chat/ ✅
│   ├── chat.controller.ts
│   ├── chat.gateway.ts
│   ├── chat.module.ts
│   ├── chat.service.ts
│   ├── dto/
│   └── entities/
├── notifications/ ✅
│   ├── notifications.controller.ts
│   ├── notifications.gateway.ts
│   ├── notifications.module.ts
│   ├── notifications.service.ts
│   ├── dto/
│   └── entities/
└── ...other modules
```

## Importing Modules

All modules are already imported in `app.module.ts`. They will be loaded automatically:

```typescript
@Module({
  imports: [
    // ... other imports
    CustomersModule,      // ✅ Completed
    UploadsModule,        // ✅ Completed
    DashboardModule,      // ✅ Completed
    ApprovalsModule,      // ✅ Completed
    ChatModule,           // ✅ Completed
    NotificationsModule,  // ✅ Completed
  ],
})
export class AppModule {}
```

## Testing Modules

### Test Each Module
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Test specific module
npm run test -- customers.service
```

### Quick API Tests

#### Customers
```bash
# Get all customers
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/customers

# Search customers
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/customers/search?q=John&field=name"

# Create customer
curl -X POST http://localhost:3001/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","phone":"+251911234567"}'
```

#### Uploads
```bash
# Upload and detect columns
curl -X POST http://localhost:3001/uploads/detect-columns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@customers.xlsx" \
  -F "dataType=customers"

# Validate import
curl -X POST http://localhost:3001/uploads/1/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"columnMapping":{"Name":"name","Phone":"phone"}}'

# Execute import
curl -X POST http://localhost:3001/uploads/1/import \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"columnMapping":{"Name":"name"},"skipDuplicates":true}'
```

#### Dashboard
```bash
# Get complete dashboard
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/dashboard?period=month"

# Get KPIs only
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/dashboard/kpis
```

#### Approvals
```bash
# Create approval request
curl -X POST http://localhost:3001/approvals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"payment",
    "customerId":1,
    "amount":5000,
    "relatedId":1,
    "requestedBy":1
  }'

# Approve request
curl -X PUT http://localhost:3001/approvals/1/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision":"approved","approvedBy":2}'
```

#### Chat (WebSocket)
```javascript
// In browser console or Node.js
const io = require('socket.io-client');

const socket = io('http://localhost:3001/chat', {
  query: { userId: 1, userName: 'John Doe' }
});

// Join conversation
socket.emit('join_conversation', {
  conversationId: 'your-conversation-id'
});

// Send message
socket.emit('send_message', {
  conversationId: 'your-conversation-id',
  message: 'Hello!',
  messageType: 'text'
});

// Listen for messages
socket.on('message_received', (message) => {
  console.log('New message:', message);
});
```

#### Notifications (WebSocket)
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001/notifications', {
  query: { userId: 1 }
});

// Listen for notifications
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});

// Get unread count
socket.emit('get_unread_count', {}, (response) => {
  console.log('Unread count:', response.count);
});
```

## Common Issues & Fixes

### Issue: Database connection failed
**Solution:**
```bash
# Ensure PostgreSQL is running
# Check connection string in .env
# Verify database exists
```

### Issue: CORS errors
**Solution:**
- Set `FRONTEND_URL` in .env correctly
- Both chat and notifications gateways use this for CORS

### Issue: File upload fails
**Solution:**
```bash
# Ensure uploads directory exists
mkdir -p uploads

# Check file permissions
chmod 755 uploads/

# Verify file size < MAX_FILE_SIZE
```

### Issue: JWT token invalid
**Solution:**
```bash
# Ensure JWT_SECRET is set correctly in .env
# Token should be sent in Authorization header: Bearer TOKEN
```

## Docker Setup (Optional)

### Build Docker Image
```bash
docker build -f Dockerfile -t alem-crm-backend .
```

### Run Container
```bash
docker run -d \
  --name alem-crm-backend \
  -e DB_HOST=postgres \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e JWT_SECRET=your-secret \
  -p 3001:3001 \
  alem-crm-backend
```

### Docker Compose
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: alem_crm
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: alem_crm
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run with: `docker-compose up -d`

## Production Deployment

### Before Deploying
1. Set `NODE_ENV=production` in .env
2. Change `JWT_SECRET` to strong secret
3. Enable HTTPS/SSL
4. Set up proper CORS whitelist
5. Configure database backups
6. Set up logging and monitoring

### Deployment Steps
```bash
# Build for production
npm run build

# Run production server
npm run start:prod

# Or use PM2 for process management
pm2 start dist/main.js --name "alem-crm-backend"
pm2 save
pm2 startup
```

## Monitoring & Logs

### View Logs
```bash
# Development
npm run start:dev

# Production with PM2
pm2 logs alem-crm-backend

# Docker
docker logs alem-crm-backend
```

### Health Check
```bash
curl http://localhost:3001/health
```

## Next Steps

1. Review `BACKEND_MODULES.md` for detailed module documentation
2. Review API endpoints in each module
3. Set up frontend integration
4. Configure authentication tokens
5. Set up WebSocket connections
6. Configure database backups
7. Set up monitoring and alerts

## Support

For issues or questions:
1. Check logs: `npm run start:dev` for detailed error messages
2. Review BACKEND_MODULES.md for API usage
3. Check specific module documentation
4. Review test files for usage examples

---

Happy coding! 🚀
