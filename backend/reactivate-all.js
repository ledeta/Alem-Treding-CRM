const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

const realCustomerNames = [
  'abuna skt', 'Ahmed Hassan', 'Amira Nour', 'Customer',
  'Eshet Gonder', 'Ewket Dse', 'Fatima Mohammed', 'Hassan Mahmoud',
  'husen seket', 'Karim Saleh', 'Leila Ahmed', 'Mame negele',
  'Mamush asella', 'Mehari Tuludimetu - B', 'Mohamed Ali', 'Noor Youssef',
  'Omar Khalid', 'sadik yergahile', 'Test Customer 1', 'Test Customer 2',
  'yab kidest seket*', 'Zahra Ibrahim'
];

const names = realCustomerNames.map(n => `'${n}'`).join(',');

// Only reactivate the real customers
pool.query(`UPDATE customers SET "isActive" = true WHERE name IN (${names})`, (err, res) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Reactivated ' + res.rowCount + ' real customers');
    
    // Verify
    pool.query('SELECT COUNT(*) as active_count FROM customers WHERE "isActive" = true', (err2, res2) => {
      if (err2) {
        console.error('Verification failed:', err2.message);
      } else {
        console.log('✅ Total active customers: ' + res2.rows[0].active_count);
      }
      pool.end();
      process.exit(0);
    });
  }
});
