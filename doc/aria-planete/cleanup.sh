#!/bin/bash

echo "🧹 Nettoyage du projet Low-Poly Planet..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction pour supprimer un fichier
delete_file() {
  if [ -f "$1" ]; then
    rm "$1"
    echo -e "${RED}🗑️  Supprimé: $1${NC}"
  fi
}

# Fonction pour supprimer un dossier s'il est vide
delete_empty_dir() {
  if [ -d "$1" ] && [ -z "$(ls -A "$1")" ]; then
    rmdir "$1"
    echo -e "${RED}📁 Supprimé dossier vide: $1${NC}"
  fi
}

echo -e "${BLUE}🔍 Recherche des fichiers à nettoyer...${NC}"

# Supprimer les anciens fichiers de données (maintenant on utilise world.js)
delete_file "src/data/continents.js"
delete_file "src/data/pangea.js"
delete_file "src/data/coordinates.js"

# Supprimer les anciens fichiers utils
delete_file "src/utils/coordinates.js"
delete_file "src/utils/projections.js"
delete_file "src/utils/geometry.js"
delete_file "src/utils/textures.js"

# Supprimer les anciens composants
delete_file "src/components/planet/Atmosphere.jsx"
delete_file "src/components/planet/Continent.jsx"
delete_file "src/components/planet/Country.jsx"
delete_file "src/components/planet/Ocean.jsx"

# Supprimer les anciennes vues
delete_file "src/components/views/GlobeView.jsx.bak"
delete_file "src/components/views/MercatorView.jsx.bak"

# Supprimer les dossiers devenus vides
delete_empty_dir "src/components/planet"
delete_empty_dir "src/components/ui"  # Si on a déplacé les boutons dans App.jsx
delete_empty_dir "src/data"
delete_empty_dir "src/utils"
delete_empty_dir "src/components/views"
delete_empty_dir "src/components"
delete_empty_dir "src"

echo -e "${GREEN}✅ Nettoyage terminé !${NC}"
echo -e "${BLUE}📁 Structure actuelle :${NC}"
tree src -I node_modules --dirsfirst 2>/dev/null || echo "   (installe tree pour voir la structure: brew install tree ou apt-get install tree)"

echo -e "${GREEN}🚀 Plus que le clic sur le globe à implémenter !${NC}"
