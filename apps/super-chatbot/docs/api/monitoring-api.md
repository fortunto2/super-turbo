# API документация - Упрощенная система мониторинга

## Обзор

Данный документ описывает упрощенные API endpoints для мониторинга, включая проверку здоровья приложения и базовые метрики производительности. Система была упрощена для лучшей производительности и простоты поддержки.

## Endpoints

### 1. Проверка здоровья системы

#### `GET /api/health`

Возвращает текущее состояние здоровья приложения и всех его компонентов.

**Параметры запроса:**

- Нет

**Ответ:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-24T23:51:37.000Z",
  "uptime": 2925.088545,
  "version": "1.0.0",
  "environment": "development",
  "system": {
    "platform": "win32",
    "nodeVersion": "v20.10.0",
    "memory": {
      "used": 92,
      "total": 98,
      "unit": "MB"
    }
  },
  "services": {
    "database": "healthy",
    "api": "healthy",
    "monitoring": "healthy"
  }
}
```

**Коды ответов:**

- `200` - Система работает нормально
- `503` - Система нездорова

### 2. Базовые метрики системы

#### `GET /api/metrics`

Возвращает базовые метрики системы и API endpoints.

**Параметры запроса:**

- Нет

**Ответ:**

```json
{
  "status": "success",
  "data": {
    "system": {
      "uptime": 2925.088545,
      "memory": {
        "rss": 125829120,
        "heapTotal": 67108864,
        "heapUsed": 41943040,
        "external": 1048576
      },
      "platform": "win32",
      "nodeVersion": "v20.10.0"
    },
    "api": {
      "endpoints": [
        {
          "endpoint": "/api/health",
          "requests": 45,
          "errors": 0,
          "averageTime": 23.5,
          "errorRate": 0
        }
      ],
      "totalRequests": 45,
      "totalErrors": 0
    },
    "summary": {
      "uptime": 2925.088545,
      "memoryUsage": 62.5,
      "totalEndpoints": 1
    }
  }
}
```

**Коды ответов:**

- `200` - Метрики успешно получены
- `500` - Ошибка получения метрик

## Типы данных

### HealthStatus

```typescript
interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  system: {
    platform: string;
    nodeVersion: string;
    memory: {
      used: number;
      total: number;
      unit: string;
    };
  };
  services: {
    database: string;
    api: string;
    monitoring: string;
  };
}
```

### MetricsData

```typescript
interface MetricsData {
  status: "success" | "error";
  data: {
    system: {
      uptime: number;
      memory: NodeJS.MemoryUsage;
      platform: string;
      nodeVersion: string;
    };
    api: {
      endpoints: Array<{
        endpoint: string;
        requests: number;
        errors: number;
        averageTime: number;
        errorRate: number;
      }>;
      totalRequests: number;
      totalErrors: number;
    };
    summary: {
      uptime: number;
      memoryUsage: number;
      totalEndpoints: number;
    };
  };
}
```

## Обработка ошибок

Все API endpoints возвращают стандартизированные ошибки:

```json
{
  "error": "Error type",
  "message": "Human readable error message",
  "timestamp": 1703123456789,
  "details": {
    "code": "ERROR_CODE",
    "context": "Additional context information"
  }
}
```

## Аутентификация

Все endpoints мониторинга требуют аутентификации. Используйте заголовок:

```
Authorization: Bearer <your-token>
```

## Rate Limiting

- `/api/health`: 60 запросов в минуту
- `/api/metrics`: 30 запросов в минуту

При превышении лимита возвращается HTTP 429 с заголовками:

```
Retry-After: 60
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2023-12-21T10:30:00Z
```

## Примеры использования

### Проверка здоровья системы

```bash
curl -H "Authorization: Bearer your-token" \
     https://api.example.com/api/health
```

### Получение метрик за последний час

```bash
curl -H "Authorization: Bearer your-token" \
     "https://api.example.com/api/metrics?timeWindow=1h"
```

### Получение метрик в формате Prometheus

```bash
curl -H "Authorization: Bearer your-token" \
     "https://api.example.com/api/metrics?format=prometheus"
```

## Интеграция с внешними системами

### Prometheus

Метрики можно интегрировать с Prometheus, используя endpoint `/api/metrics?format=prometheus`.

### Grafana

Создайте дашборд в Grafana, используя Prometheus как источник данных.

### Slack

Настройте webhook для получения алертов в Slack через конфигурацию системы алертов.

### Sentry

Все ошибки автоматически отправляются в Sentry для отслеживания и анализа.
