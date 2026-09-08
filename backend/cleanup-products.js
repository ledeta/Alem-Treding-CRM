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
    console.log('Connected to database');
    
    // Delete everything that looks like a product
    const result = await client.query(`
      UPDATE customers SET "isActive" = false
      WHERE name ~ '^(INFINX|TECNO|SM|INF|OPP|HW|SAMSUNG|HUAWEI|OPPO|REALME|IPHONE|NOKIA|SONY|ASUS|ZTE|HONOR|POCO|XIAOMI|VIVO|ONEPLUS|Google|PIXEL|Date|100)'
        OR LOWER(name) LIKE '%uk%'
        OR LOWER(name) LIKE '%camon%'
        OR LOWER(name) LIKE '%smart%'
        OR LOWER(name) LIKE '%crown%'
        OR LOWER(name) LIKE '%metoo%'
        OR LOWER(name) LIKE '%ci6%'
        OR name ~ '[0-9]{2,}'  -- Two or more consecutive digits (product codes)
        OR name = 'Customer'
        OR name = 'Items'
    `);
    
    console.log(`✅ Deactivated ${result.rowCount} product entries`);
    
    // Show remaining active customers
    const remaining = await client.query('SELECT COUNT(*) as count FROM customers WHERE "isActive" = true');
    console.log(`📊 Remaining active customers: ${remaining.rows[0].count}`);
    
    const sample = await client.query('SELECT name FROM customers WHERE "isActive" = true LIMIT 15 ORDER BY id');
    console.log('\n✅ Remaining customer names:');
    sample.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.name}`);
    });
    
    await client.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
