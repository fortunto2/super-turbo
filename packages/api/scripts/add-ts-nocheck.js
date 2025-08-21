#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src/superduperai');

function addTsNoCheck(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      addTsNoCheck(filePath);
    } else if (file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Добавляем @ts-nocheck если его еще нет
      if (!content.includes('@ts-nocheck')) {
        const newContent = `// @ts-nocheck\n${content}`;
        fs.writeFileSync(filePath, newContent);
        console.log(`✅ Added @ts-nocheck to: ${filePath}`);
      } else {
        console.log(`⏭️  Already has @ts-nocheck: ${filePath}`);
      }
    }
  }
}

console.log('🔧 Adding @ts-nocheck to all auto-generated TypeScript files...');
addTsNoCheck(srcDir);
console.log('✅ Done!');
