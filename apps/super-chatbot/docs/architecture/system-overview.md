# Обзор архитектуры системы Super Turbo

## Диаграмма архитектуры

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 15 App Router]
        B[React Components]
        C[UI Components - shadcn/ui]
    end

    subgraph "API Layer"
        D[API Routes]
        E[Server Actions]
        F[Middleware]
    end

    subgraph "AI Services"
        G[SuperDuperAI API]
        H[Image Generation]
        I[Video Generation]
    end

    subgraph "Monitoring Systems"
        J[Performance Metrics]
        K[Health Monitor]
        L[Alerting System]
    end

    subgraph "Data Layer"
        M[PostgreSQL Database]
        N[Vercel Blob Storage]
    end

    A --> D
    B --> A
    C --> B

    D --> E
    D --> F
    E --> G

    G --> H
    G --> I

    F --> J
    F --> K
    F --> L

    D --> M
    D --> N
```

## Компоненты системы

### Frontend Layer

- **Next.js 15 App Router**: Современная маршрутизация
- **React Components**: Переиспользуемые UI компоненты
- **shadcn/ui**: Дизайн-система

### API Layer

- **API Routes**: RESTful endpoints
- **Server Actions**: Серверные действия
- **Middleware**: Обработка запросов

### AI Services

- **SuperDuperAI API**: Основной провайдер AI
- **Image Generation**: FLUX модели
- **Video Generation**: Veo3

### Monitoring Systems

- **Performance Metrics**: Сбор метрик
- **Health Monitor**: Мониторинг состояния
- **Alerting System**: Уведомления

### Data Layer

- **PostgreSQL**: Основная БД
- **Vercel Blob**: Медиафайлы
