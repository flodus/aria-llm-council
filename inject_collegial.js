#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  inject_collegial.js
//  Injecte la clé "collegial" dans aria_syntheses.json (FR) et
//  aria_syntheses_en.json (EN) dans templates/languages/
//
//  Usage  : node inject_collegial.js
//  Racine : à lancer depuis la racine du projet ARIA
//
//  Fichiers sources attendus à la racine :
//    aria_syntheses_collegiale_v2.json  → FR
//    aria_syntheses_collegiale_en.json  → EN
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

const JOBS = [
  {
    label     : 'FR',
    source    : join(ROOT, 'aria_syntheses_collegiale_v2.json'),
    target    : join(ROOT, 'templates', 'languages', 'fr', 'aria_syntheses.json'),
    backup    : join(ROOT, 'templates', 'languages', 'fr', 'aria_syntheses.backup.json'),
  },
  {
    label     : 'EN',
    source    : join(ROOT, 'aria_syntheses_collegiale_en.json'),
    target    : join(ROOT, 'templates', 'languages', 'en', 'aria_syntheses.json'),
    backup    : join(ROOT, 'templates', 'languages', 'en', 'aria_syntheses.backup.json'),
  },
];

// ─────────────────────────────────────────────────────────────────────────────

let allOk = true;

for (const job of JOBS) {
  console.log(`\n── ${job.label} ──────────────────────────────`);

  // 1. Vérifier que les fichiers existent
  if (!existsSync(job.source)) {
    console.error(`✗ Source introuvable : ${job.source}`);
    allOk = false;
    continue;
  }
  if (!existsSync(job.target)) {
    console.error(`✗ Cible introuvable  : ${job.target}`);
    console.error(`  Vérifier le chemin templates/languages/${job.label.toLowerCase()}/`);
    allOk = false;
    continue;
  }

  try {
    // 2. Backup
    copyFileSync(job.target, job.backup);
    console.log(`✓ Backup créé        : ${job.backup}`);

    // 3. Lire
    const target = JSON.parse(readFileSync(job.target, 'utf8'));
    const source = JSON.parse(readFileSync(job.source, 'utf8'));

    // 4. Avertir si déjà présent
    if (target.collegial) {
      console.warn(`⚠ Clé "collegial" déjà présente — écrasement.`);
    }

    // 5. Injecter
    target.collegial = source.collegial;

    // 6. Écrire
    writeFileSync(job.target, JSON.stringify(target, null, 2), 'utf8');

    const regimes = Object.keys(source.collegial.par_regime);
    console.log(`✓ Injecté dans       : ${job.target}`);
    console.log(`  Régimes couverts   : ${regimes.join(' · ')}`);
    console.log(`  Phrases par état   : 5 convergence + 5 divergence`);

  } catch (err) {
    console.error(`✗ Erreur ${job.label} :`, err.message);
    allOk = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

console.log('\n──────────────────────────────────────────');
if (allOk) {
  console.log('✓ Injection terminée. Vérifier les fichiers avant commit.');
  console.log('  Backups disponibles si rollback nécessaire.');
  console.log('\n  Commit suggéré :');
  console.log('  git add templates/languages/fr/aria_syntheses.json');
  console.log('  git add templates/languages/en/aria_syntheses_en.json');
  console.log('  git commit -m "feat(B10): synthèses collégiales FR+EN — 9 régimes × 5 phrases"');
} else {
  console.error('✗ Injection partielle — vérifier les erreurs ci-dessus.');
  process.exit(1);
}
