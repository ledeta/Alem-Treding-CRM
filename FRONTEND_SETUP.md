# ALEM CRM Frontend Setup Guide

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with header/sidebar
│   │   ├── page.tsx            # Home/redirect page
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Admin dashboard
│   │   ├── customers/
│   │   │   ├── page.tsx        # Customers list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx    # Customer detail
│   │   │   └── new/
│   │   │       └── page.tsx    # New customer form
│   │   ├── items/
│   │   │   ├── page.tsx        # Items list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx    # Item detail
│   │   │   └── new/
│   │   │       └── page.tsx    # New item form
│   │   ├── payments/
│   │   │   ├── page.tsx        # Payments list
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # New payment request
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Payment detail
│   │   ├── credits/
│   │   │   ├── page.tsx        # Credits list
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # New credit request
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Credit detail
│   │   ├── refunds/
│   │   │   ├── page.tsx        # Refunds list
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # New refund request
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Refund detail
│   │   ├── uploads/
│   │   │   └── page.tsx        # File upload page
│   │   ├── approvals/
│   │   │   └── page.tsx        # Approval workflows
│   │   ├── chat/
│   │   │   └── page.tsx        # Chat interface
│   │   └── not-found.tsx       # 404 page
│   │
│   ├── components/
│   │   ├── ui/                 # ShadCN UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Top navigation bar
│   │   │   ├── Sidebar.tsx     # Left sidebar menu
│   │   │   ├── Footer.tsx      # Footer
│   │   │   └── MainLayout.tsx  # Layout wrapper
│   │   │
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── StatusBadge.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx     # KPI metric card
│   │   │   ├── SalesTrendChart.tsx
│   │   │   ├── CustomerDistribution.tsx
│   │   │   ├── TopCustomers.tsx
│   │   │   └── RecentTransactions.tsx
│   │   │
│   │   ├── customers/
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CustomerTable.tsx
│   │   │   ├── CustomerSearch.tsx
│   │   │   └── CustomerDetail.tsx
│   │   │
│   │   ├── items/
│   │   │   ├── ItemForm.tsx
│   │   │   ├── ItemTable.tsx
│   │   │   └── ItemSearch.tsx
│   │   │
│   │   ├── payments/
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── PaymentTable.tsx
│   │   │   ├── ApprovalForm.tsx
│   │   │   └── PaymentStats.tsx
│   │   │
│   │   ├── uploads/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── ColumnMapping.tsx
│   │   │   ├── ValidationPreview.tsx
│   │   │   └── ImportProgress.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── UserStatus.tsx
│   │   │
│   │   └── auth/
│   │       └── ProtectedRoute.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useApi.ts          # API call wrapper
│   │   ├── useQuery.ts        # Query handling
│   │   ├── useSocket.ts       # WebSocket hook
│   │   ├── useForm.ts         # Form handling
│   │   └── useNotifications.ts
│   │
│   ├── store/
│   │   ├── auth.store.ts      # Auth state
│   │   ├── ui.store.ts        # UI state
│   │   ├── notifications.store.ts
│   │   └── chat.store.ts
│   │
│   ├── lib/
│   │   ├── api.ts             # API client ✅
│   │   ├── socket.ts          # Socket.IO client
│   │   ├── utils.ts           # Utility functions
│   │   └── cn.ts              # Class name utility
│   │
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces ✅
│   │
│   ├── styles/
│   │   └── globals.css        # Global styles
│   │
│   └── middleware.ts          # Next.js middleware
│
├── public/                     # Static assets
│   ├── images/
│   └── icons/
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── .env.example
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="ALEM CRM System"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### 3. Development Server
```bash
npm run dev
# Runs on http://localhost:3000
```

### 4. Production Build
```bash
npm run build
npm run start
```

## Key Features to Implement

### Authentication
- [x] API client setup
- [ ] Login page
- [ ] JWT token management
- [ ] Protected routes
- [ ] Auto-logout on token expiry

### Dashboard
- [ ] KPI cards (9 metrics)
- [ ] Sales trend chart
- [ ] Customer distribution
- [ ] Top customers list
- [ ] Top items list
- [ ] Recent transactions
- [ ] Payment status breakdown
- [ ] Pending approvals count

### Customer Management
- [ ] Customer list with pagination
- [ ] Advanced search (name, phone, ID)
- [ ] Customer profile with balance
- [ ] Create/Edit customer
- [ ] Inactivity tracker (15+ days)
- [ ] Balance color coding

### Item Management
- [ ] Item list with pagination
- [ ] Search by name, SKU, category
- [ ] Stock level display
- [ ] Create/Edit items
- [ ] Low stock alerts
- [ ] Inventory tracking

### Payment Management
- [ ] Payment request form
- [ ] Bank selection dropdown
- [ ] Payment list with status
- [ ] Approval workflows
- [ ] Payment statistics

### Credits & Refunds
- [ ] Credit request form
- [ ] Credit approval workflow
- [ ] Refund request form with item selection
- [ ] Approval tracking
- [ ] Credit balance updates

### Excel Import
- [ ] File upload with drag-drop
- [ ] Column auto-detection
- [ ] Column mapping interface
- [ ] Validation preview
- [ ] Import progress tracking
- [ ] Error reporting

### Real-Time Features
- [ ] Chat interface with WebSocket
- [ ] Message persistence (last 30)
- [ ] Typing indicators
- [ ] Online status
- [ ] Notifications dropdown
- [ ] Toast notifications
- [ ] Notification types (upload, payment, approval, etc.)

### Approval Center
- [ ] Payment approvals tab
- [ ] Credit approvals tab
- [ ] Refund approvals tab
- [ ] Bulk approve functionality
- [ ] Reject with reason

## Styling Guidelines

### Color Palette
```css
--primary: #0F172A;      /* Dark blue */
--secondary: #2563EB;    /* Bright blue */
--success: #22C55E;      /* Green */
--warning: #F59E0B;      /* Amber */
--danger: #EF4444;       /* Red */
--background: #F8FAFC;   /* Light gray */
--card: #FFFFFF;         /* White */
```

### Component Examples

#### KPI Card
```tsx
<KPICard
  title="Total Customers"
  value={15400}
  trend={{ value: 12, direction: 'up' }}
  icon={Users}
/>
```

#### Customer Table
```tsx
<CustomerTable
  customers={customers}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onPageChange={handlePageChange}
/>
```

#### Balance Display
```tsx
<BalanceDisplay
  balance={5000}
  credit={-1000}
  refund={500}
/>
```

## API Integration

All API calls are pre-configured in `src/lib/api.ts`:

```typescript
// Examples
import { customersAPI, paymentsAPI, dashboardAPI } from '@/lib/api';

// Get customers
const customers = await customersAPI.list(page, limit);

// Search customers
const results = await customersAPI.search(query, 'name');

// Get dashboard KPIs
const kpis = await dashboardAPI.getKPIs();

// Create payment request
const payment = await paymentsAPI.create({
  customerId: 1,
  amount: 5000,
  bank: 'CBE'
});

// Approve payment
const approved = await paymentsAPI.approve(paymentId, {
  approvedBy: userId
});
```

## State Management (Zustand)

```typescript
// Auth store
import { useAuthStore } from '@/store/auth.store';

const { user, token, login, logout } = useAuthStore();

// UI store
import { useUIStore } from '@/store/ui.store';

const { showNotification, showConfirm } = useUIStore();
```

## WebSocket Integration

```typescript
// Chat
import { useSocket } from '@/hooks/useSocket';

const { connected, sendMessage, onMessage } = useSocket('chat');

// Send message
sendMessage('send_message', {
  conversationId: 'conv-123',
  message: 'Hello!',
  messageType: 'text'
});

// Listen for messages
onMessage('message_received', (message) => {
  console.log('New message:', message);
});

// Notifications
const { socket: notifSocket } = useSocket('notifications');
```

## Form Handling

Using React Hook Form + Zod:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const form = useForm({
  resolver: zodResolver(schema),
});

const onSubmit = async (data) => {
  // Submit data
};
```

## Testing

### Component Testing
```bash
npm run test
npm run test:watch
```

### Build Verification
```bash
npm run build
# Check for any build errors
```

## Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Deploy via Vercel Dashboard
# Environment variables auto-synced
```

### Docker
```bash
docker build -f Dockerfile -t alem-crm-frontend .
docker run -p 3000:3000 alem-crm-frontend
```

## Performance Optimization

- [ ] Image optimization with Next.js Image
- [ ] Code splitting with dynamic imports
- [ ] API response caching
- [ ] Lazy loading of routes
- [ ] CSS minification
- [ ] Bundle size monitoring

## Accessibility

- [ ] WCAG 2.1 compliance
- [ ] Semantic HTML
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader testing

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Development Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement feature with components
3. Test locally: `npm run dev`
4. Format code: `npm run format`
5. Commit changes: `git commit -m "feat: add feature"`
6. Push branch: `git push origin feature/feature-name`
7. Create pull request for review

## Troubleshooting

### API Connection Issues
- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is configured correctly

### WebSocket Issues
- Ensure Socket.IO server is running
- Check `NEXT_PUBLIC_SOCKET_URL`
- Browser console for connection errors

### Build Failures
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf .next`
- Check TypeScript errors: `npm run type-check`

## Documentation

- API Documentation: See `backend/BACKEND_MODULES.md`
- Architecture: See `ARCHITECTURE.md`
- Database Schema: See `database/schema.sql`

---

**Status**: Ready for development ✅
**Last Updated**: 2024
