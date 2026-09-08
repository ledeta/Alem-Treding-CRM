const pg = require('pg');

const client = new pg.Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

// List of product brands and system keywords to deactivate
const invalidPatterns = [
  'Date',
  'INFINX',
  'TECNO',
  'Samsung',
  'Huawei',
  'OPPO',
  'Realme',
  'iPhone',
  'Nokia',
  'HTC',
  'LG',
  'Motorola',
  'Sony',
  'ASUS',
  'ZTE',
  'Honor',
  'Poco',
  'Xiaomi',
  'Vivo',
  'OnePlus',
  'Google',
  'Pixel',
  'SM A',
  'SM M',
  'SM 0',
  'INF0',
  'OPP0',
  'HW Y',
  '%uk',
  '%Camon%',
  '%smart%',
  '%crown%',
  '%metoo%',
  '%100%'
];

async function main() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    let deactivatedCount = 0;
    
    for (const pattern of invalidPatterns) {
      const result = await client.query(
        'UPDATE customers SET "isActive" = false WHERE name ILIKE $1 AND "isActive" = true',
        [pattern]
      );
      if (result.rowCount > 0) {
        console.log(`Deactivated ${result.rowCount} customers matching "${pattern}"`);
        deactivatedCount += result.rowCount;
      }
    }
    
    console.log(`\n✅ Total deactivated: ${deactivatedCount} invalid entries`);
    
    // Check remaining active customers
    const remaining = await client.query('SELECT COUNT(*) as count FROM customers WHERE "isActive" = true');
    console.log(`📊 Remaining active customers: ${remaining.rows[0].count}`);
    
    // Show first 5 active customers
    const sample = await client.query('SELECT id, name FROM customers WHERE "isActive" = true LIMIT 5');
    console.log('\n✅ Sample of remaining customers:');
    sample.rows.forEach(row => {
      console.log(`  - ${row.name}`);
    });
    
    await client.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
