/**
 * Упрощенная система мониторинга
 */

export {
  trackApiRequest,
  getMetrics,
  withMonitoring,
  getHealthStatus,
} from './simple-monitor';

// Простая инициализация (если нужна)
export function initializeMonitoring() {
  console.log('✅ Simple monitoring system initialized');
}
