# Исправление логики сохранения проектов при ошибках Prefect

## Проблема

При ошибках в Prefect пайплайнах пользователи теряли кредиты, а проекты оставались "мертвыми" в базе данных.

## Что исправлено

### 1. Добавлены статусы проектов

- `pending` - Проект создан, ожидает обработки
- `processing` - Prefect пайплайн запущен
- `completed` - Проект успешно завершен
- `failed` - Проект завершился с ошибкой

### 2. Обновлена схема базы данных

```sql
ALTER TABLE "UserProject"
ADD COLUMN "status" varchar(20) NOT NULL DEFAULT 'pending',
ADD COLUMN "creditsUsed" integer DEFAULT 0,
ADD COLUMN "errorMessage" text,
ADD COLUMN "updatedAt" timestamp NOT NULL DEFAULT now();
```

### 3. Исправлена логика создания проекта

**Было:**

1. Создать проект в SuperDuperAI
2. Сохранить в БД
3. **Списать баланс** ❌
4. Prefect падает → пользователь теряет кредиты

**Стало:**

1. Создать проект в SuperDuperAI
2. Сохранить в БД (status: pending)
3. Обновить статус (processing)
4. **Списать баланс** ✅
5. При ошибке Prefect → автоматический откат и возврат кредитов

### 4. Добавлен механизм отката

- Автоматическое обновление статуса на `failed`
- Возврат кредитов пользователю
- Логирование ошибок
- Сохранение сообщения об ошибке

## Новые файлы

- `src/lib/db/project-queries.ts` - Функции для работы с проектами
- `src/lib/utils/project-error-handler.ts` - Обработка ошибок и откат
- `src/app/api/story-editor/project/status/route.ts` - API обновления статуса
- `src/app/api/user/projects/route.ts` - API истории проектов
- `src/lib/db/migrations/0011_add_project_status.sql` - Миграция БД

## API Endpoints

### Создание проекта

```
POST /api/story-editor/generate
```

### Обновление статуса (для Prefect)

```
POST /api/story-editor/project/status
{
  "projectId": "uuid",
  "status": "completed" | "failed",
  "errorMessage": "optional error message"
}
```

### История проектов

```
GET /api/user/projects?status=completed&includeStats=true
```

## Интеграция с Prefect

Prefect пайплайны должны вызывать API обновления статуса:

```python
# При успешном завершении
requests.post(f"{API_BASE}/api/story-editor/project/status", json={
    "projectId": project_id,
    "status": "completed"
})

# При ошибке
requests.post(f"{API_BASE}/api/story-editor/project/status", json={
    "projectId": project_id,
    "status": "failed",
    "errorMessage": str(error)
})
```

## Результат

✅ Пользователи больше не теряют кредиты при ошибках Prefect
✅ Четкий статус каждого проекта
✅ Автоматический откат при ошибках
✅ Полное логирование всех операций
✅ История всех проектов пользователя

## Следующие шаги

1. Применить миграцию базы данных
2. Обновить Prefect пайплайны для вызова API статуса
3. Протестировать новую логику
4. Добавить мониторинг ошибок



