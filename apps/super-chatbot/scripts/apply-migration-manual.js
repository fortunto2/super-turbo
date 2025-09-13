#!/usr/bin/env node

/**
 * Manual migration application script
 * This script will show you the exact SQL commands to run
 */

const { readFileSync } = require('fs');
const { join } = require('path');

console.log('🚀 Manual Migration Application');
console.log('================================');
console.log('');

console.log('📋 SQL Commands to execute in your PostgreSQL database:');
console.log('');

try {
  const migrationPath = join(__dirname, '../src/lib/db/migrations/0011_add_project_status.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf8');
  
  console.log(migrationSQL);
  
  console.log('');
  console.log('🔧 How to apply:');
  console.log('');
  console.log('Option 1 - Using psql command line:');
  console.log('  psql -h your-host -U your-username -d your-database -f src/lib/db/migrations/0011_add_project_status.sql');
  console.log('');
  console.log('Option 2 - Using pgAdmin or other GUI:');
  console.log('  1. Open your database in pgAdmin');
  console.log('  2. Open Query Tool');
  console.log('  3. Copy and paste the SQL above');
  console.log('  4. Execute the query');
  console.log('');
  console.log('Option 3 - Using connection string:');
  console.log('  Set DATABASE_URL environment variable and run:');
  console.log('  node scripts/check-db-connection.js');
  console.log('');
  console.log('✅ After applying the migration, the API will work with full error handling!');
  
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
}


