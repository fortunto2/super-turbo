# Инструкция по применению миграции базы данных

## Проблема

Нужно применить миграцию для добавления полей статуса в таблицу UserProject.

## Решение

### Вариант 1: Через переменные окружения (рекомендуется)

1. **Создайте файл `.env` в папке `apps/super-chatbot/`**:

```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
```

2. **Запустите миграцию**:

```bash
cd apps/super-chatbot
node scripts/run-migration.js
```

### Вариант 2: Вручную через SQL

Выполните следующие SQL команды в вашей PostgreSQL базе данных:

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

### Вариант 3: Через Drizzle (если есть DATABASE_URL)

```bash
cd apps/super-chatbot
npx drizzle-kit push
```

## Проверка

После применения миграции проверьте, что таблица обновилась:

```sql
\d "UserProject"
```

Должны появиться новые колонки:

- `status` (varchar(20), default: 'pending')
- `creditsUsed` (integer, default: 0)
- `errorMessage` (text)
- `updatedAt` (timestamp, default: now())

## Что изменилось

1. **Добавлены статусы проектов**: pending, processing, completed, failed
2. **Отслеживание кредитов**: сколько кредитов использовал проект
3. **Обработка ошибок**: сохранение сообщений об ошибках
4. **Временные метки**: когда проект был обновлен
5. **Индексы**: для быстрого поиска по статусу

## После миграции

Система будет:

- ✅ Автоматически возвращать кредиты при ошибках Prefect
- ✅ Отслеживать статус каждого проекта
- ✅ Логировать все ошибки
- ✅ Предоставлять историю проектов пользователя
