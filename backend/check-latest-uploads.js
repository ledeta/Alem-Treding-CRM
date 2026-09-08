const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

// Check most recent customers (last 10)
pool.query(`
  SELECT id, name, "isActive", source, "createdAt" 
  FROM customers 
  ORDER BY "createdAt" DESC 
  LIMIT 10
`, (err, res) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    console.log('Recent 10 customers:');
    console.log('CreatedAt | isActive | ID  | Name');
    console.log('----------|----------|-----|------');
    res.rows.forEach(row => {
      const active = row.isActive ? '✅' : '❌';
      const date = new Date(row.createdAt).toLocaleString();
      const name = row.name.substring(0, 25);
      console.log(`${date} | ${active}      | ${row.id.toString().padEnd(3)} | ${name}`);
    });
    
    // Summary
    pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN "isActive" = true THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN "isActive" = false THEN 1 ELSE 0 END) as inactive_count,
        COUNT(DISTINCT "createdAt"::date) as days_with_uploads
      FROM customers
    `, (err2, res2) => {
      if (!err2) {
        const row = res2.rows[0];
        console.log(`\n📊 Summary:`);
        console.log(`  Total: ${row.total}`);
        console.log(`  Active (✅): ${row.active_count}`);
        console.log(`  Inactive (❌): ${row.inactive_count}`);
      }
      pool.end();
      process.exit(0);
    });
  }
});
