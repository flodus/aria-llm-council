#!/bin/bash

# Corriger tous les fichiers qui importent ariaI18n avec 5 niveaux
find src/features/world/components/CountryPanel -type f -name "*.jsx" | while read file; do
    # Remplacer 5 niveaux par 4 niveaux
    sed -i 's|from ['\''"]\.\./\.\./\.\./\.\.\./ariaI18n|from '\''../../../ariaI18n|g' "$file"
    echo "✅ Corrigé: $file"
done

# Vérification qu'il ne reste pas d'erreurs
echo ""
echo "🔍 Vérification des imports restants:"
grep -r "\.\./\.\./\.\./\.\.\." src/features/world/components/CountryPanel/ --include="*.jsx"
