# 🚨 СРОЧНО: Применить миграцию базы данных

## Статус

✅ **API логика восстановлена** - теперь с полной обработкой ошибок Prefect  
⏳ **Миграция БД ожидает применения** - API покажет ошибку до применения

## Что нужно сделать

### 1. Применить SQL миграцию в PostgreSQL

Выполните эти команды в вашей PostgreSQL базе данных:

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

### 2. Способы применения

**Вариант A - psql командная строка:**

```bash
psql -h your-host -U your-username -d your-database -f src/lib/db/migrations/0011_add_project_status.sql
```

**Вариант B - pgAdmin GUI:**

1. Откройте базу данных в pgAdmin
2. Откройте Query Tool
3. Скопируйте и вставьте SQL выше
4. Выполните запрос

**Вариант C - Через переменную окружения:**

```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
node scripts/check-db-connection.js
```

## Что изменилось в API

### До миграции (текущее состояние):

- ❌ API работает с временной логикой
- ❌ Нет отслеживания статуса проектов
- ❌ Нет возврата кредитов при ошибках Prefect

### После миграции:

- ✅ Полное отслеживание статуса проектов (`pending` → `processing` → `completed`/`failed`)
- ✅ Автоматический возврат кредитов при ошибках Prefect
- ✅ Детальное логирование ошибок
- ✅ API эндпоинт для обновления статуса от Prefect

## Тестирование

После применения миграции:

1. **Создайте тестовый проект** через Story Editor
2. **Проверьте статус** в базе данных:
   ```sql
   SELECT "projectId", "status", "creditsUsed", "errorMessage"
   FROM "UserProject"
   ORDER BY "createdAt" DESC
   LIMIT 5;
   ```
3. **Проверьте обработку ошибок** - если Prefect вернет ошибку, кредиты должны вернуться

## Важно!

- **Миграция безопасна** - использует `IF NOT EXISTS` и `DEFAULT` значения
- **Существующие проекты** получат статус `completed`
- **API готов** к работе сразу после миграции
- **Обратная совместимость** сохранена

---

**После применения миграции API будет полностью функционален с обработкой ошибок Prefect! 🎉**



