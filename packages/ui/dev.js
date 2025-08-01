const { execSync, spawn } = require('child_process');

console.log('Starting UI package in dev mode...');

// Сначала генерируем типы
console.log('Generating initial types...');
try {
  execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });
  console.log('Initial types generated successfully');
} catch (error) {
  console.error('Failed to generate initial types:', error.message);
  process.exit(1);
}

// Затем запускаем tsup в watch режиме
console.log('Starting tsup in watch mode...');
const tsup = spawn('pnpm', ['tsup', '--watch'], { stdio: 'inherit' });

// Обработка завершения процесса
process.on('SIGINT', () => {
  tsup.kill('SIGINT');
  process.exit(0);
});

tsup.on('close', (code) => {
  process.exit(code);
}); 