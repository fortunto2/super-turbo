const postgres = require('postgres');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function applyMigration() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL or POSTGRES_URL not found in environment');
    process.exit(1);
  }

  console.log('🔌 Connecting to database...');
  const sql = postgres(databaseUrl, { ssl: 'require' });

  try {
    // Read migration file
    const migrationPath = path.join(
      __dirname,
      '../src/lib/db/migrations/0012_add_generated_media.sql',
    );
    const migration = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Applying migration: 0012_add_generated_media.sql');

    // Execute migration
    await sql.unsafe(migration);

    console.log('✅ Migration applied successfully!');
    console.log('📊 Table "GeneratedMedia" created with indexes');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Table already exists, skipping...');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await sql.end();
  }
}

applyMigration()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
