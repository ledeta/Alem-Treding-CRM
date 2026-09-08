// Create Sales User Script
// Run with: node create-sales-users.js

const argon2 = require('argon2');
const { Client } = require('pg');

async function createSalesUsers() {
  console.log('👤 Creating sales user accounts...\n');
  
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'alem_crm',
    user: 'postgres',
    password: 'postgres',
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Get Sales User role ID
    const roleResult = await client.query("SELECT id FROM roles WHERE name = 'Sales User'");
    if (roleResult.rows.length === 0) {
      console.error('❌ Sales User role not found!');
      console.log('Creating Sales User role...');
      
      // Create Sales User role if it doesn't exist
      await client.query(`
        INSERT INTO roles (name, description, "createdAt", "updatedAt")
        VALUES ('Sales User', 'Limited access for sales representatives', NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `);
      console.log('✅ Sales User role created');
    }
    
    const roleId = (await client.query("SELECT id FROM roles WHERE name = 'Sales User'")).rows[0].id;
    console.log(`✅ Sales User role ID: ${roleId}\n`);
    
    // Sales user accounts to create
    const salesUsers = [
      {
        username: 'salesman',
        email: 'sales@alem-trading.com',
        fullName: 'Sales Representative',
        phone: '+251922000000',
        password: 'Sales123!'
      },
      {
        username: 'agent01',
        email: 'agent01@alem-trading.com',
        fullName: 'John Doe',
        phone: '+251933000000',
        password: 'Agent@2024!'
      },
      {
        username: 'agent02',
        email: 'agent02@alem-trading.com',
        fullName: 'Jane Smith',
        phone: '+251944000000',
        password: 'Agent@2024!'
      }
    ];
    
    // Create each sales user
    for (const user of salesUsers) {
      const passwordHash = await argon2.hash(user.password);
      
      const insertQuery = `
        INSERT INTO users (username, email, "fullName", phone, "passwordHash", "roleId", status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (username) DO UPDATE SET
          "passwordHash" = $5,
          email = $2,
          "fullName" = $3,
          phone = $4,
          "updatedAt" = NOW()
        RETURNING id, username, email;
      `;
      
      const result = await client.query(insertQuery, [
        user.username,
        user.email,
        user.fullName,
        user.phone,
        passwordHash,
        roleId,
        'Active'
      ]);
      
      console.log(`✅ User created/updated: ${result.rows[0].username}`);
      console.log(`   Email: ${result.rows[0].email}\n`);
    }
    
    console.log('🎉 SUCCESS! All sales users created!\n');
    console.log('📋 YOU CAN NOW LOGIN WITH:\n');
    console.log('═══════════════════════════════════════════');
    console.log('👤 SALES USER #1:');
    console.log('   Username: salesman');
    console.log('   Password: Sales123!');
    console.log('─────────────────────────────────────────────');
    console.log('👤 SALES USER #2:');
    console.log('   Username: agent01');
    console.log('   Password: Agent@2024!');
    console.log('─────────────────────────────────────────────');
    console.log('👤 SALES USER #3:');
    console.log('   Username: agent02');
    console.log('   Password: Agent@2024!');
    console.log('═══════════════════════════════════════════\n');
    console.log('🌐 Login at: http://localhost:3000/login\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

createSalesUsers();
