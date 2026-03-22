#!/bin/bash
# Script : count_lines.sh
# Emplacement : ~/aria/scripts_maintenance/count_lines.sh
# Usage : ./count_lines.sh

# Détection automatique des chemins
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SOURCE_DIR="$PROJECT_DIR/src"

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Si src n'existe pas, chercher dans le répertoire courant
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Dossier src non trouvé dans : $SOURCE_DIR${NC}"
    echo "Recherche depuis le répertoire actuel..."
    
    # Chercher un dossier src dans l'arborescence
    SOURCE_DIR=$(find "$PROJECT_DIR" -type d -name "src" -print -quit 2>/dev/null)
    
    if [ -z "$SOURCE_DIR" ]; then
        echo -e "${RED}❌ Impossible de trouver un dossier src${NC}"
        exit 1
    fi
fi

# Fichiers de sortie
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
# RAPPORT_COMPLET="$SCRIPT_DIR/rapport_complet_$TIMESTAMP.txt"  # ← COMMENTÉ : Rapport complet avec tous les fichiers
RAPPORT_ALERTES_WARNINGS="$SCRIPT_DIR/rapport_alertes_warnings_$TIMESTAMP.txt"

# ============================================================================
# PARTIE RAPPORT COMPLET - COMMENTÉE (à décommenter si besoin un jour)
# ============================================================================
# # En-tête du rapport complet
# echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}" | tee "$RAPPORT_COMPLET"
# echo -e "${CYAN}${BOLD}║              RAPPORT DE COMPTE DE LIGNES - A.R.I.A              ║${NC}" | tee -a "$RAPPORT_COMPLET"
# echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}" | tee -a "$RAPPORT_COMPLET"
# echo -e "${GREEN}📅 Date : $(date)${NC}" | tee -a "$RAPPORT_COMPLET"
# echo -e "${GREEN}📁 Source : $SOURCE_DIR${NC}" | tee -a "$RAPPORT_COMPLET"
# echo "" | tee -a "$RAPPORT_COMPLET"
# ============================================================================

# Initialiser le rapport unique alertes + warnings
echo "╔════════════════════════════════════════════════════════════════╗" > "$RAPPORT_ALERTES_WARNINGS"
echo "║     🔴 ALERTES (fichiers > 800 lignes) + ⚠️ AVERTISSEMENTS     ║" >> "$RAPPORT_ALERTES_WARNINGS"
echo "║              (fichiers 400-800 lignes)                         ║" >> "$RAPPORT_ALERTES_WARNINGS"
echo "╚════════════════════════════════════════════════════════════════╝" >> "$RAPPORT_ALERTES_WARNINGS"
echo "📅 Date : $(date)" >> "$RAPPORT_ALERTES_WARNINGS"
echo "📁 Source : $SOURCE_DIR" >> "$RAPPORT_ALERTES_WARNINGS"
echo "" >> "$RAPPORT_ALERTES_WARNINGS"

# Vérifier que le dossier source existe
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Erreur : Dossier source introuvable : $SOURCE_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

echo -e "${BLUE}🔍 ANALYSE EN COURS...${NC}"
echo ""

# Fichier temporaire pour stocker tous les résultats
TEMP_DATA=$(mktemp)
ALERTES_TEMP=$(mktemp)
WARNINGS_TEMP=$(mktemp)

# Compteurs
alertes_count=0
warnings_count=0

# Fonction pour compter les lignes d'un fichier et écrire dans le fichier temporaire
compter_et_ecrire() {
    local fichier=$1
    local lignes=$(wc -l < "$fichier" 2>/dev/null | tr -d ' ')
    local rel_path=$(realpath --relative-to="$PROJECT_DIR" "$fichier" 2>/dev/null || echo "$fichier")
    local dossier=$(dirname "$rel_path")
    
    if [ -n "$lignes" ] && [ "$lignes" -gt 0 ]; then
        echo "$dossier|$lignes|$rel_path" >> "$TEMP_DATA"
        
        # Stocker dans les fichiers temporaires d'alertes/warnings
        local filename=$(basename "$rel_path")
        if [ "$lignes" -gt 800 ]; then
            echo "$lignes|$filename|$dossier" >> "$ALERTES_TEMP"
            alertes_count=$((alertes_count + 1))
        elif [ "$lignes" -gt 400 ]; then
            echo "$lignes|$filename|$dossier" >> "$WARNINGS_TEMP"
            warnings_count=$((warnings_count + 1))
        fi
    fi
}

# 1. Traiter le dossier racine src/ (uniquement les fichiers directement dedans)
if [ -d "$SOURCE_DIR" ]; then
    while IFS= read -r fichier; do
        compter_et_ecrire "$fichier"
    done < <(find "$SOURCE_DIR" -maxdepth 1 -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.c" -o -name "*.cpp" -o -name "*.h" -o -name "*.hpp" -o -name "*.rb" -o -name "*.php" -o -name "*.go" -o -name "*.rs" -o -name "*.sh" \) 2>/dev/null)
fi

# 2. Traiter src/features/ (uniquement les fichiers directement dans features/)
if [ -d "$SOURCE_DIR/features" ]; then
    while IFS= read -r fichier; do
        compter_et_ecrire "$fichier"
    done < <(find "$SOURCE_DIR/features" -maxdepth 1 -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.c" -o -name "*.cpp" -o -name "*.h" -o -name "*.hpp" -o -name "*.rb" -o -name "*.php" -o -name "*.go" -o -name "*.rs" -o -name "*.sh" \) 2>/dev/null)
fi

# 3. Traiter chaque sous-dossier de src/features/ RÉCURSIVEMENT
if [ -d "$SOURCE_DIR/features" ]; then
    while IFS= read -r sous_dossier; do
        while IFS= read -r fichier; do
            compter_et_ecrire "$fichier"
        done < <(find "$sous_dossier" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.c" -o -name "*.cpp" -o -name "*.h" -o -name "*.hpp" -o -name "*.rb" -o -name "*.php" -o -name "*.go" -o -name "*.rs" -o -name "*.sh" \) 2>/dev/null)
    done < <(find "$SOURCE_DIR/features" -mindepth 1 -maxdepth 1 -type d)
fi

# 4. Traiter les autres dossiers de src/ (à part features) avec maxdepth 2
while IFS= read -r dossier; do
    while IFS= read -r fichier; do
        compter_et_ecrire "$fichier"
    done < <(find "$dossier" -maxdepth 2 -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.c" -o -name "*.cpp" -o -name "*.h" -o -name "*.hpp" -o -name "*.rb" -o -name "*.php" -o -name "*.go" -o -name "*.rs" -o -name "*.sh" \) 2>/dev/null)
done < <(find "$SOURCE_DIR" -mindepth 1 -maxdepth 1 -type d ! -name "features")

# Construire le rapport unique alertes + warnings
echo "┌─────────────────────────────────────────────────────────────────────────────────────────────┐" >> "$RAPPORT_ALERTES_WARNINGS"
echo "│ 🔴 ALERTES (fichiers > 800 lignes)                                                         │" >> "$RAPPORT_ALERTES_WARNINGS"
echo "├─────┬─────────┬───────────────────────────────────────────────────┬─────────────────────────┤" >> "$RAPPORT_ALERTES_WARNINGS"
echo "│  #  │ LIGNES  │ FICHIER                                           │ DOSSIER                 │" >> "$RAPPORT_ALERTES_WARNINGS"
echo "├─────┼─────────┼───────────────────────────────────────────────────┼─────────────────────────┤" >> "$RAPPORT_ALERTES_WARNINGS"

if [ -s "$ALERTES_TEMP" ]; then
    sort -t'|' -k1 -rn "$ALERTES_TEMP" | nl -w3 -s'│' | while IFS='│' read num lignes filename dossier; do
        printf "│ %3s │ %7s │ %-49s │ %-23s │\n" "$num" "$lignes" "${filename:0:49}" "${dossier:0:23}" >> "$RAPPORT_ALERTES_WARNINGS"
    done
else
    echo "│                              ✅ AUCUNE ALERTE DÉTECTÉE                                   │" >> "$RAPPORT_ALERTES_WARNINGS"
fi

echo "├─────┴─────────┴───────────────────────────────────────────────────┴─────────────────────────┤" >> "$RAPPORT_ALERTES_WARNINGS"
echo "│ ⚠️ AVERTISSEMENTS (fichiers 400-800 lignes)                                                │" >> "$RAPPORT_ALERTES_WARNINGS"
echo "├─────┬─────────┬───────────────────────────────────────────────────┬─────────────────────────┤" >> "$RAPPORT_ALERTES_WARNINGS"
echo "│  #  │ LIGNES  │ FICHIER                                           │ DOSSIER                 │" >> "$RAPPORT_ALERTES_WARNINGS"
echo "├─────┼─────────┼───────────────────────────────────────────────────┼─────────────────────────┤" >> "$RAPPORT_ALERTES_WARNINGS"

if [ -s "$WARNINGS_TEMP" ]; then
    sort -t'|' -k1 -rn "$WARNINGS_TEMP" | nl -w3 -s'│' | while IFS='│' read num lignes filename dossier; do
        printf "│ %3s │ %7s │ %-49s │ %-23s │\n" "$num" "$lignes" "${filename:0:49}" "${dossier:0:23}" >> "$RAPPORT_ALERTES_WARNINGS"
    done
else
    echo "│                            ✅ AUCUN AVERTISSEMENT DÉTECTÉ                                │" >> "$RAPPORT_ALERTES_WARNINGS"
fi

echo "└─────┴─────────┴───────────────────────────────────────────────────┴─────────────────────────┘" >> "$RAPPORT_ALERTES_WARNINGS"
echo "" >> "$RAPPORT_ALERTES_WARNINGS"
echo "📊 RÉSUMÉ :" >> "$RAPPORT_ALERTES_WARNINGS"
echo "   🔴 Alertes (800+ lignes) : $alertes_count fichier(s)" >> "$RAPPORT_ALERTES_WARNINGS"
echo "   ⚠️ Avertissements (400-800 lignes) : $warnings_count fichier(s)" >> "$RAPPORT_ALERTES_WARNINGS"
echo "   📁 Total fichiers analysés : $(wc -l < "$TEMP_DATA")" >> "$RAPPORT_ALERTES_WARNINGS"
echo "   📝 Total lignes : $(awk -F'|' '{sum+=$2} END {print sum}' "$TEMP_DATA")" >> "$RAPPORT_ALERTES_WARNINGS"

# ============================================================================
# PARTIE RAPPORT COMPLET PAR DOSSIER - COMMENTÉE (à décommenter si besoin un jour)
# ============================================================================
# echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}" | tee -a "$RAPPORT_COMPLET"
# echo -e "${CYAN}${BOLD}║                    RÉSULTATS PAR DOSSIER                        ║${NC}" | tee -a "$RAPPORT_COMPLET"
# echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}" | tee -a "$RAPPORT_COMPLET"
# echo "" | tee -a "$RAPPORT_COMPLET"
# 
# # Grouper par dossier et afficher
# awk -F'|' '{print $1"|"$2"|"$3}' "$TEMP_DATA" | sort -t'|' -k1,1 -k2,2rn | while IFS='|' read dossier lignes fichier; do
#     if [ "$dossier" != "$current_dossier" ]; then
#         if [ -n "$current_dossier" ]; then
#             echo "" | tee -a "$RAPPORT_COMPLET"
#             printf "${CYAN}📊 Sous-total %s : ${GREEN}%s fichiers${NC}, ${BLUE}%s lignes${NC}" "$current_dossier" "$fichier_count" "$lignes_count" | tee -a "$RAPPORT_COMPLET"
#             echo "" | tee -a "$RAPPORT_COMPLET"
#             if [ "$alertes_dossier" -gt 0 ] || [ "$warnings_dossier" -gt 0 ]; then
#                 echo -e "   ${RED}🔴 Alertes: $alertes_dossier${NC} | ${YELLOW}⚠️ Avertissements: $warnings_dossier${NC}" | tee -a "$RAPPORT_COMPLET"
#             fi
#             echo "" | tee -a "$RAPPORT_COMPLET"
#         fi
#         
#         current_dossier="$dossier"
#         fichier_count=0
#         lignes_count=0
#         alertes_dossier=0
#         warnings_dossier=0
#         
#         echo -e "${MAGENTA}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$RAPPORT_COMPLET"
#         echo -e "${CYAN}📁 DOSSIER : ${BOLD}$dossier${NC}" | tee -a "$RAPPORT_COMPLET"
#         echo -e "${MAGENTA}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$RAPPORT_COMPLET"
#     fi
#     
#     filename=$(basename "$fichier")
#     if [ "$lignes" -gt 800 ]; then
#         echo -e "   ${RED}🔴 ALERTE   : ${BOLD}$lignes${NC} lignes - $filename" | tee -a "$RAPPORT_COMPLET"
#         alertes_dossier=$((alertes_dossier + 1))
#     elif [ "$lignes" -gt 400 ]; then
#         echo -e "   ${YELLOW}⚠️  AVERTISSEMENT : ${BOLD}$lignes${NC} lignes - $filename" | tee -a "$RAPPORT_COMPLET"
#         warnings_dossier=$((warnings_dossier + 1))
#     else
#         echo -e "   ${GREEN}✓${NC} $lignes lignes - $filename" | tee -a "$RAPPORT_COMPLET"
#     fi
#     
#     fichier_count=$((fichier_count + 1))
#     lignes_count=$((lignes_count + lignes))
# done
# 
# # Afficher le dernier dossier
# if [ -n "$current_dossier" ]; then
#     echo "" | tee -a "$RAPPORT_COMPLET"
#     printf "${CYAN}📊 Sous-total %s : ${GREEN}%s fichiers${NC}, ${BLUE}%s lignes${NC}" "$current_dossier" "$fichier_count" "$lignes_count" | tee -a "$RAPPORT_COMPLET"
#     echo "" | tee -a "$RAPPORT_COMPLET"
#     if [ "$alertes_dossier" -gt 0 ] || [ "$warnings_dossier" -gt 0 ]; then
#         echo -e "   ${RED}🔴 Alertes: $alertes_dossier${NC} | ${YELLOW}⚠️ Avertissements: $warnings_dossier${NC}" | tee -a "$RAPPORT_COMPLET"
#     fi
# fi
# 
# # Résumé général dans le rapport complet
# echo "" | tee -a "$RAPPORT_COMPLET"
# echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}" | tee -a "$RAPPORT_COMPLET"
# echo -e "${CYAN}${BOLD}║                     RÉSUMÉ GÉNÉRAL                              ║${NC}" | tee -a "$RAPPORT_COMPLET"
# echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}" | tee -a "$RAPPORT_COMPLET"
# 
# total_fichiers=$(wc -l < "$TEMP_DATA")
# total_lignes=$(awk -F'|' '{sum+=$2} END {print sum}' "$TEMP_DATA")
# 
# echo -e "${GREEN}✅ Total fichiers analysés : ${BOLD}$total_fichiers${NC}" | tee -a "$RAPPORT_COMPLET"
# echo -e "${BLUE}📊 Total lignes : ${BOLD}$total_lignes${NC}" | tee -a "$RAPPORT_COMPLET"
# echo -e "${RED}🔴 Alertes (800+ lignes) : ${BOLD}$alertes_count${NC}" | tee -a "$RAPPORT_COMPLET"
# echo -e "${YELLOW}⚠️  Avertissements (400-800 lignes) : ${BOLD}$warnings_count${NC}" | tee -a "$RAPPORT_COMPLET"
# ============================================================================

# Afficher les rapports générés
echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║                   RAPPORTS GÉNÉRÉS                              ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo -e "${YELLOW}📋 Rapport alertes + avertissements : ${BOLD}$RAPPORT_ALERTES_WARNINGS${NC}"

# Afficher un aperçu des alertes
if [ "$alertes_count" -gt 0 ]; then
    echo ""
    echo -e "${RED}${BOLD}🔴 TOP 10 DES ALERTES :${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    sort -t'|' -k1 -rn "$ALERTES_TEMP" | head -10 | while IFS='|' read lignes filename dossier; do
        printf "   ${RED}🔴${NC} %6s lignes - ${BOLD}%-35s${NC} (%s)\n" "$lignes" "$filename" "$dossier"
    done
fi

# Afficher un aperçu des avertissements
if [ "$warnings_count" -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}${BOLD}⚠️  TOP 10 DES AVERTISSEMENTS :${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    sort -t'|' -k1 -rn "$WARNINGS_TEMP" | head -10 | while IFS='|' read lignes filename dossier; do
        printf "   ${YELLOW}⚠️${NC}  %6s lignes - ${BOLD}%-35s${NC} (%s)\n" "$lignes" "$filename" "$dossier"
    done
fi

echo ""
echo -e "${GREEN}✨ Analyse terminée !${NC}"

# Nettoyer
rm -f "$TEMP_DATA" "$ALERTES_TEMP" "$WARNINGS_TEMP"
