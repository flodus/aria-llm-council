#!/usr/bin/env python3
# scripts_maintenance/audit_templates.py
# ══════════════════════════════════════════════════════════════════════
#  Audit complet des templates/languages/ du mode Board Game ARIA
#  Vérifie : structure · doublons · longueur · cohérence FR↔EN
#  Usage : python3 scripts_maintenance/audit_templates.py
#  Lecture seule — ne modifie aucun fichier
# ══════════════════════════════════════════════════════════════════════

import json
import sys
from datetime import datetime
from pathlib import Path
from collections import defaultdict

# ── Constantes attendues ──────────────────────────────────────────────
MINISTERES_ATTENDUS = [
    'justice', 'economie', 'defense', 'sante',
    'education', 'ecologie', 'industrie'
]
REGIMES_ATTENDUS = [
    'democratie_liberale', 'republique_federale', 'monarchie_constitutionnelle',
    'technocratie_ia', 'junte_militaire', 'oligarchie', 'theocratie'
]
POSTURES_ATTENDUES = ['prudent', 'radical', 'statu_quo']
ARCHETYPES_ATTENDUS = [
    'initiateur', 'gardien', 'communicant', 'protecteur', 'ambassadeur',
    'analyste', 'arbitre', 'enqueteur', 'guide', 'stratege', 'inventeur', 'guerisseur'
]
CATEGORIES_QUESTIONS = ['quotidien', 'crise_et_peur', 'ideologique', 'anomalie_et_scifi']
LANGUES = ['fr', 'en']

RACINE = Path(__file__).parent.parent / 'templates' / 'languages'

# ── Compteurs globaux ────────────────────────────────────────────────
nb_erreurs   = 0
nb_avertiss  = 0
nb_infos     = 0


def err(msg):
    global nb_erreurs
    nb_erreurs += 1
    print(f'  ❌ {msg}')


def warn(msg):
    global nb_avertiss
    nb_avertiss += 1
    print(f'  ⚠️  {msg}')


def ok(msg):
    print(f'  ✅ {msg}')


def info(msg):
    global nb_infos
    nb_infos += 1
    print(f'  ℹ️  {msg}')


def charger(lang, fichier):
    chemin = RACINE / lang / fichier
    if not chemin.exists():
        err(f'Fichier introuvable : {chemin}')
        return None
    with open(chemin, encoding='utf-8') as f:
        return json.load(f)


def extraire_phrases(obj):
    """Parcourt récursivement et retourne toutes les chaînes feuilles."""
    phrases = []
    if isinstance(obj, list):
        for v in obj:
            if isinstance(v, str):
                phrases.append(v)
            else:
                phrases.extend(extraire_phrases(v))
    elif isinstance(obj, dict):
        for v in obj.values():
            phrases.extend(extraire_phrases(v))
    return phrases


def doublons_dans_liste(lst):
    vus = set()
    dbl = []
    for p in lst:
        if p in vus:
            dbl.append(p)
        vus.add(p)
    return dbl


# ══════════════════════════════════════════════════════════════════════
#  aria_questions.json
# ══════════════════════════════════════════════════════════════════════
def audit_questions(lang, data):
    print(f'\n── {lang.upper()}/aria_questions.json ──')
    if data is None:
        return set()

    # Structure
    par_min = data.get('par_ministere', {})
    pool_t  = data.get('pool_transversal', {})

    ministeres_presents = set(par_min.keys())
    manquants = [m for m in MINISTERES_ATTENDUS if m not in ministeres_presents]
    if manquants:
        err(f'Ministères manquants : {manquants}')
    else:
        ok(f'Structure complète ({len(ministeres_presents)} ministères)')

    cats_presentes = set(pool_t.keys())
    cats_manquantes = [c for c in CATEGORIES_QUESTIONS if c not in cats_presentes]
    if cats_manquantes:
        err(f'Catégories pool_transversal manquantes : {cats_manquantes}')
    else:
        ok(f'Pool transversal complet ({len(cats_presentes)} catégories)')

    # Collecte toutes les questions
    toutes = []
    for m, contenu in par_min.items():
        if isinstance(contenu, list):
            toutes.extend(contenu)
        elif isinstance(contenu, dict):
            toutes.extend(extraire_phrases(contenu))
    toutes.extend(extraire_phrases(pool_t))

    # Doublons globaux
    dbl = doublons_dans_liste(toutes)
    if dbl:
        err(f'{len(dbl)} doublon(s) global(aux) — ex: "{dbl[0][:60]}"')
    else:
        ok('0 doublon')

    # Longueur ≥ 4 mots
    courtes = [q for q in toutes if len(q.split()) < 4]
    if courtes:
        warn(f'{len(courtes)} question(s) < 4 mots — ex: "{courtes[0]}"')
    else:
        ok('Longueur OK (toutes ≥ 4 mots)')

    # Majuscule initiale
    sans_maj = [q for q in toutes if q and not q[0].isupper()]
    if sans_maj:
        warn(f'{len(sans_maj)} question(s) sans majuscule initiale')
    else:
        ok('Majuscules OK')

    # Phrases déclaratives (informatif)
    declaratives = [q for q in toutes if not q.strip().endswith('?')]
    if declaratives:
        info(f'{len(declaratives)} phrases déclaratives (sans ?) — informatif')

    print(f'  TOTAL : {len(toutes)} questions')
    return set(toutes)


# ══════════════════════════════════════════════════════════════════════
#  aria_reponses.json
# ══════════════════════════════════════════════════════════════════════
def audit_reponses(lang, data):
    print(f'\n── {lang.upper()}/aria_reponses.json ──')
    if data is None:
        return set()

    # _meta.fallbacks
    if data.get('_meta', {}).get('fallbacks'):
        ok('_meta.fallbacks présent')
    else:
        warn('_meta.fallbacks absent')

    # systeme.garbage
    garbage = data.get('systeme', {}).get('garbage', [])
    if len(garbage) >= 3:
        ok(f'systeme.garbage : {len(garbage)} phrases')
    else:
        err(f'systeme.garbage insuffisant : {len(garbage)} phrase(s) (min 3)')

    ministers = data.get('ministers', {})
    ministeres = data.get('ministeres', {})

    # Archétypes
    archetypes_presents = set(ministers.keys())
    manquants_arch = [a for a in ARCHETYPES_ATTENDUS if a not in archetypes_presents]
    if manquants_arch:
        err(f'Archétypes manquants : {manquants_arch}')
    else:
        ok(f'12 archétypes présents')

    # Ministères
    min_presents = set(ministeres.keys())
    manquants_min = [m for m in MINISTERES_ATTENDUS if m not in min_presents]
    if manquants_min:
        err(f'Ministères manquants : {manquants_min}')
    else:
        ok(f'7 ministères présents')

    toutes_phrases = []

    # Doublons intra-pool + collecte par contexte (archétype × régime × posture)
    # pour détection inter-archétypes même contexte
    phrases_par_contexte = defaultdict(list)  # (regime, posture) → [(phrase, archetype)]
    nb_intra = 0

    for arch, contenu in ministers.items():
        for regime, postures in contenu.get('reponses', {}).items():
            for posture, pool in postures.items():
                if not isinstance(pool, list):
                    continue
                dbl = doublons_dans_liste(pool)
                if dbl:
                    nb_intra += len(dbl)
                toutes_phrases.extend(pool)
                for p in pool:
                    phrases_par_contexte[(regime, posture)].append((p, arch))

    for m, contenu in ministeres.items():
        for regime, postures in contenu.get('reponses', {}).items():
            for posture, pool in postures.items():
                if not isinstance(pool, list):
                    continue
                dbl = doublons_dans_liste(pool)
                if dbl:
                    nb_intra += len(dbl)
                toutes_phrases.extend(pool)

    toutes_phrases.extend(extraire_phrases(data.get('presidence', {})))
    toutes_phrases.extend(garbage)

    if nb_intra:
        err(f'{nb_intra} doublon(s) intra-pool')
    else:
        ok('0 doublon intra-pool')

    # Doublons inter-archétypes même contexte (régime + posture) — BLOQUANT
    nb_inter_meme = 0
    exemples_inter = []
    for (regime, posture), entrees in phrases_par_contexte.items():
        phrase_vers_arch = defaultdict(list)
        for phrase, arch in entrees:
            phrase_vers_arch[phrase].append(arch)
        for phrase, archs in phrase_vers_arch.items():
            if len(archs) > 1:
                nb_inter_meme += 1
                if len(exemples_inter) < 3:
                    exemples_inter.append(f'"{phrase[:50]}" [{regime}/{posture}] → {archs}')
    if nb_inter_meme:
        err(f'{nb_inter_meme} doublon(s) inter-archétypes même contexte (régime+posture)')
        for ex in exemples_inter:
            print(f'       {ex}')
    else:
        ok('0 doublon inter-archétypes même contexte')

    # Phrases < 3 mots
    courtes = [p for p in toutes_phrases if isinstance(p, str) and len(p.split()) < 3]
    if courtes:
        warn(f'{len(courtes)} phrase(s) < 3 mots')
    else:
        ok('Longueur OK (toutes ≥ 3 mots)')

    print(f'  TOTAL : {len(toutes_phrases)} phrases')
    return set(p for p in toutes_phrases if isinstance(p, str))


# ══════════════════════════════════════════════════════════════════════
#  aria_syntheses.json
# ══════════════════════════════════════════════════════════════════════
def audit_syntheses(lang, data):
    print(f'\n── {lang.upper()}/aria_syntheses.json ──')
    if data is None:
        return set()

    toutes = []
    nb_pools_hors_5 = []

    ministeres = data.get('ministeres', {})
    for mid, regimes in ministeres.items():
        for regime, etats in regimes.items():
            for etat, pool in etats.items():
                if not isinstance(pool, list):
                    continue
                toutes.extend(pool)
                if len(pool) != 5:
                    nb_pools_hors_5.append(f'{mid}/{regime}/{etat} → {len(pool)} phrases')

    presidence = data.get('presidence', {})
    for etat, pool in presidence.items():
        if isinstance(pool, list):
            toutes.extend(pool)
            info(f'Présidence/{etat} : {len(pool)} phrases')

    # Doublons globaux
    dbl = doublons_dans_liste(toutes)
    if dbl:
        err(f'{len(dbl)} doublon(s) global(aux) — ex: "{dbl[0][:60]}"')
    else:
        ok('0 doublon')

    # Pools ≠ 5 phrases
    if nb_pools_hors_5:
        warn(f'{len(nb_pools_hors_5)} pool(s) ≠ 5 phrases — ex: {nb_pools_hors_5[0]}')
    else:
        ok('Tous les pools font exactement 5 phrases')

    # Longueur ≥ 6 mots
    courtes = [p for p in toutes if isinstance(p, str) and len(p.split()) < 6]
    if courtes:
        warn(f'{len(courtes)} phrase(s) < 6 mots — ex: "{courtes[0]}"')
    else:
        ok('Longueur OK (toutes ≥ 6 mots)')

    # Majuscule initiale
    sans_maj = [p for p in toutes if isinstance(p, str) and p and not p[0].isupper()]
    if sans_maj:
        warn(f'{len(sans_maj)} phrase(s) sans majuscule initiale')
    else:
        ok('Majuscules OK')

    print(f'  TOTAL : {len(toutes)} phrases')
    return set(p for p in toutes if isinstance(p, str))


# ══════════════════════════════════════════════════════════════════════
#  aria_annotations.json
# ══════════════════════════════════════════════════════════════════════
def audit_annotations(lang, data):
    print(f'\n── {lang.upper()}/aria_annotations.json ──')
    if data is None:
        return set()

    toutes = []
    nb_pools_courts = []

    ministeres = data.get('ministeres', {})
    for mid, regimes in ministeres.items():
        for regime, pool in regimes.items():
            if not isinstance(pool, list):
                continue
            toutes.extend(pool)
            if len(pool) < 3:
                nb_pools_courts.append(f'{mid}/{regime} → {len(pool)} phrases')

    # Doublons globaux
    dbl = doublons_dans_liste(toutes)
    if dbl:
        err(f'{len(dbl)} doublon(s) global(aux) — ex: "{dbl[0][:60]}"')
    else:
        ok('0 doublon')

    # Pools < 3 phrases
    if nb_pools_courts:
        err(f'{len(nb_pools_courts)} pool(s) < 3 phrases — ex: {nb_pools_courts[0]}')
    else:
        ok('Tous les pools font ≥ 3 phrases')

    # Longueur ≥ 6 mots
    courtes = [p for p in toutes if isinstance(p, str) and len(p.split()) < 6]
    if courtes:
        warn(f'{len(courtes)} phrase(s) < 6 mots')
    else:
        ok('Longueur OK (toutes ≥ 6 mots)')

    # Majuscule initiale
    sans_maj = [p for p in toutes if isinstance(p, str) and p and not p[0].isupper()]
    if sans_maj:
        warn(f'{len(sans_maj)} phrase(s) sans majuscule initiale')
    else:
        ok('Majuscules OK')

    print(f'  TOTAL : {len(toutes)} phrases')
    return set(p for p in toutes if isinstance(p, str))


# ══════════════════════════════════════════════════════════════════════
#  Contrôles croisés (même langue)
# ══════════════════════════════════════════════════════════════════════
def audit_croises(lang, d_q, d_r, d_s, d_a, phrases_r, phrases_s, phrases_a):
    print(f'\n── CONTRÔLES CROISÉS {lang.upper()} ──')

    # Cohérence des clés ministères entre les 4 fichiers
    min_q = set(d_q.get('par_ministere', {}).keys()) if d_q else set()
    min_r = set(d_r.get('ministeres', {}).keys()) if d_r else set()
    min_s = set(d_s.get('ministeres', {}).keys()) if d_s else set()
    min_a = set(d_a.get('ministeres', {}).keys()) if d_a else set()

    if min_q == min_r == min_s == min_a == set(MINISTERES_ATTENDUS):
        ok('Clés ministères cohérentes entre les 4 fichiers')
    else:
        diffs = {}
        if min_q != set(MINISTERES_ATTENDUS): diffs['questions'] = min_q
        if min_r != set(MINISTERES_ATTENDUS): diffs['reponses']  = min_r
        if min_s != set(MINISTERES_ATTENDUS): diffs['syntheses'] = min_s
        if min_a != set(MINISTERES_ATTENDUS): diffs['annotations'] = min_a
        warn(f'Clés ministères divergentes : {diffs}')

    # Cohérence des régimes entre reponses / syntheses / annotations
    def regimes_dans(d, chemin):
        if d is None:
            return set()
        noeud = d
        for k in chemin:
            noeud = noeud.get(k, {})
            if not isinstance(noeud, dict):
                return set()
        # Prend le premier ministère disponible comme référence
        premier = next(iter(noeud.values()), {})
        if isinstance(premier, dict):
            return set(premier.keys())
        return set()

    reg_r = regimes_dans(d_r, ['ministeres'])
    reg_s = regimes_dans(d_s, ['ministeres'])
    reg_a = regimes_dans(d_a, ['ministeres'])

    if reg_r == reg_s == reg_a:
        ok(f'Régimes cohérents entre reponses/syntheses/annotations ({len(reg_r)} régimes)')
    else:
        warn(f'Régimes divergents — reponses:{len(reg_r)} syntheses:{len(reg_s)} annotations:{len(reg_a)}')

    # Phrases partagées reponses ↔ syntheses
    partage_rs = phrases_r & phrases_s
    if partage_rs:
        err(f'{len(partage_rs)} phrase(s) partagée(s) aria_reponses ↔ aria_syntheses')
        for p in list(partage_rs)[:2]:
            print(f'       "{p[:70]}"')
    else:
        ok('0 phrase partagée aria_reponses ↔ aria_syntheses')

    # Phrases partagées reponses ↔ annotations
    partage_ra = phrases_r & phrases_a
    if partage_ra:
        err(f'{len(partage_ra)} phrase(s) partagée(s) aria_reponses ↔ aria_annotations')
        for p in list(partage_ra)[:2]:
            print(f'       "{p[:70]}"')
    else:
        ok('0 phrase partagée aria_reponses ↔ aria_annotations')


# ══════════════════════════════════════════════════════════════════════
#  Cohérence FR ↔ EN
# ══════════════════════════════════════════════════════════════════════
def extraire_cles_recursif(obj, prefixe=''):
    """Retourne l'ensemble des chemins clé menant à une liste de phrases."""
    cles = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            nouveau = f'{prefixe}.{k}' if prefixe else k
            if isinstance(v, list) and all(isinstance(i, str) for i in v):
                cles.add(nouveau)
            else:
                cles |= extraire_cles_recursif(v, nouveau)
    return cles


def audit_coherence_fr_en(fichier, d_fr, d_en):
    print(f'\n── COHÉRENCE FR ↔ EN — {fichier} ──')
    if d_fr is None or d_en is None:
        warn('Impossible de comparer (fichier(s) manquant(s))')
        return

    cles_fr = extraire_cles_recursif(d_fr)
    cles_en = extraire_cles_recursif(d_en)

    manque_en = cles_fr - cles_en
    manque_fr = cles_en - cles_fr

    if not manque_en and not manque_fr:
        ok('Clés identiques FR ↔ EN')
    else:
        if manque_en:
            warn(f'{len(manque_en)} clé(s) présente(s) en FR mais absente(s) en EN — ex: {sorted(manque_en)[:3]}')
        if manque_fr:
            warn(f'{len(manque_fr)} clé(s) présente(s) en EN mais absente(s) en FR — ex: {sorted(manque_fr)[:3]}')

    # Déséquilibres de taille
    desequilibres = []
    for cle in cles_fr & cles_en:
        def get_pool(d, chemin):
            noeud = d
            for k in chemin.split('.'):
                if not isinstance(noeud, dict):
                    return None
                noeud = noeud.get(k)
            return noeud if isinstance(noeud, list) else None

        pool_fr = get_pool(d_fr, cle)
        pool_en = get_pool(d_en, cle)
        if pool_fr is not None and pool_en is not None and len(pool_fr) != len(pool_en):
            desequilibres.append((cle, len(pool_fr), len(pool_en)))

    if desequilibres:
        warn(f'{len(desequilibres)} pool(s) déséquilibré(s) FR≠EN — ex:')
        for cle, nfr, nen in desequilibres[:5]:
            print(f'       {cle} : FR={nfr} EN={nen}')
    else:
        ok('Tailles de pools identiques FR ↔ EN')


# ══════════════════════════════════════════════════════════════════════
#  Point d'entrée
# ══════════════════════════════════════════════════════════════════════
def main():
    global nb_erreurs, nb_avertiss, nb_infos
    print('══════════════════════════════════════════════')
    print(f'AUDIT ARIA TEMPLATES — {datetime.now().strftime("%Y-%m-%d %H:%M")}')
    print('══════════════════════════════════════════════')

    resultats = {}  # lang → { fichier → (data, phrases) }

    for lang in LANGUES:
        resultats[lang] = {}
        d_q = charger(lang, 'aria_questions.json')
        d_r = charger(lang, 'aria_reponses.json')
        d_s = charger(lang, 'aria_syntheses.json')
        d_a = charger(lang, 'aria_annotations.json')

        p_q = audit_questions(lang, d_q)
        p_r = audit_reponses(lang, d_r)
        p_s = audit_syntheses(lang, d_s)
        p_a = audit_annotations(lang, d_a)

        resultats[lang] = {
            'questions':   (d_q, p_q),
            'reponses':    (d_r, p_r),
            'syntheses':   (d_s, p_s),
            'annotations': (d_a, p_a),
        }

        audit_croises(
            lang,
            d_q, d_r, d_s, d_a,
            p_r, p_s, p_a,
        )

    # Cohérence FR ↔ EN par fichier
    fichiers = ['aria_questions.json', 'aria_reponses.json', 'aria_syntheses.json', 'aria_annotations.json']
    clefs    = ['questions', 'reponses', 'syntheses', 'annotations']
    for fichier, clef in zip(fichiers, clefs):
        d_fr = resultats['fr'][clef][0]
        d_en = resultats['en'][clef][0]
        audit_coherence_fr_en(fichier, d_fr, d_en)

    # Résumé global
    print('\n══════════════════════════════════════════════')
    print('RÉSUMÉ GLOBAL')
    print('══════════════════════════════════════════════')
    print(f'  Fichiers audités    : 8')
    print(f'  Erreurs bloquantes  : {nb_erreurs}')
    print(f'  Avertissements      : {nb_avertiss}')
    print(f'  Infos               : {nb_infos}')

    if nb_erreurs:
        print('\n  ❌ Des erreurs bloquantes ont été détectées.')
        sys.exit(1)
    else:
        print('\n  ✅ Audit terminé sans erreur bloquante.')


if __name__ == '__main__':
    main()
