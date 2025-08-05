#!/usr/bin/env node

/**
 * Скрипт для диагностики проблем с Auth0 конфигурацией в NextAuth v5
 */

console.log('🔍 Диагностика проблем с Auth0 конфигурацией (NextAuth v5)...\n');

// Проверяем переменные окружения
const envVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Настроен' : '❌ Отсутствует',
  VERCEL_URL: process.env.VERCEL_URL,
  AUTH_AUTH0_ID: process.env.AUTH_AUTH0_ID ? '✅ Настроен' : '❌ Отсутствует',
  AUTH_AUTH0_SECRET: process.env.AUTH_AUTH0_SECRET ? '✅ Настроен' : '❌ Отсутствует',
  AUTH_AUTH0_ISSUER: process.env.AUTH_AUTH0_ISSUER,
  NODE_ENV: process.env.NODE_ENV,
};

console.log('📋 Переменные окружения:');
Object.entries(envVars).forEach(([key, value]) => {
  if (key.includes('SECRET') || key.includes('ID')) {
    console.log(`   ${key}: ${value}`);
  } else {
    console.log(`   ${key}: ${value || '❌ Не установлена'}`);
  }
});

// Определяем правильный URL
const nextAuthUrl = process.env.NEXTAUTH_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

console.log(`\n🌐 Определенный NEXTAUTH_URL: ${nextAuthUrl}`);

// Проверяем, что нужно настроить в Auth0
console.log('\n🎯 Что нужно проверить в Auth0 консоли:');
console.log('1. Allowed Callback URLs:');
console.log(`   - ${nextAuthUrl}/api/auth/callback/auth0`);
console.log('   - http://localhost:3000/api/auth/callback/auth0 (для разработки)');

console.log('\n2. Allowed Logout URLs:');
console.log(`   - ${nextAuthUrl}`);
console.log('   - http://localhost:3000 (для разработки)');

console.log('\n3. Allowed Web Origins:');
console.log(`   - ${nextAuthUrl}`);
console.log('   - http://localhost:3000 (для разработки)');

console.log('\n4. Application Type:');
console.log('   - Single Page Application (SPA)');

console.log('\n🔧 Рекомендации для NextAuth v5:');
console.log('1. Убедитесь, что в Auth0 консоли добавлены правильные callback URLs');
console.log('2. Проверьте, что NEXTAUTH_URL установлен в переменных окружения');
console.log('3. Убедитесь, что NEXTAUTH_SECRET установлен (обязательно для v5)');
console.log('4. Проверьте, что домен в Auth0 соответствует продакшен домену');
console.log('5. Убедитесь, что приложение в Auth0 настроено как SPA');

console.log('\n🚀 Команды для исправления:');
console.log('# Добавить переменные окружения в Vercel:');
console.log('NEXTAUTH_URL=https://your-domain.vercel.app');
console.log('NEXTAUTH_SECRET=your-secret-key-here');

console.log('\n# Или добавить в .env.local:');
console.log('NEXTAUTH_URL=http://localhost:3000');
console.log('NEXTAUTH_SECRET=your-secret-key-here');

console.log('\n⚠️  Важно для NextAuth v5:');
console.log('- NEXTAUTH_SECRET обязателен для работы в продакшене');
console.log('- trustHost: true добавлен в конфигурацию для безопасности');
console.log('- URL настраивается через переменную окружения NEXTAUTH_URL'); 