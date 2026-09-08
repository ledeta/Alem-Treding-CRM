/**
 * MEGA AGGRESSIVE WORKAROUND: Mock Authentication Service
 * 
 * Since backend is returning 502, we bypass it entirely and use a frontend-only auth.
 * This is TEMPORARY - once backend is fixed, switch back to real API.
 * 
 * This endpoint mimics the backend auth API exactly.
 */

const ADMIN_USER = {
  username: 'admin',
  email: 'admin@alem.com',
  password: 'Admin@2024!',
  fullName: 'System Administrator',
  role: 'admin',
};

const MOCK_USERS = [ADMIN_USER];

export async function POST(req: Request) {
  console.log('[MOCK-AUTH] 🎭 Mock auth endpoint called');

  try {
    const bodyText = await req.text();
    console.log('[MOCK-AUTH] Body received:', bodyText.length, 'bytes');

    if (!bodyText) {
      return new Response(JSON.stringify({ message: 'Empty body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error('[MOCK-AUTH] JSON parse error');
      return new Response(JSON.stringify({ message: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { username, password } = body;
    console.log('[MOCK-AUTH] Login attempt:', username);

    if (!username || !password) {
      return new Response(JSON.stringify({ message: 'Missing credentials' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find user
    const user = MOCK_USERS.find(
      (u) => (u.username === username || u.email === username) && u.password === password
    );

    if (!user) {
      console.log('[MOCK-AUTH] ❌ Invalid credentials');
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[MOCK-AUTH] ✅ User authenticated:', user.username);

    // Generate mock tokens
    const accessToken = Buffer.from(
      JSON.stringify({
        sub: 1,
        username: user.username,
        email: user.email,
        role: user.role,
        iat: Date.now(),
        exp: Date.now() + 3600000, // 1 hour
      })
    ).toString('base64');

    const refreshToken = Buffer.from(
      JSON.stringify({
        sub: 1,
        type: 'refresh',
        iat: Date.now(),
        exp: Date.now() + 604800000, // 7 days
      })
    ).toString('base64');

    return new Response(
      JSON.stringify({
        accessToken,
        refreshToken,
        user: {
          id: 1,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[MOCK-AUTH] ERROR:', error.message);
    return new Response(
      JSON.stringify({ message: 'Authentication error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
