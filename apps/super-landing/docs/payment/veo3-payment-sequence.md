# VEO3 Payment Sequence Diagram

## Диаграмма последовательности процесса оплаты

```
User                    Frontend              Backend              Stripe              Redis               SuperDuperAI
 |                        |                     |                    |                    |                    |
 |--1. Fill Form--------->|                     |                    |                    |                    |
 |                        |                     |                    |                    |                    |
 |                        |--2. Create Checkout->|                   |                    |                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |--3. Store Session->|                    |                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |--4. Create Session->|                   |                    |
 |                        |                     |                    |                    |                    |
 |                        |<--5. Session URL----|                    |                    |                    |
 |                        |                     |                    |                    |                    |
 |--6. Redirect to Stripe>|                     |                    |                    |                    |
 |                        |                     |                    |                    |                    |
 |--7. Complete Payment-->|                     |                    |                    |                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |                    |--8. Webhook Event-->|                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |--9. Get Session--->|                    |                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |<--10. Session Data-|                    |                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |--11. Update Status->|                    |                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |--12. Generate Video---------------------->|                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |<--13. File ID------------------------------|                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |--14. Store File ID->|                    |                    |
 |                        |                     |                    |                    |                    |
 |<--15. Success Page----|                     |                    |                    |                    |
 |                        |                     |                    |                    |                    |
 |--16. Poll Status------>|                     |                    |                    |                    |
 |                        |--17. Check Webhook->|                   |                    |                    |
 |                        |                     |--18. Get Session--->|                    |                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |<--19. Session Data-|                    |                    |
 |                        |                     |                    |                    |                    |
 |                        |<--20. Status--------|                   |                    |                    |
 |                        |                     |                    |                    |                    |
 |<--21. Redirect--------|                     |                    |                    |                    |
 |                        |                     |                    |                    |                    |
 |--22. File Status Page->|                     |                    |                    |                    |
 |                        |--23. Get File------>|                   |                    |                    |
 |                        |                     |--24. Check File------------------------------>|                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |<--25. File Status------------------------------|                    |
 |                        |                     |                    |                    |                    |
 |                        |<--26. File Data-----|                   |                    |                    |
 |                        |                     |                    |                    |                    |
 |<--27. File Info-------|                     |                    |                    |                    |
 |                        |                     |                    |                    |                    |
 |--28. Poll File Status->|                     |                    |                    |                    |
 |                        |--29. Get File------>|                   |                    |                    |
 |                        |                     |--30. Check File------------------------------>|                    |
 |                        |                     |                    |                    |                    |
 |                        |                     |<--31. File Ready------------------------------|                    |
 |                        |                     |                    |                    |                    |
 |                        |<--32. File URL------|                   |                    |                    |
 |                        |                     |                    |                    |                    |
 |<--33. Download Ready--|                     |                    |                    |                    |
```

## Детальное описание этапов

### Этап 1-6: Создание заказа и редирект

1. **User заполняет форму** с промптом и количеством видео
2. **Frontend отправляет запрос** на создание checkout сессии
3. **Backend сохраняет данные** в Redis (prompt, settings, etc.)
4. **Backend создает Stripe сессию** с минимальными metadata
5. **Backend возвращает URL** для Stripe Checkout
6. **User перенаправляется** на Stripe для оплаты

### Этап 7-14: Обработка платежа и генерация

7. **User завершает оплату** на Stripe
8. **Stripe отправляет webhook** с событием `checkout.session.completed`
9. **Backend получает данные сессии** из Redis
10. **Backend обновляет статус** на 'processing'
11. **Backend запускает генерацию** через SuperDuperAI API
12. **SuperDuperAI создает задачу** и возвращает fileId
13. **Backend сохраняет fileId** в Redis

### Этап 15-21: Страница успешной оплаты

15. **User попадает на success page** с sessionId
16. **Frontend начинает polling** статуса каждые 2 секунды
17. **Frontend проверяет webhook статус** через API
18. **Backend получает данные** из Redis
19. **Backend возвращает статус** и fileId
20. **Frontend получает fileId** и готовится к редиректу
21. **Frontend редиректит** на страницу файла

### Этап 22-33: Отслеживание генерации

22. **User попадает на file status page**
23. **Frontend запрашивает статус файла**
24. **Backend проверяет файл** через SuperDuperAI API
25. **SuperDuperAI возвращает статус** (pending/in_progress/completed)
26. **Backend возвращает данные** файла
27. **Frontend отображает прогресс**
28. **Frontend продолжает polling** каждые 5 секунд
29. **Процесс повторяется** до готовности файла
30. **При готовности** файл становится доступен для скачивания

## Ключевые временные рамки

### Критические таймауты:

- **Webhook timeout**: 15 секунд
- **UI polling timeout**: 60 секунд
- **File status polling**: каждые 5 секунд
- **Webhook status polling**: каждые 2 секунды

### Ожидаемое время выполнения:

- **Оплата**: 10-30 секунд
- **Webhook обработка**: 5-15 секунд
- **Генерация видео**: 2-5 минут
- **Общий процесс**: 3-6 минут

## Обработка ошибок

### Возможные точки отказа:

1. **Stripe webhook не доставлен** → Fallback через polling
2. **Redis недоступен** → Ошибка генерации
3. **SuperDuperAI API недоступен** → Статус 'error'
4. **Файл не найден** → 404 страница
5. **Таймаут генерации** → Уведомление пользователю

### Fallback механизмы:

- **Ручной поиск по sessionId**: `/en/session/{sessionId}`
- **Просмотр всех файлов**: `/en/dev/files`
- **Копирование sessionId** для поддержки
- **Email уведомления** при ошибках

## Мониторинг процесса

### Логи для отслеживания:

```bash
# Создание заказа
grep "Creating checkout session" logs

# Webhook события
grep "Stripe webhook event" logs

# Генерация видео
grep "SuperDuperAI video generation" logs

# Ошибки
grep "❌" logs
```

### Метрики для мониторинга:

- Время от создания заказа до webhook
- Время от webhook до начала генерации
- Время генерации видео
- Процент успешных генераций
- Количество ошибок по типам
