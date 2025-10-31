#!/usr/bin/env node

/**
 * Apply database migration manually
 * This script applies the project status migration
 */

const { readFileSync } = require('node:fs');
const { join } = require('node:path');

async function applyMigration() {
  try {
    console.log('🔄 Applying project status migration...');

    // Read the migration file
    const migrationPath = join(
      __dirname,
      '../src/lib/db/migrations/0011_add_project_status.sql',
    );
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL:');
    console.log(migrationSQL);

    console.log('✅ Migration file read successfully');
    console.log(
      '💡 To apply this migration, run the SQL commands in your database:',
    );
    console.log('   1. Connect to your PostgreSQL database');
    console.log('   2. Execute the SQL commands above');
    console.log('   3. Or use your preferred database management tool');
  } catch (error) {
    console.error('❌ Error reading migration file:', error);
    process.exit(1);
  }
}

applyMigration();
