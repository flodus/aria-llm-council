#!/bin/bash

# Version extrême - reconstruction du JSON
FILE="$1"
BACKUP="${FILE}.backup_$(date +%Y%m%d_%H%M%S)"
cp "$FILE" "$BACKUP"

echo "🔨 Reconstruction forcée du JSON..."

# Utiliser jq pour réparer (plus tolérant)
if command -v jq &> /dev/null; then
    # jq peut souvent réparer les petits problèmes
    if jq . "$FILE" > "${FILE}.fixed" 2>/dev/null; then
        mv "${FILE}.fixed" "$FILE"
        echo "✅ Réparé avec jq !"
    else
        # Si jq échoue, on utilise un parsing plus laxiste
        echo "⚠️  jq échoue, tentative de nettoyage manuel..."

        # Nettoyer le fichier
        cat "$FILE" | \
            # Remplacer les guillemets simples par des doubles
            sed "s/'/\"/g" | \
            # Ajouter des virgules entre les objets
            perl -0777 -pe 's/}\s*{/},{/g' | \
            # Enlever les virgules en trop
            sed 's/,\s*\([]}]\)/\1/g' > "${FILE}.clean"

        # Essayer jq sur la version nettoyée
        if jq . "${FILE}.clean" > "${FILE}.final" 2>/dev/null; then
            mv "${FILE}.final" "$FILE"
            rm "${FILE}.clean"
            echo "✅ Réparé après nettoyage !"
        else
            echo "❌ Échec - Le fichier a des problèmes structurels"
            echo "Regarde la ligne 2610 manuellement"
        fi
    fi
else
    echo "❌ Installe jq pour plus d'options: sudo apt install jq"
fi
