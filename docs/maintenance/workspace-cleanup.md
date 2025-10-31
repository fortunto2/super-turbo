# Очистка Workspace

## Проблема

При выполнении `pnpm clean` в некоторых workspace пакетах оставались папки `node_modules`, что могло вызывать конфликты при сборке и установке зависимостей.

## Решение

### 1. Улучшенный скрипт очистки

Создан улучшенный скрипт `scripts/clean-workspace.js`, который:

- Рекурсивно находит все папки `node_modules`, `dist`, `.next`, `.turbo`
- Удаляет их безопасно
- Показывает прогресс очистки
- Работает кроссплатформенно (Windows, macOS, Linux)

### 2. Новые команды

```bash
# Стандартная очистка (turbo clean + node_modules)
pnpm clean

# Полная очистка workspace (все папки)
pnpm clean:all
```

### 3. Обновленный скрипт clean.js

- Добавлена поддержка glob паттернов
- Улучшена обработка ошибок
- Добавлена зависимость `glob` для работы с паттернами

## Использование

### Стандартная очистка
```bash
pnpm clean
```

### Полная очистка
```bash
pnpm clean:all
```

### Ручная очистка конкретных папок
```bash
node scripts/clean.js node_modules dist .next
```

### Очистка с glob паттернами
```bash
node scripts/clean.js packages/*/node_modules apps/*/.next
```

## Что удаляется

### При `pnpm clean`:
- Результаты `turbo clean`
- Корневая папка `node_modules`
- Все `node_modules` в пакетах

### При `pnpm clean:all`:
- Все папки `node_modules`
- Все папки `dist`
- Все папки `.next`
- Все папки `.turbo`

## Рекомендации

1. **Перед деплоем**: Выполните `pnpm clean:all` для полной очистки
2. **При проблемах с зависимостями**: Используйте `pnpm clean:all` + `pnpm install`
3. **Для быстрой очистки**: Используйте `pnpm clean`

## Безопасность

- Скрипт не удаляет файлы `.git`
- Не удаляет конфигурационные файлы
- Показывает прогресс и результаты
- Обрабатывает ошибки gracefully

## Примеры использования

### Полная пересборка проекта
```bash
pnpm clean:all
pnpm install
pnpm build
```

### Очистка только приложений
```bash
node scripts/clean.js apps/*/node_modules apps/*/.next
```

### Очистка только пакетов
```bash
node scripts/clean.js packages/*/node_modules packages/*/dist
```

## Troubleshooting

### Если скрипт не работает на Windows
Убедитесь, что у вас установлена последняя версия Node.js и PowerShell.

### Если остаются заблокированные файлы
На Windows иногда файлы могут быть заблокированы процессами. Попробуйте:
1. Закрыть все IDE и терминалы
2. Выполнить `pnpm clean:all`
3. Перезапустить терминал

### Проблема с turbo.exe на Windows
Если возникает ошибка `EPERM: operation not permitted, unlink 'turbo.exe'`:

1. **Закройте все процессы**, которые могут использовать turbo:
   ```bash
   # Закройте все терминалы и IDE
   # Проверьте в диспетчере задач процессы Node.js
   ```

2. **Удалите заблокированный файл вручную**:
   ```bash
   Remove-Item -Path "node_modules\.pnpm\turbo-windows-64@2.5.5\node_modules\turbo-windows-64\bin\turbo.exe" -Force
   ```

3. **Очистите pnpm кеш**:
   ```bash
   pnpm store prune
   ```

4. **Попробуйте установить без turbo**:
   ```bash
   pnpm install --ignore-scripts
   ```

5. **Альтернативный способ** - используйте npm вместо pnpm:
   ```bash
   npm install
   ```

### Если не хватает прав
На Unix системах может потребоваться `sudo`:
```bash
sudo node scripts/clean-workspace.js
```
