const fs = require('fs');

// Liste des paires de fichiers à comparer
const filesToValidate = [
    { fr: './base_stats.json', en: './base_stats_en.json' },
{ fr: './base_agents.json', en: './base_agents_en.json' }
];

function getKeys(obj, prefix = '') {
    return Object.keys(obj).flatMap(k => {
        const path = prefix ? `${prefix}.${k}` : k;
        return (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k]))
        ? getKeys(obj[k], path)
        : path;
    });
}

filesToValidate.forEach(({ fr, en }) => {
    console.log(`\n--- Validation de ${fr} vs ${en} ---`);
    try {
        const dataFr = JSON.parse(fs.readFileSync(fr, 'utf8'));
        const dataEn = JSON.parse(fs.readFileSync(en, 'utf8'));

        const keysFr = getKeys(dataFr);
        const keysEn = getKeys(dataEn);

        const missingInEn = keysFr.filter(k => !keysEn.includes(k));
        const extraInEn = keysEn.filter(k => !keysFr.includes(k));

        if (missingInEn.length === 0 && extraInEn.length === 0) {
            console.log("✅ Parfaitement synchronisé !");
        } else {
            if (missingInEn.length > 0) console.error("❌ Clés manquantes dans EN :", missingInEn);
            if (extraInEn.length > 0) console.warn("⚠️ Clés en trop dans EN (potentiels oublis FR) :", extraInEn);
        }
    } catch (e) {
        console.error(`Erreur lors de la lecture des fichiers : ${e.message}`);
    }
});
