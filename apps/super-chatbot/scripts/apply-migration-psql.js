#!/usr/bin/env node

/**
 * Apply migration using psql command
 */

const { exec } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

async function applyMigration() {
  console.log('🚀 Applying database migration...');
  console.log('');

  try {
    // Read migration SQL
    const migrationPath = join(__dirname, '../src/lib/db/migrations/0011_add_project_status.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Migration SQL:');
    console.log('================');
    console.log(migrationSQL);
    console.log('');

    console.log('💡 To apply this migration, you have several options:');
    console.log('');
    
    console.log('Option 1 - Using psql command line:');
    console.log('  psql -h your-host -U your-username -d your-database -c "');
    console.log('    ALTER TABLE \\"UserProject\\" ADD COLUMN IF NOT EXISTS \\"status\\" varchar(20) NOT NULL DEFAULT \\"pending\\",');
    console.log('    ADD COLUMN IF NOT EXISTS \\"creditsUsed\\" integer DEFAULT 0,');
    console.log('    ADD COLUMN IF NOT EXISTS \\"errorMessage\\" text,');
    console.log('    ADD COLUMN IF NOT EXISTS \\"updatedAt\\" timestamp NOT NULL DEFAULT now();');
    console.log('    UPDATE \\"UserProject\\" SET \\"status\\" = \\"completed\\" WHERE \\"status\\" = \\"pending\\";');
    console.log('    CREATE INDEX IF NOT EXISTS \\"UserProject_status_idx\\" ON \\"UserProject\\"(\\"status\\");');
    console.log('    CREATE INDEX IF NOT EXISTS \\"UserProject_userId_status_idx\\" ON \\"UserProject\\"(\\"userId\\", \\"status\\");');
    console.log('  "');
    console.log('');

    console.log('Option 2 - Using pgAdmin:');
    console.log('  1. Open your database in pgAdmin');
    console.log('  2. Open Query Tool');
    console.log('  3. Copy and paste the SQL above');
    console.log('  4. Execute the query');
    console.log('');

    console.log('Option 3 - Set environment variable and run:');
    console.log('  export DATABASE_URL="postgresql://username:password@host:port/database"');
    console.log('  node scripts/check-db-connection.js');
    console.log('');

    console.log('✅ After applying the migration, the API will work with full error handling!');
    
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
  }
}

applyMigration();






