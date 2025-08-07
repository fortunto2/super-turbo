const fs = require('fs');
const path = require('path');

function fixQuotes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Удаляем кавычки из frontmatter полей
    let newContent = content
      // Убираем кавычки из title
      .replace(/title: "([^"]+)"/g, 'title: $1')
      // Убираем кавычки из description
      .replace(/description: "([^"]+)"/g, 'description: $1')
      // Убираем кавычки из slug
      .replace(/slug: "([^"]+)"/g, 'slug: $1')
      // Убираем кавычки из locale
      .replace(/locale: "([^"]+)"/g, 'locale: $1')
      // Убираем кавычки из modelName
      .replace(/modelName: "([^"]+)"/g, 'modelName: $1')
      // Убираем кавычки из seo title
      .replace(/(seo:\s*\n\s*)title: "([^"]+)"/g, '$1title: $2')
      // Убираем кавычки из seo description
      .replace(/(seo:\s*\n\s*title: [^\n]+\n\s*)description: "([^"]+)"/g, '$1description: $2');

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Исправлены кавычки в ${filePath}`);
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    if (file.endsWith('.mdx')) {
      const filePath = path.join(dirPath, file);
      fixQuotes(filePath);
    }
  });
}

// Обрабатываем русские файлы
console.log('🔧 Исправляем кавычки в русских файлах...');
const ruDir = path.join(__dirname, '../src/content/blog/ru');
processDirectory(ruDir);

// Обрабатываем английские файлы
console.log('🔧 Исправляем кавычки в английских файлах...');
const enDir = path.join(__dirname, '../src/content/blog/en');
processDirectory(enDir);

console.log('✅ Готово!'); 