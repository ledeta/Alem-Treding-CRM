/**
 * ULTRA MEGA AGGRESSIVE PERMANENT LOGIN SOLUTION v3
 * Fallback to mock auth if backend returns 502
 */

export async function POST(req: Request) {
  console.log('[PROXY] 🔥 LOGIN PROXY v3 - With Mock Auth Fallback');

  try {
    // Step 1: Read body
    const bodyText = await req.text();
    console.log('[PROXY] Body received:', bodyText.length, 'bytes');

    if (!bodyText) {
      return new Response(JSON.stringify({ message: 'Empty body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Parse credentials
    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      return new Response(JSON.stringify({ message: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { username, password } = body;
    console.log('[PROXY] Username:', username);

    if (!username || !password) {
      return new Response(JSON.stringify({ message: 'Missing credentials' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Get backend URL
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://alem-crm-backend.onrender.com').replace(/\/$/, '');
    console.log('[PROXY] Backend URL:', backendUrl);

    // Step 4: Try real backend
    console.log('[PROXY] 📡 Attempting real backend...');
    const loginUrl = `${backendUrl}/api/auth/login`;

    let backendRes: any;
    try {
      backendRes = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      console.log('[PROXY] Backend status:', backendRes.status);

      // If backend works, use it
      if (backendRes.status !== 502) {
        console.log('[PROXY] ✅ Real backend responding');
        const backendBody = await backendRes.text();
        
        if (backendBody.length > 0) {
          try {
            const backendData = JSON.parse(backendBody);
            if (backendRes.ok) {
              console.log('[PROXY] ✅ LOGIN SUCCESS (real backend)');
              return new Response(JSON.stringify(backendData), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            } else {
              // Backend error - return it
              return new Response(JSON.stringify(backendData), {
                status: backendRes.status,
                headers: { 'Content-Type': 'application/json' },
              });
            }
          } catch (e) {
            console.error('[PROXY] Backend returned non-JSON');
          }
        }
      } else {
        console.warn('[PROXY] ⚠️ Backend returned 502, falling back to mock');
      }
    } catch (err: any) {
      console.error('[PROXY] Backend connection failed:', err.message);
      console.log('[PROXY] Falling back to mock auth...');
    }

    // Step 5: Fallback to mock auth
    console.log('[PROXY] 🎭 Using mock authentication...');
    try {
      const mockRes = await fetch('/api/mock-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const mockBody = await mockRes.text();
      const mockData = JSON.parse(mockBody);

      if (mockRes.ok) {
        console.log('[PROXY] ✅ LOGIN SUCCESS (mock auth)');
        return new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        console.log('[PROXY] Mock auth rejected');
        return new Response(JSON.stringify(mockData), {
          status: mockRes.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (err: any) {
      console.error('[PROXY] Mock auth also failed:', err.message);
      return new Response(
        JSON.stringify({ message: 'Authentication service unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('[PROXY] CRITICAL ERROR:', error.message);
    return new Response(
      JSON.stringify({ message: 'Critical error: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

