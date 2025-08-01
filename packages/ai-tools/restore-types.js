const fs = require('fs');
const path = require('path');

console.log('Restoring type files for ai-tools...');

// Создаем папку dist если её нет
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Создаем index.d.ts (серверные типы)
const indexContent = `// Server-safe exports
export * from "./types";
export * from "./config";`;

fs.writeFileSync(path.join(distDir, 'index.d.ts'), indexContent);

// Создаем client.d.ts (клиентские типы)
const clientContent = `// Client-only exports
export * from "./components";
export * from "./hooks";`;

fs.writeFileSync(path.join(distDir, 'client.d.ts'), clientContent);

console.log('Type files restored successfully!'); 