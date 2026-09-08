const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

// These are product model numbers and patterns to filter out
const productPatterns = [
  'SM%', 'SM _%',          // Samsung models (SM A07, SM J8, etc)
  'VIVO%',                 // VIVO phones
  'OPPO%',                 // OPPO phones
  'TECNO%',                // TECNO phones
  'itel%',                 // itel phones
  'INFINX%',               // INFINX phones
  'HW%',                   // Huawei
  '%HONOR%',               // Honor phones
  '%incell%',              // Phone display types
  '%4G%',                  // Phone specs
  '%oled%',                // Phone display specs
  '100%',                  // Percentage values
];

let whereClause = productPatterns.map(p => `name LIKE '${p}'`).join(' OR ');

const deactivateQuery = `UPDATE customers SET "isActive" = false WHERE (${whereClause}) AND "isActive" = true RETURNING id, name`;

console.log('Removing product-like names from customers...\n');

pool.query(deactivateQuery, (err, res) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } else {
    console.log(`✅ Deactivated ${res.rowCount} product entries`);
    
    if (res.rows.length > 0) {
      console.log('\nDeactivated products:');
      res.rows.slice(0, 10).forEach(row => {
        console.log(`  - ${row.name}`);
      });
      if (res.rows.length > 10) {
        console.log(`  ... and ${res.rows.length - 10} more`);
      }
    }
    
    // Verify remaining customers
    pool.query('SELECT COUNT(*) as total FROM customers WHERE "isActive" = true', (err2, res2) => {
      if (!err2) {
        console.log(`\n✅ Remaining active customers: ${res2.rows[0].total}`);
      }
      
      // Show remaining
      pool.query('SELECT id, name FROM customers WHERE "isActive" = true ORDER BY "createdAt" DESC LIMIT 10', (err3, res3) => {
        if (!err3) {
          console.log('\nRemaining customers:');
          res3.rows.forEach(row => {
            console.log(`  - ${row.name}`);
          });
        }
        pool.end();
        process.exit(0);
      });
    });
  }
});
