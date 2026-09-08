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
    
    const result = await client.query('UPDATE customers SET "isActive" = true WHERE "isActive" = false');
    console.log(`Reactivated ${result.rowCount} customers`);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
