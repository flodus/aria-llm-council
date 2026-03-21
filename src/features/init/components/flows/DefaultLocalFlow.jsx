// src/features/init/components/flows/DefaultLocalFlow.jsx

import { useState } from 'react';
import { useLocale, t } from '../../../../ariaI18n';
import {
    FONT, CARD_STYLE,
    BTN_PRIMARY, BTN_SECONDARY, labelStyle,
    wrapNarrow, wrapWide, mCard
} from '../../../../shared/theme';
import { getTerrainLabelMap, getRegimeLabelMap, getPaysLocaux } from '../../services/labels';
import { getRealCountries } from '../../services/realCountries';  // ← corrigé !
import ARIAHeader from '../ARIAHeader';
import CountryInfoCard from '../CountryInfoCard';

export default function DefaultLocalFlow({ worldName, onBack, onPreLaunch }) {
    const { lang } = useLocale();
    const [defautType, setDefautType] = useState(null);  // 'fictif'|'reel'
    const [selFictifs, setSelFictifs] = useState([]);    // ids PAYS_LOCAUX sélectionnés (multi)
    const [defautReel, setDefautReel] = useState('');    // id REAL_COUNTRIES_DATA

    // Helpers JSX
    const H = (txt) => <div style={{ ...labelStyle(), alignSelf:'flex-start' }}>{txt} — {worldName}</div>;
    const MC = (props) => <div style={{ ...mCard, ...props.style }} onClick={props.onClick}>{props.children}</div>;
    const McTitle = ({ t }) => <div style={{ fontFamily:FONT.cinzel, fontSize:'0.54rem', letterSpacing:'0.14em', color:'rgba(200,164,74,0.88)' }}>{t}</div>;
    const McSub = ({ t }) => <div style={{ fontSize:'0.47rem', color:'rgba(140,160,200,0.55)', lineHeight:1.55 }}>{t}</div>;
    const BtnRow = ({ children }) => <div style={{ position:'fixed', bottom:'8vh', left:'50%', transform:'translateX(-50%)', width:'min(700px, 90vw)', display:'flex', gap:'0.6rem', justifyContent:'space-between', zIndex:20 }}>{children}</div>;

    // Écran de choix du type (fictif/réel)
    if (!defautType) {
        return (
            <div style={wrapNarrow}>
            <ARIAHeader showQuote={false} />
            {H('NATION DE DÉPART')}
            <div style={{ display:'flex', gap:'0.8rem', width:'100%' }}>
            <MC onClick={() => setDefautType('fictif')}>
            <div style={{ fontSize:'1.3rem' }}>🌐</div>
            <McTitle t={t('FICTIONAL_NATION', lang)} />
            <McSub t={t('PRESET_NATION_DESC', lang)} />
            </MC>
            <MC onClick={() => setDefautType('reel')}>
            <div style={{ fontSize:'1.3rem' }}>🗺</div>
            <McTitle t={t('REAL_COUNTRY', lang)} />
            <McSub t={t('REAL_COUNTRY_DESC', lang)} />
            </MC>
            </div>
            <BtnRow>
            <button style={BTN_SECONDARY} onClick={onBack}>{t('BACK', lang)}</button>
            </BtnRow>
            </div>
        );
    }

    // Écran de sélection fictif (multi-sélection)
    if (defautType === 'fictif') {
        const toggleFictif = (id) => setSelFictifs(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 6 ? [...prev, id] : prev
        );
        const selectedPays = selFictifs.map(id => getPaysLocaux().find(p => p.id === id)).filter(Boolean);
        const canPlay = selFictifs.length >= 1;

        return (
            <div style={wrapWide}>
            <ARIAHeader showQuote={false} />
            {H('NATIONS FICTIVES')}

            {/* Grille : presets multi-sélectables */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'0.7rem', width:'100%' }}>
            {getPaysLocaux().map(p => (
                <MC key={p.id}
                style={{
                    border: selFictifs.includes(p.id) ? `1px solid ${p.couleur}70` : undefined,
                    background: selFictifs.includes(p.id) ? `${p.couleur}14` : undefined,
                    cursor:'pointer',
                }}
                onClick={() => toggleFictif(p.id)}>
                <div style={{ fontSize:'1.2rem' }}>{p.emoji}</div>
                <McTitle t={p.nom} />
                <McSub t={`${getTerrainLabelMap(lang)[p.terrain] || p.terrain} · ${getRegimeLabelMap(lang)[p.regime] || p.regime.replace(/_/g,' ')}`} />
                {selFictifs.includes(p.id) && (
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:`${p.couleur}`, letterSpacing:'0.10em' }}>✓ SÉLECTIONNÉ</div>
                )}
                </MC>
            ))}
            </div>

            {selFictifs.length > 0 && (
                <div style={{ fontFamily:FONT.mono, fontSize:'0.41rem', color:'rgba(140,160,200,0.50)', alignSelf:'flex-start' }}>
                {selFictifs.length} nation{selFictifs.length > 1 ? 's' : ''} sélectionnée{selFictifs.length > 1 ? 's' : ''}
                </div>
            )}

            <BtnRow>
            <button style={BTN_SECONDARY} onClick={() => { setDefautType(null); setSelFictifs([]); }}>{t('BACK', lang)}</button>
            <button
                style={{ ...BTN_PRIMARY, opacity: canPlay ? 1 : 0.35 }}
                disabled={!canPlay}
                onClick={() => onPreLaunch('defaut_local', selectedPays.map(p => ({ type:'imaginaire', realData: p })))}>
                JOUER →
            </button>
            </BtnRow>
            </div>
        );
    }

    // Écran de sélection pays réel
    if (defautType === 'reel') {
        const chosen = getRealCountries().find(r => r.id === defautReel);
        return (
            <div style={wrapNarrow}>
            <ARIAHeader showQuote={false} />
            {H('PAYS RÉEL')}
            <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.7rem' }}>
            <select style={SELECT_STYLE} value={defautReel}
            onChange={e => setDefautReel(e.target.value)}>
            <option value="">— Choisir un pays —</option>
            {getRealCountries().map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
            </select>
            {chosen && <CountryInfoCard data={chosen} />}
            </div>
            <BtnRow>
            <button style={BTN_SECONDARY} onClick={() => setDefautType(null)}>{t('BACK', lang)}</button>
            <button style={{ ...BTN_PRIMARY, opacity: defautReel ? 1 : 0.35 }}
            disabled={!defautReel}
            onClick={() => onPreLaunch('defaut_local', [{ type:'reel', realData: chosen }])}>
            JOUER →
            </button>
            </BtnRow>
            </div>
        );
    }

    return null;
}
