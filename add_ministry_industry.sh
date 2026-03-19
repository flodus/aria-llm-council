#!/bin/bash

# Script: add_ministry_industry.sh
# Usage: ./add_ministry_industry.sh
# Description: Ajoute les keywords et le ministère Industrie dans base_agents.json et base_agents_en.json
# Sauvegarde les originaux en .bak

set -e  # Arrêt en cas d'erreur

echo "🚀 Début du script d'ajout du ministère Industrie"
echo "================================================"

# Vérification présence fichiers
for file in templates/base_agents.json templates/base_agents_en.json; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier $file introuvable !"
        exit 1
    fi
done

# Fonction de backup
backup_file() {
    local file=$1
    local backup="${file}.bak.$(date +%Y%m%d_%H%M%S)"
    cp "$file" "$backup"
    echo "✅ Backup créé: $backup"
}

# ============================================================
# 1. TRAITEMENT DE base_agents.json (FR)
# ============================================================
echo ""
echo "📦 Traitement de base_agents.json..."

backup_file "templates/base_agents.json"

# Ajouter les keywords (déjà présents dans ton fichier, mais vérification)
echo "   ✓ Keywords déjà présents dans base_agents.json"

# Ajouter le ministère INDUSTRIE (à la fin du tableau "ministries")
# Version avec guillemets simples pour éviter les problèmes d'échappement
jq '.ministries += [{
  "id": "industrie",
  "name": "Industrie et Infrastructures",
  "emoji": "⚙️",
  "signs": "Capricorne – Verseau – Vierge",
  "color": "#7F8C8D",
  "mission": "Animer le système circulatoire et productif de la nation en modernisant les infrastructures pour une efficacité maximale.",
  "weight": 1,
  "ministers": ["stratege", "inventeur", "analyste"],
  "ministerPrompts": {
    "inventeur": "Optimise les chaînes logistiques pour une croissance durable.",
    "stratege": "Renforce les réseaux critiques pour garantir notre avance.",
    "analyste": "Audite chaque flux de production pour éliminer le gaspillage et maximiser l efficience."
  },
  "keywords": [
    "usine", "production", "réseau", "numérique", "infrastructure",
    "construction", "logistique", "transports", "industrie", "manufacture",
    "chaîne", "approvisionnement", "énergie", "réseau électrique", "télécom",
    "robotique", "automatisation", "machine", "outil", "équipement"
  ]
}]' templates/base_agents.json > templates/base_agents.json.tmp

mv templates/base_agents.json.tmp templates/base_agents.json
echo "   ✓ Ministère INDUSTRIE ajouté à base_agents.json"

# ============================================================
# 2. TRAITEMENT DE base_agents_en.json (EN)
# ============================================================
echo ""
echo "📦 Traitement de base_agents_en.json..."

backup_file "templates/base_agents_en.json"

# Ajouter le ministère INDUSTRIE en anglais
jq '.ministries += [{
  "id": "industrie",
  "name": "Industry & Infrastructure",
  "emoji": "⚙️",
  "signs": "Capricorn – Aquarius – Virgo",
  "color": "#7F8C8D",
  "mission": "Drive the circulatory and productive system of the nation by modernizing infrastructure for maximum efficiency.",
  "weight": 1,
  "ministers": ["stratege", "inventeur", "analyste"],
  "ministerPrompts": {
    "inventeur": "Optimize supply chains for sustainable growth.",
    "stratege": "Strengthen critical networks to guarantee our lead.",
    "analyste": "Audit every production flow to eliminate waste and maximize efficiency."
  },
  "keywords": [
    "factory", "production", "network", "digital", "infrastructure",
    "construction", "logistics", "transportation", "industry", "manufacturing",
    "supply chain", "energy", "power grid", "telecom", "robotics",
    "automation", "machine", "tool", "equipment"
  ]
}]' templates/base_agents_en.json > templates/base_agents_en.json.tmp

mv templates/base_agents_en.json.tmp templates/base_agents_en.json
echo "   ✓ Ministère INDUSTRIE ajouté à base_agents_en.json"

# ============================================================
# 3. VÉRIFICATION FINALE
# ============================================================
echo ""
echo "🔍 Vérification finale:"

# Compter le nombre de ministères
FR_COUNT=$(jq '.ministries | length' templates/base_agents.json)
EN_COUNT=$(jq '.ministries | length' templates/base_agents_en.json)

echo "   base_agents.json contient maintenant $FR_COUNT ministères"
echo "   base_agents_en.json contient maintenant $EN_COUNT ministères"

# Vérifier que le ministère industrie est bien présent
if jq -e '.ministries[] | select(.id=="industrie")' templates/base_agents.json > /dev/null 2>&1; then
    echo "   ✅ INDUSTRIE présent dans base_agents.json"
else
    echo "   ❌ INDUSTRIE absent de base_agents.json"
fi

if jq -e '.ministries[] | select(.id=="industrie")' templates/base_agents_en.json > /dev/null 2>&1; then
    echo "   ✅ INDUSTRIE présent dans base_agents_en.json"
else
    echo "   ❌ INDUSTRIE absent de base_agents_en.json"
fi

# ============================================================
# 4. CLEANUP
# ============================================================
echo ""
echo "🧹 Nettoyage des fichiers temporaires..."
rm -f templates/*.tmp

echo ""
echo "✨ Script terminé avec succès !"
echo "📂 Backups disponibles:"
ls -la templates/*.bak.* 2>/dev/null || echo "   Aucun backup (pas nécessaire)"
