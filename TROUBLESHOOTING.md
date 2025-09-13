# Руководство по устранению неполадок

## Проблемы с модулем @turbo-super/payment

### Ошибка: "Can't resolve @turbo-super/payment"

Эта ошибка обычно возникает в CI/CD окружении (GitHub Actions) из-за проблем с workspace зависимостями.

#### Решения:

1. **Пересборка пакетов в правильном порядке:**

   ```bash
   pnpm run build:packages
   ```

2. **Очистка и переустановка:**

   ```bash
   pnpm clean
   pnpm install
   pnpm run build:types
   pnpm run build
   ```

3. **Проверка workspace зависимостей:**
   ```bash
   # Проверить, что все пакеты правильно ссылаются друг на друга
   pnpm list --depth=0
   ```

#### Конфигурация для CI/CD:

1. **Убедитесь, что в CI/CD используется правильный порядок команд:**

   ```yaml
   - name: Install dependencies
     run: pnpm install --frozen-lockfile

   - name: Build packages
     run: pnpm run build:types

   - name: Build applications
     run: pnpm run build
   ```

2. **Настройки .npmrc для CI/CD:**
   ```
   auto-install-peers=true
   prefer-workspace-packages=true
   link-workspace-packages=true
   shamefully-hoist=true
   ```

#### Диагностика:

1. **Проверить структуру пакетов:**

   ```bash
   ls -la packages/*/dist/
   ```

2. **Проверить экспорты:**

   ```bash
   cat packages/payment/package.json | grep -A 10 "exports"
   ```

3. **Проверить зависимости:**
   ```bash
   pnpm why @turbo-super/payment
   ```

### Другие возможные проблемы:

#### Проблема с TypeScript типами:

```bash
# Пересборка типов для всех пакетов
pnpm run build:types
```

#### Проблема с кэшем Turbo:

```bash
# Очистка кэша Turbo
pnpm turbo clean
```

#### Проблема с версиями Node.js:

- Убедитесь, что используется Node.js >= 20.18.1
- Проверьте `.nvmrc` или `engines` в package.json

### Контакты для поддержки:

Если проблема не решается, создайте issue с:

1. Полным логом ошибки
2. Версией Node.js и pnpm
3. Операционной системой
4. Шагами воспроизведения
