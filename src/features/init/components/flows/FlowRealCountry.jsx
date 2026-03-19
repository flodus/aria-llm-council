// src/features/init/components/flows/FlowRealCountry.jsx

import { useState, useRef } from 'react';
import { useLocale, t } from '../../../../ariaI18n';
import {
    FONT, CARD_STYLE, INPUT_STYLE, SELECT_STYLE,
    BTN_PRIMARY, BTN_SECONDARY, labelStyle,
    wrapNarrow
} from '../../../../shared/theme';
import { getRealCountries } from '../../services/realCountries';
import { validateCountryWithAI } from '../../../../shared/services/country';
import ARIAHeader from '../ARIAHeader';
import CountryInfoCard from '../CountryInfoCard';

export default function FlowRealCountry({ worldName, onConfirm, onBack }) {
    const { lang } = useLocale();
    const [defautReel, setDefautReel] = useState('');
    const [defautNom, setDefautNom] = useState('');
    const [rcStatus, setRcStatus] = useState(null);
    const [rcSuggestion, setRcSuggestion] = useState(null);
    const [rcDefautData, setRcDefautData] = useState(null);
    const rcTimer = useRef(null);
    const rcQueryRef = useRef('');

    const searchDefautCountry = async (query) => {
        if (!query || query.length < 3) { setRcStatus(null); return; }
        rcQueryRef.current = query;

        const local = getRealCountries().find(r =>
        r.nom.toLowerCase() === query.toLowerCase() ||
        r.id === query.toLowerCase().replace(/[^a-z]/g,'')
        );
        if (local) {
            if (rcQueryRef.current !== query) return;
            setRcStatus('found');
            return;
        }

        setRcStatus('searching');
        try {
            const ai = await validateCountryWithAI(query, lang);
            if (rcQueryRef.current !== query) return;

            if (ai.status === 'notfound' || !ai.displayName) {
                setRcStatus('notfound');
            } else if (ai.status === 'suggestion') {
                setRcStatus('suggestion');
                setRcSuggestion(ai.displayName);
            } else {
                setRcStatus('found');
                setDefautNom(ai.displayName);

                try {
                    const rc = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(ai.canonicalName||ai.displayName)}?fields=name,flag,population,region`)
                    .then(r => r.ok ? r.json() : []);
                    if (rc[0]) {
                        setRcDefautData({
                            id: ai.displayName.toLowerCase().replace(/[^a-z0-9]/g,'-'),
                                        nom: ai.displayName,
                                        flag: rc[0].flag || '🌐',
                                        regime: 'democratie_liberale',
                                        terrain: 'coastal',
                                        population: rc[0].population || 5_000_000,
                                        region: rc[0].region || '',
                                        _fromApi: true,
                        });
                    }
                } catch(_) {}
            }
        } catch(_) {
            if (rcQueryRef.current === query) setRcStatus('error');
        }
    };

    const knownReel = getRealCountries().find(r => r.id === defautReel);
    const canLaunch = defautReel || (defautNom.trim() && rcStatus === 'found');

    const H = (txt) => <div style={{ ...labelStyle(), alignSelf: 'flex-start' }}>{txt} — {worldName}</div>;
    const BtnRow = ({ children }) => <div style={{ display: 'flex', gap: '0.6rem', width: '100%', justifyContent: 'space-between' }}>{children}</div>;

    return (
        <div style={wrapNarrow}>
        <ARIAHeader showQuote={false} />
        {H('PAYS RÉEL')}

        <div style={{ ...CARD_STYLE, width: '100%', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        <select style={SELECT_STYLE} value={defautReel}
        onChange={e => {
            setDefautReel(e.target.value);
            setDefautNom('');
            setRcStatus(null);
            setRcSuggestion(null);
            setRcDefautData(null);
        }}>
        <option value="">— ou tapez un nom ci-dessous —</option>
        {getRealCountries().map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
        </select>

        <div style={{ fontFamily: FONT.mono, fontSize: '0.42rem', color: 'rgba(140,160,200,0.35)', textAlign: 'center' }}>— OU —</div>

        <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(100,120,160,0.45)' }}>SAISIE LIBRE</span>
        {rcStatus === 'searching' && <span style={{ color: 'rgba(200,164,74,0.55)', fontSize: '0.38rem' }}>⟳ vérification…</span>}
        {rcStatus === 'found' && <span style={{ color: 'rgba(58,191,122,0.80)', fontSize: '0.38rem' }}>✓ pays reconnu</span>}
        {rcStatus === 'notfound' && <span style={{ color: 'rgba(200,80,80,0.70)', fontSize: '0.38rem' }}>✗ pays inconnu</span>}
        {rcStatus === 'error' && <span style={{ color: 'rgba(200,164,74,0.50)', fontSize: '0.38rem' }}>⚠ hors ligne</span>}
        {rcStatus === 'suggestion' && rcSuggestion && (
            <button onClick={() => {
                setDefautNom(rcSuggestion);
                setRcStatus(null);
                setRcSuggestion(null);
                clearTimeout(rcTimer.current);
                setTimeout(() => searchDefautCountry(rcSuggestion), 50);
            }}
            style={{
                fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(200,164,74,0.90)',
                                                       background: 'rgba(200,164,74,0.10)', border: '1px solid rgba(200,164,74,0.30)',
                                                       borderRadius: '2px', padding: '0.10rem 0.40rem', cursor: 'pointer'
            }}>
            → {rcSuggestion} ?
            </button>
        )}
        </div>
        <input style={{ ...INPUT_STYLE, fontSize: '0.53rem', width: '100%' }}
        value={defautNom}
        onChange={e => {
            setDefautNom(e.target.value);
            setDefautReel('');
            rcQueryRef.current = '';
            setRcStatus(null);
            setRcSuggestion(null);
            setRcDefautData(null);
            clearTimeout(rcTimer.current);
            rcTimer.current = setTimeout(() => searchDefautCountry(e.target.value), 700);
        }}
        placeholder={t('COUNTRY_NAME_PH', lang)} />
        </div>

        {knownReel
            ? <CountryInfoCard data={knownReel} />
            : defautNom && (
                <div style={{ fontSize: '0.43rem', color: 'rgba(100,120,160,0.55)', fontStyle: 'italic', lineHeight: 1.5 }}>
                ⚡ L'IA génèrera <strong style={{ color: 'rgba(200,164,74,0.65)' }}>{defautNom}</strong> depuis sa situation politique actuelle.
                </div>
            )}
            </div>

            <BtnRow>
            <button style={BTN_SECONDARY} onClick={onBack}>{t('BACK', lang)}</button>
            <button style={{ ...BTN_PRIMARY, opacity: canLaunch ? 1 : 0.35 }}
            disabled={!canLaunch}
            onClick={() => onConfirm({
                type: 'reel',
                nom: knownReel?.nom || defautNom,
                realData: knownReel || rcDefautData || null
            })}>
            {t('GENERATE_SHORT', lang)}
            </button>
            </BtnRow>
            </div>
    );
}
