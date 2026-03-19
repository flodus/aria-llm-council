#!/bin/bash

# Script: count_lines.sh
# Usage: ./count_lines.sh

WARNING_THRESHOLD=400
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction pour compter et afficher
count_and_show() {
    local dir=$1
    local title=$2
    local exclude_pattern=$3

    echo "$title"
    echo "$(printf '%0.s-' {1..50})"

    find "$dir" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) -not -empty | while read file; do
        # Exclure si pattern spécifié
        if [ -n "$exclude_pattern" ] && [[ "$file" == $exclude_pattern ]]; then
            continue
        fi
        lines=$(wc -l < "$file")
        echo "$lines|$file"
    done | sort -nr | while IFS='|' read -r lines file; do
        if [ "$lines" -gt "$WARNING_THRESHOLD" ]; then
            echo -e "${RED}⚠️ $lines  $file${NC}"
        else
            echo "   $lines  $file"
        fi
    done
    echo ""
}

# Exécution
count_and_show "src" "📊 Fichiers dans src/ (hors features/shared) :" "src/features/*|src/shared/*"
count_and_show "src/features" "📊 Fichiers dans src/features/ :"
count_and_show "src/shared" "📊 Fichiers dans src/shared/ :"

# Résumé
echo "📊 RÉSUMÉ GLOBAL"
echo "================"
echo "src/ (hors features/shared) : $(find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) -not -empty | grep -v "src/features/\|src/shared/" | wc -l) fichiers"
echo "src/features/              : $(find src/features -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) -not -empty | wc -l) fichiers"
echo "src/shared/                 : $(find src/shared -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) -not -empty | wc -l) fichiers"
