const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

// Check the most recently created customer
pool.query(`
  SELECT id, name, "isActive", "createdAt" FROM customers 
  ORDER BY id DESC LIMIT 1
`, (err, res) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    const customer = res.rows[0];
    console.log('Most recent customer:');
    console.log(`  ID: ${customer.id}`);
    console.log(`  Name: ${customer.name}`);
    console.log(`  isActive: ${customer.isActive} (${customer.isActive ? '✅' : '❌'})`);
    console.log(`  Created: ${customer.createdAt}`);
    pool.end();
    process.exit(0);
  }
});
