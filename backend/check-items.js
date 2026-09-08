const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

pool.query('SELECT id, name, source, "createdAt" FROM customers ORDER BY "createdAt" DESC LIMIT 15', (err, res) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    console.log('Recent customers:');
    res.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.name.substring(0, 40)} (Source: ${row.source})`);
    });
    
    // Check for items vs actual customers
    pool.query(`SELECT COUNT(*) as product_like FROM customers WHERE name LIKE '%SM%' OR name LIKE '%HW%' OR name LIKE '%VIVO%'`, (err2, res2) => {
      if (!err2) {
        console.log(`\nProduct-like names: ${res2.rows[0].product_like}`);
      }
      pool.end();
      process.exit(0);
    });
  }
});
