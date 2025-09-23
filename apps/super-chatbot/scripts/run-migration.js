#!/usr/bin/env node

/**
 * Run database migration directly
 */

const { readFileSync } = require('node:fs');
const { join } = require('node:path');

async function runMigration() {
  try {
    console.log('🔄 Running project status migration...');
    
    // Check if we have database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      console.log('❌ No DATABASE_URL or POSTGRES_URL found in environment variables');
      console.log('💡 Please set one of these environment variables:');
      console.log('   - DATABASE_URL=postgresql://user:password@host:port/database');
      console.log('   - POSTGRES_URL=postgresql://user:password@host:port/database');
      console.log('');
      console.log('📄 Or manually run this SQL in your database:');
      
      const migrationPath = join(__dirname, '../src/lib/db/migrations/0011_add_project_status.sql');
      const migrationSQL = readFileSync(migrationPath, 'utf8');
      console.log(migrationSQL);
      
      return;
    }
    
    console.log('✅ Database URL found');
    console.log('🔗 Connecting to database...');
    
    // Import postgres dynamically
    const postgres = require('postgres');
    const sql = postgres(databaseUrl, { ssl: 'require' });
    
    // Read migration SQL
    const migrationPath = join(__dirname, '../src/lib/db/migrations/0011_add_project_status.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Executing migration SQL...');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`🔧 Executing: ${statement.substring(0, 50)}...`);
        await sql.unsafe(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 New columns added to UserProject table:');
    console.log('   - status (varchar(20), default: pending)');
    console.log('   - creditsUsed (integer, default: 0)');
    console.log('   - errorMessage (text)');
    console.log('   - updatedAt (timestamp, default: now())');
    console.log('   - Indexes created for faster lookups');
    
    await sql.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('relation "UserProject" does not exist')) {
      console.log('💡 The UserProject table does not exist yet.');
      console.log('   Please run the initial migrations first.');
    }
    
    process.exit(1);
  }
}

runMigration();






