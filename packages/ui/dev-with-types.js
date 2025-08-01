const { execSync } = require('child_process');

console.log('Starting UI package in dev mode with type restoration...');

// Сначала восстанавливаем типы
console.log('Restoring types...');
execSync('node restore-types.js', { stdio: 'inherit' });

// Затем запускаем tsup в watch режиме
console.log('Starting tsup in watch mode...');
execSync('tsup --watch', { stdio: 'inherit' }); 