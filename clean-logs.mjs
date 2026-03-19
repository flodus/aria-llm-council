import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

// Récupère tous les fichiers JS/JSX
const result = execSync('git ls-files "src/**/*.js" "src/**/*.jsx"', { encoding: 'utf-8' });
const files = result.split('\n').filter(Boolean);

let totalRemoved = 0;

files.forEach(file => {
  if (!existsSync(file)) return;
  
  let content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Si c'est un console.log, on le saute ET on saute la prochaine ligne si elle est vide
    if (line.includes('console.log') || line.includes('console.error') || 
        line.includes('console.warn') || line.includes('console.info') ||
        line.includes('console.debug')) {
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
    writeFileSync(file, newContent, 'utf-8');
    console.log(`✅ Nettoyé: ${file}`);
  }
});

console.log(`\n✨ ${totalRemoved} console.log supprimés (avec leur ligne vide)`);
