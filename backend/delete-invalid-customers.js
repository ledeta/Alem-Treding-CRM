const pg = require('pg');

const client = new pg.Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

// List of product brands and system keywords to delete
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
  'Customer',
  'Items',
  'Products',
  'Item Name',
  'Product Name'
];

async function main() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Build the delete query
    let deletedCount = 0;
    
    for (const pattern of invalidPatterns) {
      const result = await client.query(
        'DELETE FROM customers WHERE name ILIKE $1',
        [`%${pattern}%`]
      );
      if (result.rowCount > 0) {
        console.log(`Deleted ${result.rowCount} customers matching "${pattern}"`);
        deletedCount += result.rowCount;
      }
    }
    
    console.log(`\n✅ Total deleted: ${deletedCount} invalid entries`);
    
    // Check remaining customers
    const remaining = await client.query('SELECT COUNT(*) as count FROM customers');
    console.log(`📊 Remaining customers: ${remaining.rows[0].count}`);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
