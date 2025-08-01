const { execSync } = require('child_process');

console.log('Building UI package with tsup...');
execSync('tsup', { stdio: 'inherit' });

console.log('Generating TypeScript declarations...');
execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });

console.log('UI package build completed!'); 