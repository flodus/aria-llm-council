#!/usr/bin/env python3
"""
apply_fixes.py — Applique un fichier de corrections sur les fichiers JSON ARIA (FR et EN)
Fonctionne pour : aria_reponses.json · aria_questions.json · aria_syntheses.json

Usage :
  python3 scripts_maintenance/apply_fixes.py <fixes_file> <target_file>

Exemples :
  python3 scripts_maintenance/apply_fixes.py statu_quo_fixes_fr.json aria_reponses.json
  python3 scripts_maintenance/apply_fixes.py syntheses_fixes_fr.json aria_syntheses.json

Le script cherche automatiquement les fichiers FR et EN (_fr → _en).
Racine : à lancer depuis la racine du projet aria/
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
SM   = Path(__file__).parent

# ── Normalisation apostrophes ─────────────────────────────────────────────────
def normalize(s):
    return (s.replace('\u2019', "'").replace('\u2018', "'")
             .replace('\u201c', '"').replace('\u201d', '"')
             .strip())

# ── Navigation dans le JSON ───────────────────────────────────────────────────
# Clés intermédiaires transparentes — le script les traverse automatiquement
TRANSPARENT_KEYS = {'reponses', 'questions', 'styles', 'par_ministere', 'pool_transversal'}

def navigate(data, parts):
    """
    Navigue dans data selon une liste de clés.
    Traverse automatiquement les clés intermédiaires connues (reponses, questions…)
    si elles ne sont pas dans le chemin explicite.
    """
    current = data
    for part in parts:
        if not isinstance(current, dict):
            return None
        if part in current:
            current = current[part]
        else:
            # Essayer de traverser une clé transparente intermédiaire
            found = False
            for tk in TRANSPARENT_KEYS:
                if tk in current and isinstance(current[tk], dict) and part in current[tk]:
                    current = current[tk][part]
                    found = True
                    break
            if not found:
                return None
    return current

# ── Application récursive ─────────────────────────────────────────────────────
def apply_fixes_recursive(data, fixes, path_parts=None):
    """
    Parcourt récursivement le fichier de fixes.
    Quand toutes les valeurs d'un dict sont des strings → table de remplacements.
    """
    if path_parts is None:
        path_parts = []

    replaced   = 0
    not_found  = []

    for key, value in fixes.items():
        if key.startswith('_'):
            continue

        current_parts = path_parts + [key]

        if isinstance(value, dict):
            # Table de remplacements si toutes les valeurs sont des strings
            if value and all(isinstance(v, str) for v in value.values()):
                target = navigate(data, current_parts)
                path_str = '/'.join(current_parts)

                if target is None:
                    not_found.append(f"Chemin introuvable : {path_str}")
                    continue
                if not isinstance(target, list):
                    not_found.append(f"Cible n'est pas un tableau [{type(target).__name__}] : {path_str}")
                    continue

                for old_phrase, new_phrase in value.items():
                    old_norm = normalize(old_phrase)
                    idx = None
                    for i, p in enumerate(target):
                        if isinstance(p, str) and (
                            normalize(p) == old_norm or
                            normalize(p).startswith(old_norm[:40])
                        ):
                            idx = i
                            break
                    if idx is not None:
                        target[idx] = new_phrase
                        replaced += 1
                    else:
                        not_found.append(f"{path_str} : '{old_phrase[:55]}'")
            else:
                # Descendre récursivement
                r, nf = apply_fixes_recursive(data, value, current_parts)
                replaced  += r
                not_found += nf

    return replaced, not_found

# ── Résolution fichiers ───────────────────────────────────────────────────────
def resolve_fixes_pair(fixes_arg):
    fixes_path = Path(fixes_arg)
    if fixes_path.exists():
        fr_path = fixes_path
    else:
        candidates = [SM / fixes_arg,
                      SM / fixes_arg.replace('.json', '_fr.json'),
                      ROOT / fixes_arg]
        fr_path = next((p for p in candidates if p.exists()), None)

    if fr_path is None:
        return None, None

    en_path = Path(str(fr_path).replace('_fr.', '_en.').replace('_fr_', '_en_'))
    return fr_path, en_path if en_path.exists() else None

def resolve_target(target_arg, lang):
    candidates = [ROOT / "templates" / "languages" / lang / target_arg,
                  ROOT / target_arg,
                  Path(target_arg)]
    return next((p for p in candidates if p.exists()), None)

# ── Application ───────────────────────────────────────────────────────────────
def apply(fixes_path, target_path, lang):
    print(f"\n── {lang.upper()} ──")

    if fixes_path is None or not fixes_path.exists():
        print(f"  ⚠️  Fixes introuvables pour {lang} — ignoré")
        return
    if target_path is None or not target_path.exists():
        print(f"  ⚠️  Cible introuvable — ignoré")
        return

    with open(fixes_path, encoding='utf-8') as f:
        fixes = json.load(f)
    with open(target_path, encoding='utf-8') as f:
        data = json.load(f)

    replaced, not_found = apply_fixes_recursive(data, fixes)

    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  ✅ {replaced} remplacement(s) effectué(s)")
    if not_found:
        print(f"  ⚠️  {len(not_found)} phrase(s) non trouvée(s) :")
        for msg in not_found[:20]:
            print(f"     {msg}")
        if len(not_found) > 20:
            print(f"     ... et {len(not_found)-20} autres")
    else:
        print(f"  ✅ Toutes les phrases cibles ont été trouvées")
    print(f"  ✅ Écrit → {target_path.relative_to(ROOT)}")

# ── Main ─────────────────────────────────────────────────────────────────────
if len(sys.argv) < 3:
    print(__doc__)
    sys.exit(0)

fr_fixes, en_fixes = resolve_fixes_pair(sys.argv[1])
target_arg = sys.argv[2]

if fr_fixes is None:
    print(f"Fichier de fixes introuvable : {sys.argv[1]}")
    sys.exit(1)

print(f"Fixes FR  : {fr_fixes.relative_to(ROOT) if ROOT in fr_fixes.parents else fr_fixes}")
print(f"Fixes EN  : {en_fixes.relative_to(ROOT) if en_fixes and ROOT in en_fixes.parents else en_fixes or 'non trouvé'}")
print(f"Cible     : templates/languages/[lang]/{target_arg}")

apply(fr_fixes, resolve_target(target_arg, "fr"), "fr")
if en_fixes:
    apply(en_fixes, resolve_target(target_arg, "en"), "en")

print("\nApplication terminée.")
print("Relancer validate_aria_data.py + analyze_duplicates.py pour vérifier.")
