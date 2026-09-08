const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

// More comprehensive patterns (case-insensitive)
const productPatterns = [
  'SM%', 'SM _%',          // Samsung
  'VIVO%', 'vivo%',        // VIVO
  'OPPO%', 'oppo%',        // OPPO
  'TECNO%', 'tecno%',      // TECNO
  'itel%', 'ITEL%',        // itel
  'INFINX%', 'infinx%', 'INF%', 'inf%',  // INFINX
  'HW%', 'hw%',            // Huawei
  '%HONOR%', '%honor%',    // Honor
  'REDMI%', 'redmi%',      // Redmi
  'iphone%', 'IPHONE%',    // iPhone
  'poco%', 'POCO%',        // Poco
  '%incell%', '%INCELL%',  // Display type
  '%4G%', '%4g%',          // Phone specs
  '%oled%', '%OLED%',      // Display specs
  '%lite%', '%LITE%',      // Model variant
  '%pro%', '%PRO%',        // Model variant (but be careful)
  '%max%', '%MAX%',        // Model variant
  '100%',                  // Percentage
];

let whereClause = productPatterns.map(p => `name ILIKE '${p.replace(/'/g, "''")}'`).join(' OR ');

const deactivateQuery = `UPDATE customers SET "isActive" = false WHERE (${whereClause}) AND "isActive" = true RETURNING id, name`;

console.log('Deep cleaning product-like names...\n');

pool.query(deactivateQuery, (err, res) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } else {
    console.log(`✅ Deactivated ${res.rowCount} additional product entries`);
    
    if (res.rows.length > 0) {
      console.log('\nDeactivated:');
      res.rows.forEach(row => {
        console.log(`  - ${row.name}`);
      });
    }
    
    // Verify remaining customers
    pool.query('SELECT COUNT(*) as total FROM customers WHERE "isActive" = true', (err2, res2) => {
      if (!err2) {
        console.log(`\n✅ Final active customers: ${res2.rows[0].total}`);
      }
      
      // Show all remaining
      pool.query('SELECT id, name FROM customers WHERE "isActive" = true ORDER BY name', (err3, res3) => {
        if (!err3) {
          console.log('\n✅ Final Customer List:');
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
