// src/features/init/components/RealCountryAISection.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  RealCountryAISection.jsx — Saisie libre d'un pays réel (mode IA)
//
//  Propose un dropdown des pays prédéfinis + saisie libre avec validation
//  en temps réel via validateCountryWithAI (RestCountries, 3 passes).
//  Si le pays est reconnu, récupère drapeau/population/région depuis l'API.
//
//  Dépendances : shared/services/country (validateCountryWithAI)
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { FONT, INPUT_STYLE, SELECT_STYLE, labelStyle } from '../../../shared/theme';
import { getRealCountries } from '../services/realCountries';
import { validateCountryWithAI } from '../../../shared/services/country';
import { CountryInfoCard } from './index';

export default function RealCountryAISection({ country, onChange, setField, selectedRealIds = [] }) {
    const { lang } = useLocale();
    const [rcSearch, setRcSearch] = useState(country.nom || '');
    const [rcStatus, setRcStatus] = useState(null);
    const [rcSuggestion, setRcSuggestion] = useState(null);
    const rcTimer = useRef(null);
    const rcQueryRef = useRef('');

    // Recherche un pays : d'abord local (getRealCountries), puis validation via RestCountries.
    // Utilise rcQueryRef pour ignorer les réponses de requêtes obsolètes (race condition).
    const searchRestCountries = async (query) => {
        rcQueryRef.current = query;
        if (!query || query.length < 3) { setRcStatus(null); return; }

        const local = getRealCountries().find(r =>
        r.nom.toLowerCase() === query.toLowerCase() ||
        r.id === query.toLowerCase().replace(/[^a-z]/g, '')
        );

        if (local) {
            if (selectedRealIds.includes(local.id)) {
                setRcStatus('duplicate');
                onChange({ ...country, _rcStatus: 'duplicate', realData: null });
                return;
            }
            onChange({ ...country, nom: local.nom, regime: local.regime, terrain: local.terrain, realData: local, _rcStatus: 'found' });
            setRcStatus('found');
            return;
        }

        setRcStatus('searching');
        try {
            const ai = await validateCountryWithAI(query, lang);
            if (rcQueryRef.current !== query) return;

            if (ai.status === 'notfound' || !ai.displayName) {
                setRcStatus('notfound');
                onChange({ ...country, _rcStatus: 'notfound', _rcSuggestion: null });
                return;
            }

            if (ai.status === 'suggestion') {
                setRcStatus('suggestion');
                setRcSuggestion(ai.displayName);
                onChange({ ...country, _rcStatus: 'suggestion', _rcSuggestion: ai.displayName });
                return;
            }

            // found
            const nom = ai.displayName;
            const synthId = nom.toLowerCase().replace(/[^a-z0-9]/g, '-');
            if (selectedRealIds.includes(synthId)) {
                setRcStatus('duplicate');
                onChange({ ...country, _rcStatus: 'duplicate', realData: null });
                return;
            }
            let flag = '🌐', population = 5_000_000, region = '';
            try {
                const rc = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(ai.canonicalName || nom)}?fields=name,flag,population,region`)
                .then(r => r.ok ? r.json() : []);
                if (rc[0]) {
                    flag = rc[0].flag || '🌐';
                    population = rc[0].population || 5_000_000;
                    region = rc[0].region || '';
                    if (selectedRealIds.includes(rc[0].cca2?.toLowerCase() || synthId)) {
                        setRcStatus('duplicate');
                        onChange({ ...country, _rcStatus: 'duplicate', realData: null });
                        return;
                    }
                }
            } catch (_) { }

            const synth = {
                id: synthId,
                nom, flag, regime: 'democratie_liberale', terrain: 'coastal',
                population, region, _fromApi: true,
                leader: { nom, titre: lang === 'fr' ? 'Chef d\'État' : 'Head of State', trait: '' },
            };
            onChange({ ...country, nom, realData: synth, _rcStatus: 'found' });
            setRcStatus('found');
        } catch (_) {
            setRcStatus('error');
        }
    };

    // Debounce
    useEffect(() => {
        rcQueryRef.current = '';
        setRcStatus(null);
        setRcSuggestion(null);
        clearTimeout(rcTimer.current);
        if (!rcSearch || rcSearch.length < 3) return;
        rcTimer.current = setTimeout(() => searchRestCountries(rcSearch), 700);
        return () => clearTimeout(rcTimer.current);
    }, [rcSearch]);

    const nomLow = country.nom?.toLowerCase().replace(/[^a-z]/g, '') || '';
    const knownMatch = getRealCountries().find(r =>
    r.nom.toLowerCase() === country.nom?.toLowerCase() ||
    r.id === nomLow
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
        <div style={{ ...labelStyle('0.43rem'), marginBottom: '0.3rem' }}>{t('COUNTRY_NAME', lang)}</div>
        <select
        style={SELECT_STYLE}
        value={knownMatch?.id || '_free'}
        onChange={e => {
            if (e.target.value === '_free') { setField('nom', ''); setRcSearch(''); }
            else {
                const rc = getRealCountries().find(r => r.id === e.target.value);
                if (rc) {
                    setField('nom', rc.nom);
                    setRcSearch(rc.nom);
                }
            }
        }}
        >
        <option value="_free">— Saisir librement —</option>
        {[...getRealCountries()]
            .sort((a, b) => {
                const aPris = selectedRealIds.includes(a.id);
                const bPris = selectedRealIds.includes(b.id);
                if (aPris === bPris) return 0;
                return aPris ? 1 : -1;
            })
            .map(rc => {
                const pris = selectedRealIds.includes(rc.id);
                return <option key={rc.id} value={rc.id} disabled={pris}>{rc.flag} {rc.nom}{pris ? ' ✗' : ''}</option>;
            })}
        </select>

        {!knownMatch && (
            <div style={{ marginTop: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(100,120,160,0.45)' }}>VÉRIFICATION</span>
            {rcStatus === 'searching' && <span style={{ color: 'rgba(200,164,74,0.55)', fontSize: '0.38rem' }}>⟳ vérification…</span>}
            {rcStatus === 'found' && <span style={{ color: 'rgba(58,191,122,0.80)', fontSize: '0.38rem' }}>✓ pays reconnu</span>}
            {rcStatus === 'notfound' && <span style={{ color: 'rgba(200,80,80,0.70)', fontSize: '0.38rem' }}>✗ pays inconnu</span>}
            {rcStatus === 'duplicate' && <span style={{ color: 'rgba(200,140,40,0.85)', fontSize: '0.38rem' }}>⚠ pays déjà sélectionné</span>}
            {rcStatus === 'error' && <span style={{ color: 'rgba(200,164,74,0.50)', fontSize: '0.38rem' }}>⚠ hors ligne</span>}
            {rcStatus === 'suggestion' && rcSuggestion && (
                <button
                onClick={() => {
                    setField('nom', rcSuggestion);
                    setRcSearch(rcSuggestion);
                    setRcStatus(null);
                    setRcSuggestion(null);
                }}
                style={{
                    fontFamily: FONT.mono,
                    fontSize: '0.38rem',
                    color: 'rgba(200,164,74,0.90)',
                                                           background: 'rgba(200,164,74,0.10)',
                                                           border: '1px solid rgba(200,164,74,0.30)',
                                                           borderRadius: '2px',
                                                           padding: '0.10rem 0.40rem',
                                                           cursor: 'pointer'
                }}
                >
                → {rcSuggestion} ?
                </button>
            )}
            </div>
            <input
            style={{ ...INPUT_STYLE, fontSize: '0.54rem', width: '100%' }}
            value={country.nom || ''}
            onChange={e => {
                setField('nom', e.target.value);
                setRcSearch(e.target.value);
            }}
            placeholder="Ex : Canada, Maroc, Singapour…"
            />
            </div>
        )}
        </div>

        {knownMatch
            ? <CountryInfoCard data={knownMatch} />
            : country.nom && (
                <div style={{ fontSize: '0.43rem', color: 'rgba(100,120,160,0.50)', fontStyle: 'italic', lineHeight: 1.5 }}>
                ⚡ L'IA génèrera <strong style={{ color: 'rgba(200,164,74,0.60)' }}>{country.nom}</strong> basé sur sa situation politique actuelle.
                </div>
            )
        }
        </div>
    );
}
