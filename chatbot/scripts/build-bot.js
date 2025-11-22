import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botJsPath = resolve(__dirname, '../src/bot.js');
const distPath = resolve(__dirname, '../dist/bot.js');

try {
  // Read bot.js
  const botContent = readFileSync(botJsPath, 'utf-8');
  
  // Ensure dist directory exists
  mkdirSync(resolve(__dirname, '../dist'), { recursive: true });
  
  // Write to dist
  writeFileSync(distPath, botContent, 'utf-8');
  
  console.log('✓ bot.js copied to dist/bot.js');
} catch (error) {
  console.error('Error building bot.js:', error);
  process.exit(1);
}

