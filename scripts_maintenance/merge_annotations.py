#!/usr/bin/env python3
"""
merge_annotations.py — Fusionne deux fichiers aria_annotations.json
Concatène les pools phrase par phrase sans doublon.

Usage  : python3 scripts_maintenance/merge_annotations.py <fichier_A> <fichier_B> <output>
Racine : à lancer depuis la racine du projet aria/

Exemple :
  python3 scripts_maintenance/merge_annotations.py \\
    templates/languages/fr/aria_annotations.json \\
    scripts_maintenance/aria_annotations_cc_fr.json \\
    templates/languages/fr/aria_annotations.json
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

def resolve(arg):
    p = Path(arg)
    if p.exists(): return p
    c = ROOT / arg
    if c.exists(): return c
    return None

def normalize(s):
    return s.replace('\u2019', "'").replace('\u2018', "'").strip()

if len(sys.argv) < 4:
    print(__doc__)
    sys.exit(0)

path_a = resolve(sys.argv[1])
path_b = resolve(sys.argv[2])
path_out = ROOT / sys.argv[3] if not Path(sys.argv[3]).is_absolute() else Path(sys.argv[3])

for p, label in [(path_a, sys.argv[1]), (path_b, sys.argv[2])]:
    if not p or not p.exists():
        print(f"Fichier introuvable : {label}")
        sys.exit(1)

with open(path_a, encoding='utf-8') as f:
    a = json.load(f)
with open(path_b, encoding='utf-8') as f:
    b = json.load(f)

MINISTERES = ['justice','economie','defense','sante','education','ecologie','industrie']
REGIMES    = ['democratie_liberale','republique_federale','monarchie_constitutionnelle',
              'technocratie_ia','junte_militaire','oligarchie','theocratie']

result = {
    "_meta": a.get("_meta", b.get("_meta", {})),
    "ministeres": {}
}

stats = {"total": 0, "doublons_evites": 0, "manquants": []}

for m in MINISTERES:
    result["ministeres"][m] = {}
    for r in REGIMES:
        pool_a = a.get("ministeres", {}).get(m, {}).get(r, [])
        pool_b = b.get("ministeres", {}).get(m, {}).get(r, [])

        if not pool_a and not pool_b:
            stats["manquants"].append(f"{m}/{r}")
            result["ministeres"][m][r] = []
            continue

        # Fusion sans doublon (normalisation apostrophes)
        merged = list(pool_a)
        seen = {normalize(p) for p in pool_a}

        for phrase in pool_b:
            if normalize(phrase) not in seen:
                merged.append(phrase)
                seen.add(normalize(phrase))
            else:
                stats["doublons_evites"] += 1

        result["ministeres"][m][r] = merged
        stats["total"] += len(merged)

# Écriture
path_out.parent.mkdir(parents=True, exist_ok=True)
with open(path_out, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# Rapport
print(f"Fusion terminée → {path_out.relative_to(ROOT) if ROOT in path_out.parents else path_out}")
print(f"  Fichier A : {path_a.name} ({sum(len(a['ministeres'].get(m,{}).get(r,[])) for m in MINISTERES for r in REGIMES)} phrases)")
print(f"  Fichier B : {path_b.name} ({sum(len(b['ministeres'].get(m,{}).get(r,[])) for m in MINISTERES for r in REGIMES)} phrases)")
print(f"  Total fusionné : {stats['total']} phrases")
print(f"  Doublons évités : {stats['doublons_evites']}")
if stats["manquants"]:
    print(f"  ⚠️  Pools vides : {stats['manquants']}")

# Vérif tailles
sizes = set()
for m in MINISTERES:
    for r in REGIMES:
        sizes.add(len(result["ministeres"][m][r]))
print(f"  Tailles pools : min={min(sizes)} max={max(sizes)}")

# Vérif doublons dans le résultat
all_phrases = [p for m in result["ministeres"].values() for r in m.values() for p in r]
dups = len(all_phrases) - len({normalize(p) for p in all_phrases})
if dups:
    print(f"  ⚠️  {dups} doublon(s) dans le résultat")
else:
    print(f"  ✅ 0 doublon dans le résultat")
