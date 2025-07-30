# Руководство по предотвращению ошибок гидратации

Этот документ содержит рекомендации по предотвращению ошибок гидратации в Next.js приложении.

## Основные причины ошибок гидратации

1. **Framer Motion анимации**
   - Проблема: Использование `animate` вместо `whileInView`
   - Решение: Всегда используйте `whileInView` с `viewport={{ once: true }}`

2. **Lucide иконки**
   - Проблема: Автоматическое добавление CSS классов на клиенте
   - Решение: Используйте компонент `SafeIcon` из `@/components/ui/safe-icon`

3. **Динамический контент**
   - Проблема: Различные начальные состояния на сервере и клиенте
   - Решение: Добавляйте `suppressHydrationWarning` для элементов, зависящих от состояния

4. **Временные значения**
   - Проблема: `Date.now()`, `Math.random()` дают разные значения
   - Решение: Используйте `useEffect` для инициализации таких значений

## Практические рекомендации

### Framer Motion

```tsx
// ❌ Плохо - может вызвать гидратацию
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>

// ✅ Хорошо - безопасно для SSR
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
>
```

### Lucide иконки

```tsx
// ❌ Плохо - может вызвать гидратацию
import { User } from "lucide-react";
<User className="h-6 w-6" />;

// ✅ Хорошо - использует SafeIcon
import { SafeIcon } from "@/components/ui/safe-icon";
import { User } from "lucide-react";
<SafeIcon
  icon={User}
  className="h-6 w-6"
/>;
```

### Динамический контент

```tsx
// ❌ Плохо - состояние может отличаться
<div className={isActive ? "active" : "inactive"}>

// ✅ Хорошо - подавляет предупреждения гидратации
<div
  className={isActive ? "active" : "inactive"}
  suppressHydrationWarning
>
```

### Условное рендеринг

```tsx
// ❌ Плохо - может отличаться на сервере
{
  typeof window !== "undefined" && <ClientComponent />;
}

// ✅ Хорошо - используйте useEffect
const [isClient, setIsClient] = useState(false);
useEffect(() => setIsClient(true), []);
{
  isClient && <ClientComponent />;
}
```

## Компоненты для повторного использования

### SafeIcon

Используйте `SafeIcon` для всех Lucide иконок:

```tsx
import { SafeIcon } from "@/components/ui/safe-icon";
import { IconName } from "lucide-react";

<SafeIcon
  icon={IconName}
  className="h-6 w-6"
/>;
```

### Компоненты с состоянием

Для компонентов со сложным состоянием, которое может отличаться на сервере и клиенте, добавляйте `suppressHydrationWarning` в корневой элемент.

## Отладка гидратации

1. Включите React StrictMode для выявления проблем
2. Используйте React DevTools для просмотра дерева компонентов
3. Проверяйте консоль браузера на предупреждения гидратации
4. Тестируйте в production сборке, так как некоторые проблемы проявляются только там

## Автоматизация

Добавьте ESLint правила для автоматического обнаружения потенциальных проблем:

```json
{
  "rules": {
    "react/no-unescaped-entities": "error",
    "@next/next/no-img-element": "error"
  }
}
```

## Мониторинг

Используйте Sentry или аналогичные инструменты для отслеживания ошибок гидратации в production.
