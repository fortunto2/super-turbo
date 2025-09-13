# 🚨 СРОЧНО: НУЖНО ПРИМЕНИТЬ МИГРАЦИЮ БД

## Проблема

API падает с ошибкой:

```
Error creating user project: column "status" of relation "UserProject" does not exist
```

## Решение

**НЕМЕДЛЕННО** выполните SQL команды в вашей PostgreSQL базе данных:

```sql
-- Add status and error handling fields to UserProject table
ALTER TABLE "UserProject"
ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "creditsUsed" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "errorMessage" text,
ADD COLUMN IF NOT EXISTS "updatedAt" timestamp NOT NULL DEFAULT now();

-- Update existing projects to have 'completed' status (assuming they were successful)
UPDATE "UserProject" SET "status" = 'completed' WHERE "status" = 'pending';

-- Create index for faster status lookups
CREATE INDEX IF NOT EXISTS "UserProject_status_idx" ON "UserProject"("status");
CREATE INDEX IF NOT EXISTS "UserProject_userId_status_idx" ON "UserProject"("userId", "status");
```

## Как выполнить

### Вариант 1: Через psql

```bash
psql -h your-host -U your-username -d your-database
# Вставить SQL команды выше
```

### Вариант 2: Через pgAdmin

1. Открыть pgAdmin
2. Подключиться к базе данных
3. Открыть Query Tool
4. Выполнить SQL команды

### Вариант 3: Через .env файл

```bash
# Создать .env файл в apps/super-chatbot/
echo "DATABASE_URL=postgresql://username:password@host:port/database" > .env

# Запустить миграцию
node scripts/run-migration.js
```

## После миграции

После применения миграции нужно будет обновить API обратно на новую логику:

1. Заменить временную логику в `src/app/api/story-editor/generate/route.ts`
2. Восстановить импорты новых функций
3. Восстановить вызовы `createUserProject` и `updateProjectStatus`

## Статус

- ❌ **ТЕКУЩИЙ**: API работает с временной логикой (без статусов)
- ✅ **ПОСЛЕ МИГРАЦИИ**: API будет работать с полной логикой обработки ошибок

**ВАЖНО**: Примените миграцию как можно скорее!


