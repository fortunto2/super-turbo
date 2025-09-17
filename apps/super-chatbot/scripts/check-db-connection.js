#!/usr/bin/env node

/**
 * Check database connection and apply migration manually
 */

const { readFileSync } = require('fs');
const { join } = require('path');

async function checkAndMigrate() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Check environment variables
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      console.log('❌ No DATABASE_URL or POSTGRES_URL found');
      console.log('💡 Please set one of these environment variables:');
      console.log('   export DATABASE_URL="postgresql://username:password@host:port/database"');
      console.log('   or');
      console.log('   export POSTGRES_URL="postgresql://username:password@host:port/database"');
      console.log('');
      console.log('📄 Then run this script again');
      return;
    }
    
    console.log('✅ Database URL found');
    console.log('🔗 Attempting to connect...');
    
    // Try to import postgres
    let postgres;
    try {
      postgres = require('postgres');
    } catch (error) {
      console.log('❌ postgres package not found. Installing...');
      console.log('Run: npm install postgres');
      return;
    }
    
    const sql = postgres(databaseUrl, { ssl: 'require' });
    
    // Test connection
    try {
      await sql`SELECT 1 as test`;
      console.log('✅ Database connection successful');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      await sql.end();
      return;
    }
    
    // Check if UserProject table exists
    try {
      const result = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'UserProject' 
        ORDER BY ordinal_position
      `;
      
      console.log('📊 Current UserProject table structure:');
      result.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
      
      // Check if status column exists
      const hasStatus = result.some(row => row.column_name === 'status');
      
      if (hasStatus) {
        console.log('✅ Migration already applied - status column exists');
      } else {
        console.log('🔄 Applying migration...');
        
        // Read migration SQL
        const migrationPath = join(__dirname, '../src/lib/db/migrations/0011_add_project_status.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf8');
        
        // Split and execute SQL statements
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        for (const statement of statements) {
          if (statement.trim()) {
            console.log(`🔧 Executing: ${statement.substring(0, 50)}...`);
            await sql.unsafe(statement);
          }
        }
        
        console.log('✅ Migration completed successfully!');
      }
      
    } catch (error) {
      console.log('❌ Error checking/updating table:', error.message);
    }
    
    await sql.end();
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

checkAndMigrate();






