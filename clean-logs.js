#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Récupère tous les fichiers JS/JSX
const files = execSync('git ls-files "src/**/*.js" "src/**/*.jsx"', { encoding: 'utf-8' })
  .split('\n')
  .filter(Boolean);

let totalRemoved = 0;

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Si c'est un console.log, on le saute ET on saute la prochaine ligne si elle est vide
    if (line.includes('console.log') || line.includes('console.error') || 
        line.includes('console.warn') || line.includes('console.info')) {
      totalRemoved++;
      // Si la prochaine ligne existe et est vide, on l'avance aussi
      if (i + 1 < lines.length && lines[i + 1].trim() === '') {
        i++; // saute la ligne vide
      }
      continue;
    }
    
    newLines.push(line);
  }
  
  const newContent = newLines.join('\n');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf-8');
    console.log(`✅ Nettoyé: ${file}`);
  }
});

console.log(`\n✨ ${totalRemoved} console.log supprimés (avec leur ligne vide)`);
