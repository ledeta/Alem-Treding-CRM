// List all users in database
const { Client } = require('pg');

async function listUsers() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'alem_crm',
    user: 'postgres',
    password: 'postgres',
  });
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u."fullName", 
        r.name as role, 
        u.status,
        u."createdAt"
      FROM users u 
      LEFT JOIN roles r ON u."roleId" = r.id 
      ORDER BY u.id
    `);
    
    console.log('\n📋 EXISTING USERS IN DATABASE:\n');
    console.log('════════════════════════════════════════════════════════════════');
    
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Full Name: ${user.fullname}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.status}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('────────────────────────────────────────────────────────────────');
    });
    
    console.log(`\nTotal Users: ${result.rows.length}\n`);
    
    // Show credentials info
    console.log('\n🔐 DEFAULT CREDENTIALS (from setup scripts):\n');
    console.log('ADMIN:');
    console.log('  Username: admin');
    console.log('  Password: Admin123!');
    console.log('\nSALES USERS:');
    console.log('  Username: salesman   | Password: Sales123!');
    console.log('  Username: agent01    | Password: Agent@2024!');
    console.log('  Username: agent02    | Password: Agent@2024!');
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

listUsers();
