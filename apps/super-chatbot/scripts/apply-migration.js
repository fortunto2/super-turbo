const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function applyMigration() {
  try {
    // Попробуем разные варианты переменных окружения
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('❌ No database URL found in environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('POSTGRES')));
      return;
    }

    console.log('🔍 Connecting to database...');
    const client = postgres(databaseUrl, { ssl: 'require' });
    
    console.log('📝 Applying migration for UserProject table...');
    
    // Создаем таблицу UserProject
    await client`
      CREATE TABLE IF NOT EXISTS "UserProject" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "userId" uuid NOT NULL,
        "projectId" text NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now()
      );
    `;
    
    console.log('✅ Table UserProject created/verified');
    
    // Добавляем внешний ключ (если не существует)
    try {
      await client`
        ALTER TABLE "UserProject"
        ADD CONSTRAINT "UserProject_userId_User_id_fk" 
        FOREIGN KEY ("userId") REFERENCES "public"."User"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION;
      `;
      console.log('✅ Foreign key constraint added');
    } catch (error) {
      if (error.message.includes('duplicate_object') || error.message.includes('already exists')) {
        console.log('ℹ️ Foreign key constraint already exists');
      } else {
        console.warn('⚠️ Could not add foreign key constraint:', error.message);
      }
    }
    
    // Создаем индексы
    try {
      await client`CREATE INDEX IF NOT EXISTS "UserProject_userId_idx" ON "UserProject"("userId");`;
      await client`CREATE INDEX IF NOT EXISTS "UserProject_projectId_idx" ON "UserProject"("projectId");`;
      console.log('✅ Indexes created/verified');
    } catch (error) {
      console.warn('⚠️ Could not create indexes:', error.message);
    }
    
    // Проверяем результат
    const result = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'UserProject'
      );
    `;
    
    if (result[0].exists) {
      console.log('🎉 Migration completed successfully!');
      
      // Показываем структуру таблицы
      const columns = await client`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'UserProject'
        ORDER BY ordinal_position;
      `;
      
      console.log('📋 Final table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
  }
}

applyMigration();
