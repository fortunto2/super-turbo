# API документация - Системы мониторинга

## Обзор

Данный документ описывает API endpoints для систем мониторинга, включая проверку здоровья приложения, метрики производительности и управление алертами.

## Endpoints

### 1. Проверка здоровья системы

#### `GET /api/health`

Возвращает текущее состояние здоровья приложения и всех его компонентов.

**Параметры запроса:**

- Нет

**Ответ:**

```json
{
  "status": "healthy" | "degraded" | "unhealthy" | "unknown",
  "timestamp": 1703123456789,
  "uptime": 3600000,
  "version": "1.0.0",
  "environment": "production",
  "checks": [
    {
      "name": "database",
      "status": "healthy",
      "message": "Database connection: 45ms",
      "timestamp": 1703123456789,
      "duration": 45,
      "metadata": {
        "responseTime": 45
      }
    }
  ],
  "summary": {
    "healthy": 4,
    "degraded": 0,
    "unhealthy": 0,
    "unknown": 0
  },
  "metrics": {
    "performance": {
      "api": {
        "totalRequests": 1250,
        "averageResponseTime": 150,
        "successRate": 99.2
      }
    },
    "alerts": {
      "active": 0,
      "critical": 0,
      "error": 0,
      "warning": 0
    }
  }
}
```

**Коды ответов:**

- `200` - Система работает нормально
- `503` - Система нездорова

### 2. Метрики производительности

#### `GET /api/metrics`

Возвращает детальные метрики производительности системы.

**Параметры запроса:**

- `timeWindow` (опционально) - Временное окно для метрик (например: "1h", "24h", "7d")
- `format` (опционально) - Формат ответа: "json" (по умолчанию) или "prometheus"

**Пример запроса:**

```
GET /api/metrics?timeWindow=1h&format=json
```

**Ответ (JSON):**

```json
{
  "timestamp": 1703123456789,
  "timeWindow": {
    "requested": "1h",
    "actual": 3600000
  },
  "performance": {
    "api": {
      "totalRequests": 1250,
      "averageResponseTime": 150,
      "successRate": 99.2,
      "requestsUnder100ms": 800,
      "requestsUnder500ms": 1200,
      "requestsUnder1s": 1250
    },
    "components": {
      "totalRenders": 5600,
      "averageRenderTime": 25
    },
    "system": {
      "memoryUsage": {
        "rss": 125829120,
        "heapTotal": 67108864,
        "heapUsed": 41943040,
        "external": 1048576
      },
      "cpuUsage": {
        "user": 1500000,
        "system": 500000
      }
    }
  },
  "alerts": {
    "total": 5,
    "active": 1,
    "resolved": 4,
    "byType": {
      "PERFORMANCE_DEGRADATION": 2,
      "HIGH_ERROR_RATE": 1,
      "MEMORY_LEAK": 0
    },
    "bySeverity": {
      "CRITICAL": 0,
      "ERROR": 1,
      "WARNING": 2,
      "INFO": 2
    },
    "averageResolutionTime": 1800000
  },
  "logs": {
    "total": 15000,
    "errorRate": 0.8,
    "byLevel": {
      "debug": 2000,
      "info": 10000,
      "warn": 2000,
      "error": 1000,
      "fatal": 0
    }
  },
  "system": {
    "uptime": 3600,
    "memory": {
      "rss": 125829120,
      "heapTotal": 67108864,
      "heapUsed": 41943040,
      "external": 1048576
    },
    "cpu": {
      "user": 1500000,
      "system": 500000
    },
    "platform": "win32",
    "nodeVersion": "v18.17.0"
  }
}
```

**Ответ (Prometheus):**

```
# HELP nodejs_memory_usage_bytes Memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} 125829120
nodejs_memory_usage_bytes{type="heapTotal"} 67108864
nodejs_memory_usage_bytes{type="heapUsed"} 41943040
nodejs_memory_usage_bytes{type="external"} 1048576

# HELP nodejs_uptime_seconds Process uptime in seconds
# TYPE nodejs_uptime_seconds counter
nodejs_uptime_seconds 3600

# HELP api_requests_total Total number of API requests
# TYPE api_requests_total counter
api_requests_total 1250

# HELP api_request_duration_seconds API request duration
# TYPE api_request_duration_seconds histogram
api_request_duration_seconds_bucket{le="0.1"} 800
api_request_duration_seconds_bucket{le="0.5"} 1200
api_request_duration_seconds_bucket{le="1.0"} 1250
api_request_duration_seconds_bucket{le="+Inf"} 1250
api_request_duration_seconds_sum 187500
api_request_duration_seconds_count 1250
```

**Коды ответов:**

- `200` - Успешно
- `400` - Неверный формат параметров
- `500` - Ошибка получения метрик

## Типы данных

### HealthStatus

```typescript
type ComponentHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

interface HealthCheck {
  name: string;
  status: ComponentHealthStatus;
  message: string;
  timestamp: number;
  duration: number;
  metadata?: Record<string, any>;
}

interface HealthStatus {
  overall: ComponentHealthStatus;
  timestamp: number;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheck[];
  summary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
  };
}
```

### PerformanceMetrics

```typescript
interface ApiMetrics {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  requestsUnder100ms: number;
  requestsUnder500ms: number;
  requestsUnder1s: number;
}

interface ComponentMetrics {
  totalRenders: number;
  averageRenderTime: number;
}

interface SystemMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}
```

### Alert

```typescript
type AlertType =
  | "PERFORMANCE_DEGRADATION"
  | "HIGH_ERROR_RATE"
  | "MEMORY_LEAK"
  | "CPU_SPIKE"
  | "DATABASE_SLOW"
  | "API_TIMEOUT"
  | "WEBSOCKET_DISCONNECTIONS"
  | "SECURITY_BREACH"
  | "RATE_LIMIT_EXCEEDED"
  | "DISK_SPACE_LOW"
  | "SERVICE_DOWN"
  | "CUSTOM";

type AlertSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  source: string;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: number;
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
