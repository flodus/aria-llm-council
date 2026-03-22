#!/usr/bin/env python3
"""
apply_statu_quo_fixes.py — Remplace les phrases statu_quo génériques par des phrases
avec la voix du personnage dans aria_reponses.json (FR et EN).

Usage  : python3 scripts_maintenance/apply_statu_quo_fixes.py
Racine : à lancer depuis la racine du projet aria/

Fichiers sources (dans scripts_maintenance/) :
  statu_quo_fixes_fr.json
  statu_quo_fixes_en.json

Fichiers modifiés :
  templates/languages/fr/aria_reponses.json
  templates/languages/en/aria_reponses.json
"""

import json
import sys
from pathlib import Path

ROOT        = Path(__file__).parent.parent
SM          = Path(__file__).parent   # scripts_maintenance/
LANGS       = {
    "fr": {
        "fixes":    SM / "statu_quo_fixes_fr.json",
        "reponses": ROOT / "templates" / "languages" / "fr" / "aria_reponses.json",
    },
    "en": {
        "fixes":    SM / "statu_quo_fixes_en.json",
        "reponses": ROOT / "templates" / "languages" / "en" / "aria_reponses.json",
    },
}

def apply(fixes_path, reponses_path, lang):
    print(f"\n── {lang.upper()} ──")

    for path, label in [(fixes_path, "fixes"), (reponses_path, "reponses")]:
        if not path.exists():
            print(f"  ⚠️  Fichier introuvable : {path}")
            sys.exit(1)

    with open(fixes_path, encoding='utf-8') as f:
        fixes = json.load(f)
    with open(reponses_path, encoding='utf-8') as f:
        reponses = json.load(f)

    total_remplacements = 0
    total_non_trouves   = 0
    non_trouves         = []

    for m_id, regimes in fixes.get("ministers", {}).items():
        for regime, postures in regimes.items():
            for posture, phrase_map in postures.items():
                # Trouver le pool cible dans aria_reponses
                pool = (reponses
                        .get("ministers", {})
                        .get(m_id, {})
                        .get("reponses", {})
                        .get(regime, {})
                        .get(posture, None))

                if pool is None:
                    non_trouves.append(f"Pool introuvable : ministers/{m_id}/{regime}/{posture}")
                    total_non_trouves += 1
                    continue

                for old_phrase, new_phrase in phrase_map.items():
                    # Cherche la phrase (correspondance exacte ou début de phrase pour les tronquées)
                    idx = None
                    for i, p in enumerate(pool):
                        if p == old_phrase or p.startswith(old_phrase[:40]):
                            idx = i
                            break

                    if idx is not None:
                        pool[idx] = new_phrase
                        total_remplacements += 1
                    else:
                        non_trouves.append(
                            f"Phrase non trouvée dans ministers/{m_id}/{regime}/{posture} : "
                            f"'{old_phrase[:50]}'"
                        )
                        total_non_trouves += 1

    # Écrire
    with open(reponses_path, 'w', encoding='utf-8') as f:
        json.dump(reponses, f, ensure_ascii=False, indent=2)

    print(f"  ✅ {total_remplacements} remplacement(s) effectué(s)")
    if non_trouves:
        print(f"  ⚠️  {total_non_trouves} phrase(s) non trouvée(s) :")
        for msg in non_trouves:
            print(f"     {msg}")
    else:
        print(f"  ✅ Toutes les phrases cibles ont été trouvées")
    print(f"  ✅ Écrit → {reponses_path.relative_to(ROOT)}")

# ── Main ─────────────────────────────────────────────────────────────────────
for lang, paths in LANGS.items():
    apply(paths["fixes"], paths["reponses"], lang)

print("\nApplication terminée.")
print("Relancer validate_aria_data.py pour vérifier le résultat.")
