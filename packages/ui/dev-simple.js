const { execSync } = require('child_process');

console.log('Generating types...');
execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });

console.log('Starting tsup in watch mode...');
execSync('tsup --watch', { stdio: 'inherit' }); 