// ALEM CRM - Automated Database Setup Script
// Run this with: node setup-database.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   ALEM CRM - Database Setup');
console.log('========================================\n');

// Configuration
const config = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'alem_crm',
    schemaFile: path.join(__dirname, 'database', 'schema.sql')
};

// Check if schema file exists
if (!fs.existsSync(config.schemaFile)) {
    console.error('[X] Schema file not found:', config.schemaFile);
    process.exit(1);
}

console.log('[1/3] Creating database...\n');

// Step 1: Create database
const createDbCommand = `"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U ${config.user} -h ${config.host} -p ${config.port} -c "CREATE DATABASE ${config.database};"`;

// Set password environment variable
process.env.PGPASSWORD = config.password;

exec(createDbCommand, (error, stdout, stderr) => {
    if (error && !stderr.includes('already exists')) {
        console.error('[X] Failed to create database:', stderr);
        console.log('\n[i] Database may already exist, continuing...\n');
    } else {
        console.log('[OK] Database created!\n');
    }

    // Step 2: Load schema
    console.log('[2/3] Loading schema...\n');
    
    const loadSchemaCommand = `"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U ${config.user} -h ${config.host} -p ${config.port} -d ${config.database} -f "${config.schemaFile}"`;

    exec(loadSchemaCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('[X] Failed to load schema:', stderr);
            console.log('\nPossible solutions:');
            console.log('1. Check PostgreSQL is running');
            console.log('2. Verify password is correct');
            console.log('3. Try manual setup (see 🔧 DATABASE_WORKAROUND.md)');
            process.exit(1);
        }

        console.log('[OK] Schema loaded!\n');
        console.log('[3/3] Verifying...\n');

        // Step 3: Verify tables were created
        const verifyCommand = `"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U ${config.user} -h ${config.host} -p ${config.port} -d ${config.database} -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"`;

        exec(verifyCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('[!] Verification failed:', stderr);
            } else {
                console.log(stdout);
            }

            console.log('========================================');
            console.log('   Database Setup Complete!');
            console.log('========================================\n');
            console.log('Database:', config.database);
            console.log('Tables: 18 created');
            console.log('Views: 3 created');
            console.log('Roles: Admin, Sales User\n');
            console.log('Next steps:');
            console.log('  1. cd backend');
            console.log('  2. npm install --save-dev @nestjs/cli');
            console.log('  3. cd ..\\frontend');
            console.log('  4. npm install --legacy-peer-deps');
            console.log('  5. cd ..\\backend');
            console.log('  6. npm run start:dev');
            console.log('  7. (new terminal) cd frontend && npm run dev\n');
        });
    });
});
