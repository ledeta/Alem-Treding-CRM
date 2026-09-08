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

pool.query(`
  SELECT id, name, "isActive" FROM customers 
  WHERE name IN (${names})
  ORDER BY name
`, (err, res) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    console.log(`Found ${res.rows.length} real customers:`);
    res.rows.forEach(row => {
      const active = row.isActive ? '✅' : '❌';
      console.log(`${active} ${row.name}`);
    });
    
    pool.end();
    process.exit(0);
  }
});
