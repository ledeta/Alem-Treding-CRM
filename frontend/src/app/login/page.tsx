'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import AnimatedLogo from '@/components/AnimatedLogo';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = username+password1, 2 = password2
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Initialize users on mount
  useEffect(() => {
    console.log('📱 Login page mounted - initializing users...');
    
    // ALWAYS initialize hardcoded users to localStorage
    const hardcodedUsers = [
      {
        username: 'admin',
        password1: 'Admin@2024!',
        password2: 'AdminSecure#2024',
        role: 'admin',
        fullName: 'System Administrator'
      },
      {
        username: 'sales',
        password1: 'Sales@2024!',
        password2: 'SalesSecure#2024',
        role: 'sales',
        fullName: 'Sales Representative'
      },
      {
        username: 'million',
        password1: 'million123',
        password2: 'million456',
        role: 'admin',
        fullName: 'Million Tiruneh'
      }
    ];

    // Get existing users from localStorage
    let storedUsers = [];
    try {
      const storedData = localStorage.getItem('users_data');
      if (storedData) {
        storedUsers = JSON.parse(storedData);
        console.log('✅ Loaded stored users:', storedUsers);
      }
    } catch (e) {
      console.error('❌ Error loading stored users:', e);
    }

    // Merge hardcoded and stored users (stored users take precedence)
    const mergedUsers = [
      ...hardcodedUsers.filter(hc => !storedUsers.find(s => s.username === hc.username)),
      ...storedUsers
    ];

    // Save merged users back to localStorage
    localStorage.setItem('users_data', JSON.stringify(mergedUsers));
    setAllUsers(mergedUsers);

    console.log('📦 All available users:', mergedUsers);
    console.log('📊 Total users:', mergedUsers.length);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        // Step 1: Validate username and password1
        console.log('🔐 Step 1 - Login attempt:', username);
        console.log('👥 Available users:', allUsers);

        // Check in all users (hardcoded + stored)
        const user = allUsers.find((u: any) => u.username === username);
        console.log('🔎 User found:', user);
        
        if (user && user.password1 === password) {
          console.log('✅ Step 1 valid!');
          setCurrentUser(user);
          setStep(2);
          setPassword('');
          setLoading(false);
          return;
        }

        // No valid credentials found
        console.log('❌ Invalid username or password');
        console.log('   Expected password1:', user?.password1);
        console.log('   Got:', password);
        setError('Invalid username or password');
        setLoading(false);
      } else if (step === 2) {
        // Step 2: Validate password2
        console.log('🔐 Step 2 - Validating second password');

        if (currentUser && currentUser.password2 === password2) {
          console.log('✅ Step 2 valid!');
          
          // Generate mock token
          const mockToken = btoa(
            JSON.stringify({
              sub: currentUser.username,
              username: currentUser.username,
              role: currentUser.role,
              fullName: currentUser.fullName,
              iat: Date.now(),
              exp: Date.now() + 3600000,
            })
          );

          // Store in localStorage and Zustand store
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify({
            username: currentUser.username,
            fullName: currentUser.fullName,
            role: currentUser.role,
          }));

          // Also update Zustand store
          const { setToken, setUser } = useAuthStore.getState();
          setToken(mockToken);
          setUser({
            id: currentUser.username,
            username: currentUser.username,
            fullName: currentUser.fullName,
            email: `${currentUser.username}@alemtrading.com`,
            role: currentUser.role,
            status: 'Active',
          });

          console.log('💾 Token stored');
          console.log('✅ Login successful!');
          
          // Redirect
          router.push('/dashboard');
          return;
        } else {
          console.log('❌ Invalid second password');
          setError('Invalid second password');
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setCurrentUser(null);
    setPassword('');
    setPassword2('');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1B4FA5 0%, #0D2B5F 100%)',
        fontFamily: "'Poppins', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(26, 35, 50, 0.22)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            gap: '1rem',
          }}
        >
          <AnimatedLogo />
          <div style={{ textAlign: 'left' }}>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: '700',
                fontFamily: "'Playfair Display', serif",
                margin: '0 0 0.25rem 0',
                color: '#1B4FA5',
                letterSpacing: '1px',
              }}
            >
              ALEM
            </h1>
            <p
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                fontFamily: "'Playfair Display', serif",
                margin: 0,
                color: '#F4C430',
                letterSpacing: '1px',
              }}
            >
              TRADING
            </p>
          </div>
        </div>
        <p style={{ color: '#5a5a5a', textAlign: 'center', marginBottom: '2rem' }}>
          {step === 1 ? 'Sign in to your account' : 'Enter your second password'}
        </p>

        {error && (
          <div
            style={{
              background: '#faf4f0',
              color: '#8b4545',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              borderLeft: '4px solid #8b4545',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {step === 1 ? (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#2d3748',
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1.5px solid #d4ccc1',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1,
                  }}
                  placeholder="Enter your username"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1B4FA5';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d4ccc1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#2d3748',
                  }}
                >
                  First Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1.5px solid #d4ccc1',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1,
                  }}
                  placeholder="Enter your first password"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1B4FA5';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d4ccc1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: loading ? '#0D2B5F' : 'linear-gradient(135deg, #1B4FA5 0%, #0D2B5F 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(27, 79, 165, 0.25)',
                }}
              >
                {loading ? 'Validating...' : 'Next Step'}
              </button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f4f8', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#4a5568' }}>
                  Logged in as: <strong>{currentUser?.username}</strong>
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#718096' }}>
                  Now verify with your second password
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#2d3748',
                  }}
                >
                  Second Password
                </label>
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1.5px solid #d4ccc1',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1,
                  }}
                  placeholder="Enter your second password"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1B4FA5';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d4ccc1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: loading ? '#0D2B5F' : 'linear-gradient(135deg, #1B4FA5 0%, #0D2B5F 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(27, 79, 165, 0.25)',
                  marginBottom: '0.75rem',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={handleBackToStep1}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#e2e8f0',
                  color: '#2d3748',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                ← Back
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
