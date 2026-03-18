#!/bin/bash

BASE_DIR="src/features/world/components/CountryPanel/components/timeline"

# Créer le dossier s'il n'existe pas
if [ ! -d "$BASE_DIR" ]; then
    mkdir -p "$BASE_DIR"
    echo "✅ Dossier créé : $BASE_DIR"
else
    echo "⚠️ Le dossier existe déjà : $BASE_DIR"
fi

# Liste des fichiers à créer
FILES=(
    "index.js"
    "TimelineView.jsx"
    "TimelineHeader.jsx"
    "EventList.jsx"
    "EventEntry.jsx"
    "EmptyTimeline.jsx"
)

# Créer chaque fichier s'il n'existe pas
for file in "${FILES[@]}"; do
    if [ ! -f "$BASE_DIR/$file" ]; then
        touch "$BASE_DIR/$file"
        echo "  ✅ Créé : $file"
    else
        echo "  ⚠️ Existe déjà : $file"
    fi
done

# Afficher le résultat final
echo ""
echo "📁 Contenu du dossier :"
ls -la "$BASE_DIR"
