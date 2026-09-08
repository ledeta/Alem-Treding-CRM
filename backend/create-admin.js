// Create Admin User Script
// Run with: node create-admin.js

const argon2 = require('argon2');
const { Client } = require('pg');

async function createAdmin() {
  console.log('🔐 Creating admin user...');
  
  // Hash the password
  const password = 'Admin123!';
  const passwordHash = await argon2.hash(password);
  
  console.log('✅ Password hashed');
  
  // Connect to database
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'alem_crm',
    user: 'postgres',
    password: 'postgres',
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Get Admin role ID
    const roleResult = await client.query("SELECT id FROM roles WHERE name = 'Admin'");
    if (roleResult.rows.length === 0) {
      throw new Error('Admin role not found!');
    }
    const roleId = roleResult.rows[0].id;
    console.log(`✅ Admin role ID: ${roleId}`);
    
    // Insert admin user
    const insertQuery = `
      INSERT INTO users (username, email, "fullName", phone, "passwordHash", "roleId", status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (username) DO UPDATE SET
        "passwordHash" = $5,
        "updatedAt" = NOW()
      RETURNING id, username, email;
    `;
    
    const result = await client.query(insertQuery, [
      'admin',
      'admin@alemcrm.com',
      'System Administrator',
      '+251911234567',
      passwordHash,
      roleId,
      'Active'
    ]);
    
    console.log('✅ Admin user created/updated:');
    console.log(result.rows[0]);
    console.log('\n🎉 SUCCESS! You can now login with:');
    console.log('   Username: admin');
    console.log('   Password: Admin123!');
    console.log('\n🌐 Frontend: http://localhost:3002');
    console.log('🌐 Backend:  http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdmin();
