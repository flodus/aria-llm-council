#!/usr/bin/env python3
"""
analyze_duplicates.py — Analyse fine des doublons dans aria_reponses.json
Distingue :
  - Vrais doublons (même phrase, même ministre, régimes différents) → à surveiller
  - Doublons inter-ministres (même phrase, archétypes différents) → problématique en jeu
  - Doublons intra-pool (même phrase deux fois dans le même pool) → bug à corriger

Usage : python3 scripts_maintenance/analyze_duplicates.py templates/languages/fr/aria_reponses.json
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).parent.parent

def resolve(arg):
    p = Path(arg)
    if p.exists(): return p
    c = ROOT / arg
    if c.exists(): return c
    return None

if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(0)

filepath = resolve(sys.argv[1])
if not filepath:
    print(f"Fichier introuvable : {sys.argv[1]}")
    sys.exit(1)

with open(filepath, encoding='utf-8') as f:
    d = json.load(f)

# ── Collecter toutes les occurrences ─────────────────────────────────────────
# phrase → liste de (ministre_ou_ministere, regime, posture)
occurrences = defaultdict(list)

for m_id, data in d.get('ministers', {}).items():
    for regime, postures in data.get('reponses', {}).items():
        for posture, phrases in postures.items():
            for phrase in phrases:
                occurrences[phrase].append({
                    'type': 'minister',
                    'id': m_id,
                    'regime': regime,
                    'posture': posture,
                })

for m_id, data in d.get('ministeres', {}).items():
    for regime, postures in data.get('reponses', {}).items():
        for posture, phrases in postures.items():
            for phrase in phrases:
                occurrences[phrase].append({
                    'type': 'ministere',
                    'id': m_id,
                    'regime': regime,
                    'posture': posture,
                })

# ── Classifier les doublons ───────────────────────────────────────────────────
intra_pool       = []  # même phrase 2x dans le même pool → bug
meme_ministre    = []  # même ministre, régimes différents → OK mais redondant
inter_ministres  = []  # archétypes différents, contexte similaire → problématique

for phrase, locs in occurrences.items():
    if len(locs) < 2:
        continue

    # Vérifier doublons intra-pool (même id + regime + posture)
    keys = [(l['type'], l['id'], l['regime'], l['posture']) for l in locs]
    if len(keys) != len(set(keys)):
        intra_pool.append((phrase, locs))
        continue

    # Même archétype, régimes différents
    ids = set(l['id'] for l in locs)
    if len(ids) == 1:
        meme_ministre.append((phrase, locs))
    else:
        # Archétypes différents
        # Problématique si même régime ET même posture pour des archétypes différents
        contextes = [(l['regime'], l['posture']) for l in locs]
        contextes_set = set(contextes)
        if len(contextes_set) < len(contextes):
            # même contexte pour deux archétypes différents → vraiment problématique
            inter_ministres.append((phrase, locs, 'MEME_CONTEXTE'))
        else:
            inter_ministres.append((phrase, locs, 'CONTEXTE_DIFFERENT'))

# ── Affichage ─────────────────────────────────────────────────────────────────
print(f"Fichier : {filepath.name}")
print(f"Phrases uniques : {len(occurrences)}")
print(f"Doublons totaux : {sum(1 for p, l in occurrences.items() if len(l) > 1)}")

print(f"\n{'='*60}")
print(f"1. DOUBLONS INTRA-POOL (bug réel) : {len(intra_pool)}")
print(f"{'='*60}")
if intra_pool:
    for phrase, locs in intra_pool[:10]:
        print(f"\n  '{phrase[:70]}'")
        for l in locs:
            print(f"    → {l['type']}/{l['id']}/{l['regime']}/{l['posture']}")
else:
    print("  ✅ Aucun")

print(f"\n{'='*60}")
print(f"2. MÊME ARCHÉTYPE, RÉGIMES DIFFÉRENTS (redondant) : {len(meme_ministre)}")
print(f"{'='*60}")
if meme_ministre:
    for phrase, locs in meme_ministre[:10]:
        print(f"\n  '{phrase[:70]}'")
        for l in locs:
            print(f"    → {l['id']} | {l['regime']} | {l['posture']}")
    if len(meme_ministre) > 10:
        print(f"\n  ... et {len(meme_ministre)-10} autres")
else:
    print("  ✅ Aucun")

print(f"\n{'='*60}")
print(f"3. ARCHÉTYPES DIFFÉRENTS (potentiellement problématique)")
meme_ctx = [x for x in inter_ministres if x[2] == 'MEME_CONTEXTE']
diff_ctx  = [x for x in inter_ministres if x[2] == 'CONTEXTE_DIFFERENT']
print(f"   → Même contexte (régime+posture) : {len(meme_ctx)}  ← LES PLUS PROBLÉMATIQUES")
print(f"   → Contextes différents           : {len(diff_ctx)}  ← OK en jeu")
print(f"{'='*60}")

if meme_ctx:
    print(f"\n  Même contexte — exemples :")
    for phrase, locs, _ in meme_ctx[:15]:
        print(f"\n  '{phrase[:70]}'")
        for l in locs:
            print(f"    → {l['type']}/{l['id']} | {l['regime']} | {l['posture']}")
    if len(meme_ctx) > 15:
        print(f"\n  ... et {len(meme_ctx)-15} autres")

if diff_ctx:
    print(f"\n  Contextes différents — exemples (3 premiers) :")
    for phrase, locs, _ in diff_ctx[:3]:
        print(f"\n  '{phrase[:70]}'")
        for l in locs:
            print(f"    → {l['type']}/{l['id']} | {l['regime']} | {l['posture']}")

print(f"\n{'='*60}")
print(f"RÉSUMÉ")
print(f"{'='*60}")
print(f"  Intra-pool (bug)            : {len(intra_pool)}")
print(f"  Même archétype (redondant)  : {len(meme_ministre)}")
print(f"  Inter-archétypes même ctx   : {len(meme_ctx)}  ← à corriger en priorité")
print(f"  Inter-archétypes diff ctx   : {len(diff_ctx)}  ← acceptable")
