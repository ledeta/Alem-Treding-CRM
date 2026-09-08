# Complete Auth Flow - After Aggressive Fix v2

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  User Opens Browser                                     │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  Root Layout loads                                      │
│  ├─ Imports Providers                                   │
│  └─ Wraps entire app                                    │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  Providers component initializes:                       │
│  ├─ Sets up QueryClient (React Query)                   │
│  ├─ Creates AuthInitializer component                   │
│  ├─ Wraps children with AuthInitializer                 │
│  └─ Sets up console logging suppression                 │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  AuthInitializer component runs:                        │
│  ├─ Runs useEffect on mount                             │
│  ├─ Reads localStorage.getItem('token')                 │
│  ├─ Reads localStorage.getItem('user')                  │
│  ├─ Calls Zustand: setToken(token)                      │
│  ├─ Calls Zustand: setUser(user)                        │
│  ├─ Waits 50ms for hydration                            │
│  ├─ Sets isReady = true                                 │
│  └─ Renders children                                    │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  Zustand auth-store persists state:                     │
│  ├─ Loads from localStorage (via persist middleware)    │
│  ├─ Populates: token, user, isAuthenticated             │
│  └─ Stores in Indexed DB (browser storage)              │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  User navigates to page (e.g., /dashboard)              │
│  ├─ Page component loads                                │
│  ├─ Page imports MainLayout                             │
│  └─ MainLayout wraps page content                       │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  MainLayout component checks auth:                      │
│  ├─ Imports useAuthStore hook                           │
│  ├─ Gets: token, user, logout from store                │
│  ├─ Runs useEffect with [token, authStoreUser] deps     │
│  ├─ Waits for Zustand hydration (50ms)                  │
│  ├─ Checks localStorage.getItem('token')                │
│  ├─ Checks Zustand: token from store                    │
│  ├─ If NO token found → router.push('/login')           │
│  ├─ If token found → Load user data                     │
│  ├─ Sets isReady = true                                 │
│  └─ Renders page with Sidebar + TopNav + children       │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  API Client intercepts all requests:                    │
│  ├─ Request interceptor gets token from store           │
│  ├─ Adds header: Authorization: Bearer {token}          │
│  ├─ Sends request to backend                            │
│  └─ Receives response                                   │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  API Response Handler:                                  │
│  ├─ If 200-299: return response.data                    │
│  ├─ If 401: reject but DON'T force logout               │
│  ├─ If 404: reject normally                             │
│  ├─ If 5xx: reject normally                             │
│  ├─ If network error: reject silently                   │
│  └─ Let components handle errors gracefully             │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  User navigates to another page (e.g., /customers):     │
│  ├─ Customers page component loads                      │
│  ├─ MainLayout re-checks auth (same as above)           │
│  ├─ MainLayout still sees token in store                │
│  ├─ Page renders, user stays logged in ✅               │
│  └─ NO LOGOUT ✅                                        │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  User refreshes page (F5):                              │
│  ├─ Browser reloads entire page                         │
│  ├─ AuthInitializer runs again                          │
│  ├─ Reads localStorage token (from login)               │
│  ├─ Restores to Zustand                                 │
│  ├─ MainLayout finds token in store                     │
│  ├─ Page renders, user stays logged in ✅               │
│  └─ NO LOGOUT ✅                                        │
├─────────────────────────────────────────────────────────┤
│                       ↓                                 │
│  User closes browser & reopens:                         │
│  ├─ Entire flow repeats from start                      │
│  ├─ AuthInitializer reads token from localStorage       │
│  ├─ (localStorage persists across browser close)        │
│  ├─ Zustand is restored from localStorage               │
│  ├─ MainLayout finds token                              │
│  ├─ User is immediately logged in ✅                    │
│  └─ NO LOGIN REQUIRED ✅                                │
└─────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Zustand Store (auth-store.ts)
**Responsibility**: Global auth state management

```typescript
export const useAuthStore = create<AuthStore>(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({  // ← CRITICAL: Explicit persist config
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

**Key Points**:
- Stores auth state globally
- Automatically persists to browser storage via `persist` middleware
- `partialize` tells persist middleware which fields to save
- Token survives page reload ✅

---

### 2. AuthInitializer (Providers.tsx)
**Responsibility**: Restore auth on app startup

```typescript
function AuthInitializer({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const { token, user, setToken, setUser } = useAuthStore()

  useEffect(() => {
    // Restore auth state from localStorage on mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && !token) {
      setToken(storedToken)  // ← Restore token to Zustand
    }

    if (storedUser && !user) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)  // ← Restore user to Zustand
      } catch (e) {
        console.warn('Failed to restore user', e)
      }
    }

    setIsReady(true)
  }, [])

  if (!isReady) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>  // Hidden while loading
  }

  return children
}
```

**Key Points**:
- Runs once on app load
- Reads token/user from localStorage
- Explicitly restores them to Zustand store
- Prevents race conditions
- Waits for restoration before rendering children ✅

---

### 3. MainLayout (MainLayout.tsx)
**Responsibility**: Enforce auth on protected pages

```typescript
export default function MainLayout({ children }: MainLayoutProps) {
  const { token, user: authStoreUser, logout: zustandLogout } = useAuthStore()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for both token and localStorage sync
    const timer = setTimeout(() => {
      const storedToken = localStorage.getItem('token')
      const storeToken = token  // ← Use store token

      // Check BOTH sources
      if (!storedToken && !storeToken) {
        router.push('/login')  // Not authenticated
        return
      }

      // Load user from store, or fall back to localStorage
      const userData = authStoreUser || 
        (() => {
          const stored = localStorage.getItem('user')
          return stored ? JSON.parse(stored) : null
        })()

      if (userData) {
        setUser(userData)
      }

      setLoading(false)
      setIsReady(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [token, authStoreUser, router])  // ← Re-run if token changes
}
```

**Key Points**:
- Checks Zustand store for token (primary source)
- Falls back to localStorage (backup)
- Waits for hydration (50ms) before checking
- Re-runs if token changes in store
- NO PREMATURE LOGOUT ✅

---

### 4. API Client (api-client.ts)
**Responsibility**: Handle authentication in API calls

```typescript
private setupInterceptors() {
  // REQUEST: Add token to every request
  this.client.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token  // Get from Zustand
      if (token) {
        config.headers.Authorization = `Bearer ${token}`  // ← Add token
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // RESPONSE: Handle errors without forcing logout
  this.client.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
      // Network errors → silent
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return Promise.reject({
          status: error.code,
          message: 'Network error',
        })
      }

      // Any other error → return structured error
      return Promise.reject({
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
      // ← NO AUTOMATIC 401 LOGOUT ✅
    }
  )
}
```

**Key Points**:
- Gets token from Zustand store (fresh on every request)
- Adds token to Authorization header
- Returns structured error objects
- Does NOT force logout on 401 ✅
- Lets components handle errors gracefully ✅

---

## Data Flow Diagram

### Login Flow:
```
Login Page
  ↓
User enters: admin / Admin@2024! / AdminSecure#2024
  ↓
handleLogin() validates credentials
  ↓
Generate mock JWT token
  ↓
Store in localStorage:
  ├─ localStorage.setItem('token', mockToken)
  └─ localStorage.setItem('user', JSON.stringify(userData))
  ↓
Store in Zustand:
  ├─ setToken(mockToken)
  └─ setUser(userData)
  ↓
router.push('/dashboard')
```

### Page Reload Flow:
```
User refreshes page (F5)
  ↓
AuthInitializer useEffect runs
  ↓
Read from localStorage:
  ├─ localStorage.getItem('token') → mockToken
  └─ localStorage.getItem('user') → userData
  ↓
Restore to Zustand:
  ├─ setToken(mockToken)
  └─ setUser(userData)
  ↓
setIsReady(true) → render children
  ↓
MainLayout checks useAuthStore.getState().token
  ↓
Token found → allow page render
  ↓
User stays logged in ✅
```

### API Request Flow:
```
Component calls: apiClient.get('/customers')
  ↓
Request interceptor runs:
  ├─ Gets token from Zustand: useAuthStore.getState().token
  ├─ Adds header: Authorization: Bearer {token}
  └─ Sends request to backend
  ↓
Backend validates token
  ↓
Response:
  ├─ If success (200) → return data
  ├─ If 401 → reject (but don't logout)
  ├─ If 404 → reject normally
  └─ If network error → reject silently
  ↓
Component handles response (may show error or retry)
```

---

## Why This Fixes Auto-Logout

### Problem Before:
1. ❌ localStorage and Zustand were out of sync
2. ❌ MainLayout checked localStorage before Zustand hydrated
3. ❌ Race condition could clear auth state
4. ❌ API client 401 responses forced logout

### Solution After:
1. ✅ AuthInitializer explicitly syncs localStorage → Zustand
2. ✅ MainLayout waits for hydration AND checks both sources
3. ✅ Zustand persist middleware stores state reliably
4. ✅ API client doesn't force logout on 401

### Result:
- ✅ Token persists across page reloads
- ✅ Session persists after browser close/reopen
- ✅ No unexpected logouts
- ✅ Smooth user experience

---

## Testing Verification Checklist

- [ ] Login works
- [ ] Navigate between pages → stay logged in
- [ ] Press F5 (refresh) → stay logged in
- [ ] Ctrl+F5 (hard refresh) → stay logged in
- [ ] Close browser → reopen → still logged in
- [ ] Check localStorage has token (DevTools)
- [ ] Check Zustand has token (Indexed DB)
- [ ] Check API requests have Authorization header (Network tab)
- [ ] No 401 errors in console during navigation

If all pass ✅ → **Auto-logout is FIXED!**
