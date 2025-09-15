#!/usr/bin/env node

/**
 * Quick test script for API after migration
 */

console.log('🧪 БЫСТРЫЙ ТЕСТ API ПОСЛЕ МИГРАЦИИ');
console.log('==================================');
console.log('');

console.log('1️⃣ Примените миграцию (SQL команды выше)');
console.log('2️⃣ Запустите сервер: npm run dev');
console.log('3️⃣ Откройте: http://localhost:3000/admin/users');
console.log('4️⃣ Создайте тестовый проект через Story Editor');
console.log('');

console.log('✅ Ожидаемый результат:');
console.log('- Проект создается без ошибок БД');
console.log('- Статус: pending → processing');
console.log('- Баланс списывается');
console.log('- При ошибке Prefect - кредиты возвращаются');
console.log('');

console.log('🔍 Проверьте в БД:');
console.log('SELECT "projectId", "status", "creditsUsed" FROM "UserProject" ORDER BY "createdAt" DESC LIMIT 3;');
console.log('');

console.log('🎉 Если все работает - API полностью готов!');



