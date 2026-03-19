#!/usr/bin/env node

const fs = require('fs');
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_JSON_PATH = path.join(PROJECT_ROOT, 'data', 'aria_responses.json');

// Gestion des arguments
const args = process.argv.slice(2);
const jsonArg = args.find(arg => !arg.startsWith('--'));
const fixMode = args.includes('--fix');

// Déterminer le chemin du JSON
let jsonPath;
if (jsonArg) {
    // Si un chemin est fourni, le résoudre
    jsonPath = path.isAbsolute(jsonArg) ? jsonArg : path.resolve(process.cwd(), jsonArg);
} else {
    // Sinon, utiliser le chemin par défaut
    jsonPath = DEFAULT_JSON_PATH;
    console.log(`ℹ️  Aucun fichier spécifié, utilisation du défaut: ${jsonPath}`);
}

// Vérifier que le fichier existe
if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Fichier non trouvé: ${jsonPath}`);
    console.log('\n🔍 Chemins possibles depuis scripts_maintenance/:');
    console.log('   - ../data/aria_responses.json');
    console.log('   - ../../data/aria_responses.json');
    console.log('   - /chemin/absolu/vers/le/fichier.json');
    console.log('\n💡 Usage:');
    console.log('   node scripts_maintenance/check_aria.js [chemin] [--fix]');
    console.log('   Exemples:');
    console.log('   node scripts_maintenance/check_aria.js');
    console.log('   node scripts_maintenance/check_aria.js ../data/aria_responses.json');
    console.log('   node scripts_maintenance/check_aria.js ../../backup/old.json --fix');
    process.exit(1);
}

console.log('📁 Script directory:', SCRIPT_DIR);
console.log('📁 Project root:', PROJECT_ROOT);
console.log('📄 JSON file:', jsonPath);
console.log('🔧 Fix mode:', fixMode ? 'ON' : 'OFF');
console.log('');

// === Ton code d'analyse ici (celui d'avant) ===
function analyzeAriaJSON(filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log('🔍 Analyse du fichier:', path.basename(filePath));
        console.log('=================================');

        // Validation structure
        console.log('✅ JSON valide');
        console.log('📋 Structure _meta:', data._meta ? '✅ présent' : '❌ manquant');
        console.log('📋 Structure ministers:', data.ministers ? '✅ présent' : '❌ manquant');

        // Stats par posture
        const stats = {
            prudent: { total: 0, tirets: 0, virgules: 0, exclams: 0, points: 0 },
            radical: { total: 0, tirets: 0, virgules: 0, exclams: 0, points: 0 },
            statu_quo: { total: 0, tirets: 0, virgules: 0, exclams: 0, points: 0 }
        };

        // Parcourir toutes les réponses
        for (const [ministerName, minister] of Object.entries(data.ministers)) {
            for (const [regime, reponses] of Object.entries(minister.reponses)) {
                for (const [posture, phrases] of Object.entries(reponses)) {
                    for (const phrase of phrases) {
                        stats[posture].total++;

                        if (phrase.includes('—') || phrase.includes('--')) {
                            stats[posture].tirets++;
                        }
                        if (phrase.includes(',')) {
                            stats[posture].virgules++;
                        }
                        if (phrase.includes('!')) {
                            stats[posture].exclams++;
                        }
                        if (phrase.includes('.') && !phrase.includes('...')) {
                            stats[posture].points++;
                        }
                    }
                }
            }
        }

        // Afficher les stats
        for (const [posture, data] of Object.entries(stats)) {
            console.log(`\n📌 Posture: ${posture} (total: ${data.total} réponses)`);

            if (data.total > 0) {
                console.log(`   Tirets: ${data.tirets} (${Math.round(data.tirets * 100 / data.total)}%)`);
                console.log(`   Virgules: ${data.virgules} (${Math.round(data.virgules * 100 / data.total)}%)`);
                console.log(`   Points d'!: ${data.exclams} (${Math.round(data.exclams * 100 / data.total)}%)`);
                console.log(`   Points: ${data.points} (${Math.round(data.points * 100 / data.total)}%)`);

                process.stdout.write('   💡 Recommandation: ');
                switch(posture) {
                    case 'prudent':
                        console.log('privilégier les virgules (fluidité, retenue)');
                        break;
                    case 'radical':
                        console.log('alterner points et points d\'exclamation');
                        break;
                    case 'statu_quo':
                        console.log('privilégier les points (neutre, stable)');
                        break;
                }
            }
        }

        // Version correction si demandée
        if (process.argv.includes('--fix')) {
            console.log('\n🛠️  Correction automatique...');

            const corrected = JSON.parse(JSON.stringify(data));

            for (const [ministerName, minister] of Object.entries(corrected.ministers)) {
                for (const [regime, reponses] of Object.entries(minister.reponses)) {
                    for (const [posture, phrases] of Object.entries(reponses)) {
                        minister.reponses[regime][posture] = phrases.map(phrase => {
                            if (posture === 'prudent') {
                                return phrase.replace(/ — /g, ', ').replace(/--/g, ', ');
                            } else if (posture === 'radical') {
                                return phrase.replace(/ — /g, '. ').replace(/--/g, '. ');
                            } else {
                                return phrase.replace(/ — /g, '. ').replace(/--/g, '. ');
                            }
                        });
                    }
                }
            }

            fs.writeFileSync(filePath + '.fixed', JSON.stringify(corrected, null, 2));
            console.log('✅ Fichier corrigé créé:', filePath + '.fixed');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

analyzeAriaJSON(jsonPath);
