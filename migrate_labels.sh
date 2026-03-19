#!/bin/bash

cd src

find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" \) | while read -r file; do
    clean_path="${file#./}"

    # Lire la première ligne
    first_line=$(head -n 1 "$file")

    # Créer fichier temporaire
    tmp_file="${file}.tmp"

    # Écrire le commentaire
    echo "// src/${clean_path}" > "$tmp_file"

    # Ajouter UNE seule ligne vide
    echo "" >> "$tmp_file"

    # Trouver la première ligne non vide après l'éventuel commentaire
    if [[ "$first_line" =~ ^//[[:space:]]*[a-zA-Z0-9_/.-]+\.(js|jsx|json)$ ]] || [[ "$first_line" =~ ^/\*[[:space:]]*[a-zA-Z0-9_/.-]+[[:space:]]*\*/$ ]]; then
        # On a remplacé le commentaire, on cherche la première ligne non vide après
        line_num=2
        while IFS= read -r line; do
            if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*$ ]]; then
                break
            fi
            ((line_num++))
        done < <(tail -n +2 "$file")

        # Écrire à partir de cette ligne
        tail -n +$line_num "$file" >> "$tmp_file"
        echo "🔄 remplacé + nettoyé: src/${clean_path}"
    else
        # Pas de commentaire, on cherche la première ligne non vide
        line_num=1
        while IFS= read -r line; do
            if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*$ ]]; then
                break
            fi
            ((line_num++))
        done < "$file"

        # Écrire à partir de cette ligne
        tail -n +$line_num "$file" >> "$tmp_file"
        echo "✓ ajouté + nettoyé: src/${clean_path}"
    fi

    # Remplacer l'original
    mv "$tmp_file" "$file"
done

echo "✅ Terminé !"
