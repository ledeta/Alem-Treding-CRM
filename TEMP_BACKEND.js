/**
 * TEMPORARY BACKEND SERVER
 * Simple HTTP server to test frontend login (no dependencies needed)
 * Run with: node TEMP_BACKEND.js
 */

const http = require('http');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Handle POST /auth/login
  if (req.method === 'POST' && req.url === '/auth/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        console.log(`Login attempt: ${username}`);
        
        if (username === 'admin' && password === 'Admin123!') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            accessToken: 'mock-jwt-token-' + Date.now(),
            user: {
              id: '1',
              username: 'admin',
              role: 'admin',
              fullName: 'Administrator'
            }
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
    return;
  }
  
  // Handle POST /auth/verify
  if (req.method === 'POST' && req.url === '/auth/verify') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      valid: true,
      user: {
        id: '1',
        username: 'admin',
        role: 'admin',
        fullName: 'Administrator'
      }
    }));
    return;
  }
  
  // Handle GET /dashboard/statistics
  if (req.method === 'GET' && req.url === '/dashboard/statistics') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalSales: 150000,
      totalCustomers: 45,
      pendingApprovals: 5,
      recentTransactions: 12
    }));
    return;
  }
  
  // Health check
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'Temporary backend server running' 
    }));
    return;
  }
  
  // Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✓ Temporary backend server running on http://localhost:${PORT}`);
  console.log(`✓ Frontend can now connect and test login`);
  console.log(`\nTest credentials:`);
  console.log(`  Username: admin`);
  console.log(`  Password: Admin123!`);
  console.log(`\nPress Ctrl+C to stop`);
});
