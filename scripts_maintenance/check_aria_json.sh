#!/bin/bash

# Script de validation et correction de ponctuation pour le JSON ARIA
# Usage: ./scripts_maintenance/check_aria_json.sh <chemin_vers_json>

JSON_FILE="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -f "$JSON_FILE" ]; then
    echo "❌ Fichier non trouvé: $JSON_FILE"
    echo "Usage: $0 <chemin_vers_json>"
    echo "Exemple: $0 data/aria_responses.json"
    exit 1
fi

echo "🔍 Analyse du fichier: $JSON_FILE"
echo "================================="

# Vérification de la validité JSON
if ! jq empty "$JSON_FILE" 2>/dev/null; then
    echo "❌ JSON invalide!"
    exit 1
fi
echo "✅ JSON valide"

# Structure de base
echo -n "📋 Structure _meta: "
jq -r 'if ._meta then "✅ présent" else "❌ manquant" end' "$JSON_FILE"

echo -n "📋 Structure ministers: "
jq -r 'if .ministers then "✅ présent" else "❌ manquant" end' "$JSON_FILE"

# Vérification des régimes
echo -e "\n🏛️  Vérification des régimes:"
jq -r '._meta.regimes[]' "$JSON_FILE" | while read regime; do
    echo -n "   - $regime: "

    # Vérifier présence dans quelques ministres pour échantillon
    found=$(jq --arg r "$regime" '
        .ministers | with_entries(
            select(.value.reponses | has($r))
        ) | keys | length
    ' "$JSON_FILE")

    if [ "$found" -gt 0 ]; then
        echo "✅ présent dans $found ministres"
    else
        echo "⚠️  absent"
    fi
done

# Analyse des réponses par posture
echo -e "\n📊 Analyse des réponses par posture:"
declare -A stats

# Initialisation
for posture in "prudent" "radical" "statu_quo"; do
    stats["${posture}_total"]=0
    stats["${posture}_tirets"]=0
    stats["${posture}_virgules"]=0
    stats["${posture}_exclamations"]=0
    stats["${posture}_points"]=0
done

# Collecter les stats
jq -r '
    .ministers | to_entries[] | .key as $minister |
    .value.reponses | to_entries[] | .key as $regime |
    .value | to_entries[] |
    "\($minister)|\($regime)|\(.key)|\(.value[])"
' "$JSON_FILE" | while IFS='|' read minister regime posture phrase; do

    # Compter par posture
    stats["${posture}_total"]=$((stats["${posture}_total"] + 1))

    # Détection des tirets
    if [[ "$phrase" == *"—"* ]] || [[ "$phrase" == *"--"* ]]; then
        stats["${posture}_tirets"]=$((stats["${posture}_tirets"] + 1))
    fi

    # Détection des virgules
    if [[ "$phrase" == *","* ]]; then
        stats["${posture}_virgules"]=$((stats["${posture}_virgules"] + 1))
    fi

    # Détection des points d'exclamation
    if [[ "$phrase" == *"!"* ]]; then
        stats["${posture}_exclamations"]=$((stats["${posture}_exclamations"] + 1))
    fi

    # Détection des points
    if [[ "$phrase" == *"."* ]] && [[ "$phrase" != *"..."* ]]; then
        stats["${posture}_points"]=$((stats["${posture}_points"] + 1))
    fi
done

# Afficher les stats
for posture in "prudent" "radical" "statu_quo"; do
    total=${stats["${posture}_total"]}
    echo -e "\n📌 Posture: $posture (total: $total réponses)"

    if [ "$total" -gt 0 ]; then
        tirets=$((stats["${posture}_tirets"]))
        virgules=$((stats["${posture}_virgules"]))
        exclams=$((stats["${posture}_exclamations"]))
        points=$((stats["${posture}_points"]))

        echo "   Tirets: $tirets ($((tirets * 100 / total))%)"
        echo "   Virgules: $virgules ($((virgules * 100 / total))%)"
        echo "   Points d'!: $exclams ($((exclams * 100 / total))%)"
        echo "   Points: $points ($((points * 100 / total))%)"

        # Recommandation
        echo -n "   💡 Recommandation: "
        case "$posture" in
            "prudent")
                echo "privilégier les virgules (fluidité, retenue)"
                ;;
            "radical")
                echo "alterner points et points d'exclamation"
                ;;
            "statu_quo")
                echo "privilégier les points (neutre, stable)"
                ;;
        esac
    fi
done

# Vérification des fallbacks
echo -e "\n🔄 Vérification des fallbacks:"
jq -r '._meta.fallbacks | to_entries[] | "\(.key) -> \(.value)"' "$JSON_FILE" | while read line; do
    echo "   ✅ $line"
done

# Fonction de correction (optionnelle avec --fix)
if [ "$2" == "--fix" ]; then
    echo -e "\n🛠️  Application des corrections de ponctuation..."

    # Créer une copie de sauvegarde
    cp "$JSON_FILE" "${JSON_FILE}.backup"

    # Appliquer les corrections selon les règles
    jq '
        def correct_phrase(phrase; posture):
            if posture == "prudent" then
                # Remplacer les tirets par des virgules
                gsub(" — "; ", ") |
                gsub("--"; ", ")
            elif posture == "radical" then
                # Remplacer les tirets par des points ou !
                gsub(" — "; ". ") |
                gsub("--"; ". ")
            elif posture == "statu_quo" then
                # Remplacer les tirets par des points
                gsub(" — "; ". ") |
                gsub("--"; ". ")
            else
                .
            end
        ;

        .ministers |= with_entries(
            .value.reponses |= with_entries(
                .value |= with_entries(
                    .key as $posture |
                    .value |= map(correct_phrase(.; $posture))
                )
            )
        )
    ' "${JSON_FILE}.backup" > "$JSON_FILE"

    echo "✅ Corrections appliquées (sauvegarde: ${JSON_FILE}.backup)"
fi

echo -e "\n✅ Analyse terminée"
