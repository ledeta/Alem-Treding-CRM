const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

console.log('🔧 Force reactivating ALL customers...');

pool.query('UPDATE customers SET "isActive" = true', (err, res) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } else {
    console.log(`✅ Updated ${res.rowCount} customers to isActive=true`);
    
    // Verify
    pool.query('SELECT COUNT(*) as active FROM customers WHERE "isActive" = true', (err2, res2) => {
      if (!err2) {
        console.log(`✅ Active count: ${res2.rows[0].active}`);
      }
      
      // Show sample
      pool.query('SELECT id, name, "isActive" FROM customers LIMIT 5', (err3, res3) => {
        if (!err3) {
          console.log('\nSample:');
          res3.rows.forEach(r => {
            console.log(`  ${r.id}: ${r.name.substring(0, 30)} (${r.isActive ? '✅' : '❌'})`);
          });
        }
        pool.end();
        process.exit(0);
      });
    });
  }
});
