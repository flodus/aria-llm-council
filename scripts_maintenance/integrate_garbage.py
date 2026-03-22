#!/usr/bin/env python3
"""
integrate_garbage.py — Intègre aria_garbage_messages.json dans aria_reponses.json (FR et EN)
Usage  : python3 scripts_maintenance/integrate_garbage.py
Racine : à lancer depuis la racine du projet aria/
"""

import json
import sys
from pathlib import Path

ROOT            = Path(__file__).parent.parent
GARBAGE_PATH    = ROOT / "templates" / "languages" / "aria_garbage_messages.json"
REPONSES_FR     = ROOT / "templates" / "languages" / "fr" / "aria_reponses.json"
REPONSES_EN     = ROOT / "templates" / "languages" / "en" / "aria_reponses.json"

def integrate(garbage_path, reponses_path, lang):
    print(f"\n── {lang.upper()} ──")

    # Charger garbage
    if not garbage_path.exists():
        print(f"  ⚠️  Fichier introuvable : {garbage_path}")
        sys.exit(1)
    with open(garbage_path, encoding='utf-8') as f:
        garbage = json.load(f)

    phrases = garbage.get(lang, [])
    if not phrases:
        print(f"  ⚠️  Aucune phrase pour la langue '{lang}' dans {garbage_path.name}")
        sys.exit(1)

    # Charger aria_reponses
    if not reponses_path.exists():
        print(f"  ⚠️  Fichier introuvable : {reponses_path}")
        sys.exit(1)
    with open(reponses_path, encoding='utf-8') as f:
        reponses = json.load(f)

    # Vérifier si déjà intégré
    if "systeme" in reponses and "garbage" in reponses.get("systeme", {}):
        print(f"  ⚠️  Clé 'systeme.garbage' déjà présente — mise à jour quand même")

    # Intégrer
    if "systeme" not in reponses:
        reponses["systeme"] = {}
    reponses["systeme"]["garbage"] = phrases

    # Écrire
    with open(reponses_path, 'w', encoding='utf-8') as f:
        json.dump(reponses, f, ensure_ascii=False, indent=2)

    print(f"  ✅ {len(phrases)} phrases intégrées → systeme.garbage")
    print(f"  ✅ Écrit → {reponses_path.relative_to(ROOT)}")

    # Vérif rapide
    with open(reponses_path, encoding='utf-8') as f:
        check = json.load(f)
    assert check["systeme"]["garbage"] == phrases, "Vérification échouée"
    print(f"  ✅ Vérification lecture OK")


# ── Main ─────────────────────────────────────────────────────────────────────

# Chercher aria_garbage_messages.json — soit à la racine languages/, soit dans scripts_maintenance/
if not GARBAGE_PATH.exists():
    alt = ROOT / "scripts_maintenance" / "aria_garbage_messages.json"
    if alt.exists():
        GARBAGE_PATH = alt
    else:
        print(f"Fichier aria_garbage_messages.json introuvable.")
        print(f"Placer le fichier dans : {GARBAGE_PATH.parent} ou {alt.parent}")
        sys.exit(1)

print(f"Source garbage : {GARBAGE_PATH.relative_to(ROOT)}")

integrate(GARBAGE_PATH, REPONSES_FR, "fr")
integrate(GARBAGE_PATH, REPONSES_EN, "en")

print("\nIntégration terminée.")
