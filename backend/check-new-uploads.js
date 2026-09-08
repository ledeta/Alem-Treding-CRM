const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

// Check recent customers (last 40)
pool.query(`
  SELECT id, name, "isActive", source, "createdAt" 
  FROM customers 
  ORDER BY "createdAt" DESC 
  LIMIT 40
`, (err, res) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    console.log('Recent 40 customers:');
    console.log('Active | ID  | Name | Source');
    console.log('-------|-----|------|--------');
    res.rows.forEach(row => {
      const active = row.isActive ? '✅' : '❌';
      const name = row.name.substring(0, 30);
      console.log(`${active}    | ${row.id.toString().padEnd(3)} | ${name.padEnd(30)} | ${row.source || 'Manual'}`);
    });
    
    // Summary
    pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN "isActive" = true THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN "isActive" = false THEN 1 ELSE 0 END) as inactive_count
      FROM customers
    `, (err2, res2) => {
      if (!err2) {
        const row = res2.rows[0];
        console.log(`\n📊 Summary:`);
        console.log(`  Total: ${row.total}`);
        console.log(`  Active (isActive=true): ${row.active_count}`);
        console.log(`  Inactive (isActive=false): ${row.inactive_count}`);
      }
      pool.end();
      process.exit(0);
    });
  }
});
