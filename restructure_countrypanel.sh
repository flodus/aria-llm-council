#!/bin/bash

# Script de restructuration de CountryPanel
# Se placer à la racine du projet (/var/home/bazzite/aria)

set -e

echo "🚀 Restructuration de CountryPanel (version plate)"
echo "--------------------------------------------------"

# 1. Sauvegarde
echo "📦 Sauvegarde de l'existant..."
BACKUP_DIR="src/features/world/components/CountryPanel.bak.$(date +%Y%m%d_%H%M%S)"
cp -r src/features/world/components/CountryPanel "$BACKUP_DIR"
echo "✅ Sauvegarde créée: $BACKUP_DIR"

# 2. Créer la nouvelle structure
echo "📁 Création des dossiers..."
mkdir -p src/features/world/components/CountryPanel/map
mkdir -p src/features/world/components/CountryPanel/council
mkdir -p src/features/world/components/CountryPanel/timeline

# 3. S'assurer que les dossiers world/hooks et world/utils existent
mkdir -p src/features/world/hooks
mkdir -p src/features/world/utils

# 4. Déplacer les hooks vers world/hooks/
echo "🔧 Déplacement des hooks vers world/hooks/..."
if [ -d "src/features/world/components/CountryPanel/hooks" ]; then
    cp src/features/world/components/CountryPanel/hooks/* src/features/world/hooks/ 2>/dev/null || true
    echo "  ✅ Hooks déplacés"
fi

# 5. Déplacer les utils vers world/utils/
echo "🛠️ Déplacement des utils vers world/utils/..."
if [ -d "src/features/world/components/CountryPanel/utils" ]; then
    cp src/features/world/components/CountryPanel/utils/* src/features/world/utils/ 2>/dev/null || true
    echo "  ✅ Utils déplacés"
fi

# 6. Déplacer les composants principaux
echo "📦 Déplacement des composants principaux..."

# Si la nouvelle structure existe déjà (CountryPanel_new)
if [ -d "src/features/world/components/CountryPanel_new" ]; then
    cp src/features/world/components/CountryPanel_new/components/CountryPanel.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel_new/components/CountryPanelEmpty.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel_new/components/CountryPanelHeader.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel_new/components/CountryPanelNavArrows.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel_new/components/CountryPanelTabs.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel_new/components/CountryPanelMap.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel_new/components/CountryPanelCouncil.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel_new/components/CountryPanelTimeline.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true

    # Déplacer les sous-composants
    cp -r src/features/world/components/CountryPanel_new/components/map/* src/features/world/components/CountryPanel/map/ 2>/dev/null || true
    cp -r src/features/world/components/CountryPanel_new/components/council/* src/features/world/components/CountryPanel/council/ 2>/dev/null || true
    cp -r src/features/world/components/CountryPanel_new/components/timeline/* src/features/world/components/CountryPanel/timeline/ 2>/dev/null || true
else
    # Sinon, prendre depuis la structure actuelle
    cp src/features/world/components/CountryPanel/components/CountryPanel.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel/components/CountryPanelEmpty.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel/components/CountryPanelHeader.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel/components/CountryPanelNavArrows.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel/components/CountryPanelTabs.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel/components/CountryPanelMap.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel/components/CountryPanelCouncil.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true
    cp src/features/world/components/CountryPanel/components/CountryPanelTimeline.jsx src/features/world/components/CountryPanel/ 2>/dev/null || true

    # Déplacer les sous-composants
    cp -r src/features/world/components/CountryPanel/components/map/* src/features/world/components/CountryPanel/map/ 2>/dev/null || true
    cp -r src/features/world/components/CountryPanel/components/council/* src/features/world/components/CountryPanel/council/ 2>/dev/null || true
    cp -r src/features/world/components/CountryPanel/components/timeline/* src/features/world/components/CountryPanel/timeline/ 2>/dev/null || true
fi

# 7. Correction automatique des imports
echo "🔧 Correction des imports dans tous les fichiers..."

find src/features/world/components/CountryPanel -type f -name "*.jsx" | while read file; do
    echo "  ↳ $file"

    # Compter la profondeur pour calculer le chemin vers src/
    rel_path=${file#src/features/world/components/CountryPanel/}
    depth=$(echo "$rel_path" | tr -cd '/' | wc -c)

    # hooks et utils sont maintenant dans world/ (2 niveaux au-dessus)
    if [[ $depth -eq 0 ]]; then
        # Fichier à la racine de CountryPanel/
        sed -i "s|from ['\"]\./hooks/|from '../../hooks/|g" "$file"
        sed -i "s|from ['\"]\./utils/|from '../../utils/|g" "$file"
    elif [[ $depth -eq 1 ]]; then
        # Fichier dans map/, council/, timeline/
        sed -i "s|from ['\"]\.\./hooks/|from '../../../hooks/|g" "$file"
        sed -i "s|from ['\"]\.\./utils/|from '../../../utils/|g" "$file"
    fi

    # Corriger les imports de shared/theme et ariaI18n
    sed -i "s|from ['\"]\.\./\.\./\.\./\.\./\.\./\.\./shared/theme|from '../../../../shared/theme|g" "$file"
    sed -i "s|from ['\"]\.\./\.\./\.\./\.\./\.\./\.\./ariaI18n|from '../../../../ariaI18n|g" "$file"
    sed -i "s|from ['\"]\.\./\.\./\.\./\.\./\.\./\.\./llmCouncilEngine|from '../../../../llmCouncilEngine|g" "$file"
done

# 8. Nettoyage des dossiers vides
echo "🧹 Nettoyage..."
rm -rf src/features/world/components/CountryPanel/hooks 2>/dev/null || true
rm -rf src/features/world/components/CountryPanel/utils 2>/dev/null || true
rm -rf src/features/world/components/CountryPanel/components 2>/dev/null || true
rm -rf src/features/world/components/CountryPanel_new 2>/dev/null || true

# 9. Résultat final
echo ""
echo "✅ Restructuration terminée !"
echo "--------------------------------------------------"
echo "Nouvelle structure :"
echo ""
tree src/features/world/components/CountryPanel -L 2
echo ""
echo "📁 Hooks déplacés dans : src/features/world/hooks/"
echo "📁 Utils déplacés dans : src/features/world/utils/"
echo ""
echo "⚠️  Vérifiez dans App.jsx :"
echo "   import CountryPanel from './features/world/components/CountryPanel/CountryPanel';"
echo "   import CountryPanelEmpty from './features/world/components/CountryPanel/CountryPanelEmpty';"
