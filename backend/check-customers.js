const pg = require('pg');

const client = new pg.Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

async function main() {
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN "isActive" = true THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN "isActive" = false THEN 1 ELSE 0 END) as inactive
      FROM customers
    `);
    
    console.log('Database Customer Stats:');
    console.log('  Total:', result.rows[0].total);
    console.log('  Active:', result.rows[0].active);
    console.log('  Inactive:', result.rows[0].inactive);
    
    // Show first 10 active customers
    const active = await client.query('SELECT id, name, "isActive", "createdAt" FROM customers WHERE "isActive" = true ORDER BY id DESC LIMIT 10');
    console.log('\n📊 Last 10 active customers:');
    active.rows.forEach(r => {
      console.log(`  [${r.id}] ${r.name} - created: ${new Date(r.createdAt).toLocaleDateString()}`);
    });
    
    await client.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
