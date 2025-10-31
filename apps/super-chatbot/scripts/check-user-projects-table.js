const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function checkUserProjectsTable() {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found in environment variables');
      return;
    }

    console.log('🔍 Checking database connection...');
    const client = postgres(databaseUrl, { ssl: 'require' });
    const db = drizzle(client);

    // Проверяем существование таблицы
    const result = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'UserProject'
      );
    `;

    if (result[0].exists) {
      console.log('✅ Table UserProject exists');

      // Проверяем структуру таблицы
      const columns = await client`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'UserProject'
        ORDER BY ordinal_position;
      `;

      console.log('📋 Table structure:');
      columns.forEach((col) => {
        console.log(
          `  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`,
        );
      });

      // Проверяем количество записей
      const count = await client`
        SELECT COUNT(*) as count FROM "UserProject";
      `;
      console.log(`📊 Total records: ${count[0].count}`);
    } else {
      console.log('❌ Table UserProject does not exist');
      console.log('💡 You need to run the migration first');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkUserProjectsTable();
