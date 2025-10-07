#!/usr/bin/env node

/**
 * Скрипт для полной очистки workspace
 * Удаляет все node_modules, dist, .next папки
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return false;
  }
  
  try {
    console.log(`🗑️  Удаляем: ${dirPath}`);
    
    if (os.platform() === 'win32') {
      execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'pipe' });
    } else {
      execSync(`rm -rf "${dirPath}"`, { stdio: 'pipe' });
    }
    
    console.log(`✅ Удалено: ${dirPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при удалении ${dirPath}:`, error.message);
    return false;
  }
}

function findDirectories(rootPath, dirName) {
  const dirs = [];
  
  function scanDirectory(currentPath) {
    if (!fs.existsSync(currentPath)) return;
    
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        if (item === dirName) {
          dirs.push(itemPath);
        } else if (item !== 'node_modules' && item !== '.git') {
          // Рекурсивно сканируем, но не углубляемся в node_modules
          scanDirectory(itemPath);
        }
      }
    }
  }
  
  scanDirectory(rootPath);
  return dirs;
}

function main() {
  console.log('🧹 Полная очистка workspace...\n');
  
  const rootPath = path.resolve(__dirname, '..');
  let totalRemoved = 0;
  
  // Удаляем node_modules
  console.log('📦 Удаляем node_modules...');
  const nodeModulesDirs = findDirectories(rootPath, 'node_modules');
  nodeModulesDirs.forEach(dir => {
    if (removeDirectory(dir)) totalRemoved++;
  });
  
  // Удаляем dist папки
  console.log('\n📦 Удаляем dist папки...');
  const distDirs = findDirectories(rootPath, 'dist');
  distDirs.forEach(dir => {
    if (removeDirectory(dir)) totalRemoved++;
  });
  
  // Удаляем .next папки
  console.log('\n📦 Удаляем .next папки...');
  const nextDirs = findDirectories(rootPath, '.next');
  nextDirs.forEach(dir => {
    if (removeDirectory(dir)) totalRemoved++;
  });
  
  // Удаляем .turbo папки
  console.log('\n📦 Удаляем .turbo папки...');
  const turboDirs = findDirectories(rootPath, '.turbo');
  turboDirs.forEach(dir => {
    if (removeDirectory(dir)) totalRemoved++;
  });
  
  console.log(`\n🎉 Очистка завершена! Удалено ${totalRemoved} папок.`);
}

main();

