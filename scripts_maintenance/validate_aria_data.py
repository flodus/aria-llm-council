#!/usr/bin/env python3
"""
validate_aria_data.py — Vérifie la cohérence fond/forme des fichiers JSON ARIA
Usage  : python3 scripts_maintenance/validate_aria_data.py [fichier] [type]
Racine : à lancer depuis la racine du projet aria/

Types disponibles : questions | reponses | syntheses | garbage

Exemples :
  python3 scripts_maintenance/validate_aria_data.py templates/languages/fr/aria_questions.json questions
  python3 scripts_maintenance/validate_aria_data.py templates/languages/fr/aria_reponses.json reponses
  python3 scripts_maintenance/validate_aria_data.py templates/languages/fr/aria_syntheses.json syntheses
  python3 scripts_maintenance/validate_aria_data.py templates/languages/aria_garbage_messages.json garbage

Raccourcis (détection automatique depuis templates/languages/) :
  python3 scripts_maintenance/validate_aria_data.py fr/aria_questions.json questions
  python3 scripts_maintenance/validate_aria_data.py en/aria_reponses.json reponses
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

# ── Racines ───────────────────────────────────────────────────────────────────

ROOT      = Path(__file__).parent.parent
LANG_ROOT = ROOT / "templates" / "languages"

# ── Constantes ARIA ───────────────────────────────────────────────────────────

MINISTERES_ATTENDUS = {
    "justice", "economie", "defense", "sante",
    "education", "ecologie", "industrie"
}
REGIMES_ATTENDUS = {
    "democratie_liberale", "republique_federale", "monarchie_constitutionnelle",
    "technocratie_ia", "junte_militaire", "oligarchie", "theocratie"
}
POSTURES_ATTENDUES  = {"prudent", "radical", "statu_quo"}
POOL_CATS_ATTENDUES = {"quotidien", "crise_et_peur", "ideologique", "anomalie_et_scifi"}
LANGUES_GARBAGE     = {"fr", "en"}
POOL_SIZE_CIBLE     = 5   # taille attendue par pool dans syntheses

# ── Utilitaires ───────────────────────────────────────────────────────────────

def err(msg):  print(f"  ⚠️  {msg}")
def ok(msg):   print(f"  ✅ {msg}")
def info(msg): print(f"     {msg}")

def check_no_duplicates(items, label):
    seen = {}
    dups = []
    for item in items:
        if item in seen:
            dups.append(item)
        seen[item] = True
    if dups:
        err(f"{len(dups)} doublon(s) dans {label}")
        for d in dups[:3]:
            print(f"       '{d[:70]}'")
    else:
        ok(f"Aucun doublon — {label}")

def check_min_length(items, min_words, label):
    courtes = [s for s in items if len(s.split()) < min_words]
    if courtes:
        err(f"{len(courtes)} entrée(s) < {min_words} mots — {label}")
        for s in courtes[:3]:
            print(f"       '{s}'")
    else:
        ok(f"Longueur >= {min_words} mots — {label}")

def check_keys(present, attendus, label):
    manquants = attendus - present
    extra     = present - attendus
    if manquants: err(f"Clés manquantes [{label}] : {sorted(manquants)}")
    if extra:     err(f"Clés inattendues [{label}] : {sorted(extra)}")
    if not manquants and not extra:
        ok(f"Clés correctes — {label}")

def check_majuscule(items, label):
    sans = [s for s in items if s and not s[0].isupper()]
    if sans:
        err(f"{len(sans)} entrée(s) sans majuscule — {label}")
        for s in sans[:3]:
            print(f"       '{s}'")
    else:
        ok(f"Majuscule initiale — {label}")

# ── Validateurs ───────────────────────────────────────────────────────────────

def validate_questions(d):
    print("\n── PAR MINISTÈRE ──")
    check_keys(set(d.get('par_ministere', {}).keys()), MINISTERES_ATTENDUS, "par_ministere")
    all_q = []
    for m_id, v in d.get('par_ministere', {}).items():
        qs = v.get('questions', [])
        info(f"{m_id}: {len(qs)} questions")
        all_q.extend(qs)

    print("\n── POOL TRANSVERSAL ──")
    check_keys(set(d.get('pool_transversal', {}).keys()), POOL_CATS_ATTENDUES, "pool_transversal")
    for cat, v in d.get('pool_transversal', {}).items():
        qs = v.get('questions', [])
        info(f"{cat}: {len(qs)} questions")
        all_q.extend(qs)

    print("\n── CONTRÔLES GLOBAUX ──")
    check_no_duplicates(all_q, "toutes les questions")
    check_min_length(all_q, 4, "toutes les questions")
    check_majuscule(all_q, "toutes les questions")

    declaratives = [q for q in all_q if not q.strip().endswith('?')]
    if declaratives:
        info(f"{len(declaratives)} phrases déclaratives (sans '?') — intentionnel pour pools contextuels")

    info(f"\nTOTAL : {len(all_q)} questions")


def validate_reponses(d):
    print("\n── MINISTERS ──")
    ministers = d.get('ministers', {})
    info(f"{len(ministers)} archétypes : {sorted(ministers.keys())}")
    all_phrases = []
    pool_sizes  = []

    for m_id, data in ministers.items():
        reponses = data.get('reponses', {})
        for regime, postures in reponses.items():
            if regime not in REGIMES_ATTENDUS and not regime.startswith('_'):
                err(f"Régime inattendu '{regime}' dans ministers/{m_id}")
            for posture, phrases in postures.items():
                if posture not in POSTURES_ATTENDUES:
                    err(f"Posture inattendue '{posture}' dans ministers/{m_id}/{regime}")
                pool_sizes.append(len(phrases))
                all_phrases.extend(phrases)

    print("\n── MINISTÈRES ──")
    ministeres = d.get('ministeres', {})
    check_keys(set(ministeres.keys()), MINISTERES_ATTENDUS, "ministeres")
    for m_id, data in ministeres.items():
        for regime, postures in data.get('reponses', {}).items():
            for posture, phrases in postures.items():
                pool_sizes.append(len(phrases))
                all_phrases.extend(phrases)

    print("\n── PRÉSIDENCE ──")
    presidence = d.get('presidence', {})
    info(f"Rôles : {sorted(presidence.keys())}")

    print("\n── SYSTÈME ──")
    systeme = d.get('systeme', {})
    garbage = systeme.get('garbage', [])
    if garbage:
        ok(f"systeme.garbage présent : {len(garbage)} phrases")
        check_min_length(garbage, 8, "systeme.garbage")
    else:
        err("systeme.garbage absent — lancer integrate_garbage.py")

    print("\n── CONTRÔLES GLOBAUX ──")
    check_no_duplicates(all_phrases, "toutes les réponses")
    check_min_length(all_phrases, 5, "toutes les réponses")
    check_majuscule(all_phrases, "toutes les réponses")

    if pool_sizes:
        info(f"Taille pools — min: {min(pool_sizes)} | max: {max(pool_sizes)} | moy: {sum(pool_sizes)/len(pool_sizes):.1f}")

    fallbacks = d.get('_meta', {}).get('fallbacks', {})
    if fallbacks:
        ok(f"_meta.fallbacks définis : {list(fallbacks.keys())}")
    else:
        err("_meta.fallbacks absent")

    info(f"\nTOTAL réponses : {len(all_phrases)}")


def validate_syntheses(d):
    print("\n── MINISTÈRES ──")
    ministeres = d.get('ministeres', {})
    check_keys(set(ministeres.keys()), MINISTERES_ATTENDUS, "ministeres")
    all_phrases = []
    pool_sizes  = []
    anomalies   = []

    for m_id, regimes in ministeres.items():
        check_keys(set(regimes.keys()), REGIMES_ATTENDUS, f"ministeres/{m_id}")
        for regime, states in regimes.items():
            for state in ['convergence', 'divergence']:
                phrases = states.get(state, [])
                n = len(phrases)
                pool_sizes.append(n)
                all_phrases.extend(phrases)
                if n == 0:
                    err(f"Pool vide : {m_id}/{regime}/{state}")
                elif n != POOL_SIZE_CIBLE:
                    anomalies.append(f"{m_id}/{regime}/{state} : {n} phrases")

    if anomalies:
        err(f"Pools ≠ {POOL_SIZE_CIBLE} phrases :")
        for a in anomalies:
            info(a)
    else:
        ok(f"Tous les pools font {POOL_SIZE_CIBLE} phrases")

    print("\n── PRÉSIDENCE ──")
    presidence = d.get('presidence', {})
    for state in ['convergence', 'divergence']:
        n = len(presidence.get(state, []))
        info(f"presidence/{state} : {n} phrases")
        all_phrases.extend(presidence.get(state, []))

    print("\n── CONTRÔLES GLOBAUX ──")
    check_no_duplicates(all_phrases, "toutes les synthèses")
    check_min_length(all_phrases, 6, "toutes les synthèses")
    check_majuscule(all_phrases, "toutes les synthèses")

    info(f"\nTOTAL : {len(all_phrases)} phrases")
    info(f"Pools ministères : {len(pool_sizes)} pools")


def validate_garbage(d):
    print("\n── LANGUES ──")
    keys_data = set(d.keys()) - {'_meta'}
    check_keys(keys_data, LANGUES_GARBAGE, "langues")

    all_counts = []
    for lang in sorted(LANGUES_GARBAGE):
        phrases = d.get(lang, [])
        all_counts.append(len(phrases))
        info(f"{lang} : {len(phrases)} phrases")
        if len(phrases) < 3:
            err(f"Moins de 3 phrases pour '{lang}' — pool trop petit")
        check_min_length(phrases, 8, lang)
        check_majuscule(phrases, lang)

    if len(set(all_counts)) == 1:
        ok(f"FR et EN équilibrés : {all_counts[0]} phrases chacun")
    else:
        err(f"FR et EN déséquilibrés : {dict(zip(sorted(LANGUES_GARBAGE), all_counts))}")


# ── Résolution du chemin ──────────────────────────────────────────────────────

def resolve_path(arg):
    p = Path(arg)
    if p.exists():
        return p
    # Chercher dans templates/languages/
    candidate = LANG_ROOT / arg
    if candidate.exists():
        return candidate
    # Chercher à la racine du projet
    candidate2 = ROOT / arg
    if candidate2.exists():
        return candidate2
    return None


# ── Main ─────────────────────────────────────────────────────────────────────

if len(sys.argv) < 3:
    print(__doc__)
    sys.exit(0)

filepath = resolve_path(sys.argv[1])
filetype = sys.argv[2]

if filepath is None:
    print(f"Fichier introuvable : {sys.argv[1]}")
    print(f"Cherché dans : . | {LANG_ROOT} | {ROOT}")
    sys.exit(1)

print(f"Validation : {filepath.relative_to(ROOT) if ROOT in filepath.parents else filepath}")
print(f"Type       : {filetype}")

with open(filepath, encoding='utf-8') as f:
    d = json.load(f)

validators = {
    'questions': validate_questions,
    'reponses':  validate_reponses,
    'syntheses': validate_syntheses,
    'garbage':   validate_garbage,
}

if filetype not in validators:
    print(f"Type inconnu : '{filetype}'. Disponibles : {list(validators.keys())}")
    sys.exit(1)

validators[filetype](d)
print("\n── Validation terminée ──")
