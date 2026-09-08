const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'alem_crm'
});

// Check the isActive column definition
pool.query(`
  SELECT column_name, data_type, column_default, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'customers' AND column_name = 'isActive'
`, (err, res) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    console.log('isActive Column Definition:');
    if (res.rows.length > 0) {
      const col = res.rows[0];
      console.log(`  Column Name: ${col.column_name}`);
      console.log(`  Data Type: ${col.data_type}`);
      console.log(`  Default Value: ${col.column_default || '(none)'}`);
      console.log(`  Nullable: ${col.is_nullable}`);
    } else {
      console.log('  Column not found!');
    }
    
    pool.end();
    process.exit(0);
  }
});
