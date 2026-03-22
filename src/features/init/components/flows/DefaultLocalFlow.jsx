// src/features/init/components/flows/DefaultLocalFlow.jsx

import { useState } from 'react';
import { useLocale, t } from '../../../../ariaI18n';
import {
    FONT, CARD_STYLE, INPUT_STYLE, SELECT_STYLE,
    BTN_PRIMARY, BTN_SECONDARY, labelStyle,
    wrapWide, mCard
} from '../../../../shared/theme';
import { getTerrainLabelMap, getRegimeLabelMap, getTerrainIcon, getRegimeIcon, getPaysLocaux } from '../../services/labels';
import ARIAHeader from '../ARIAHeader';

export default function DefaultLocalFlow({ worldName, onBack, onPreLaunch }) {
    const { lang } = useLocale();
    const [selFictifs, setSelFictifs] = useState([]);    // ids PAYS_LOCAUX + 'new'
    // Création nation personnalisée
    const [defautNom, setDefautNom] = useState('');
    const [newFictifTerrain, setNewFictifTerrain] = useState('coastal');
    const [newFictifRegime, setNewFictifRegime] = useState('democratie_liberale');

    // Helpers JSX
    const H = (txt) => <div style={{ ...labelStyle(), alignSelf:'flex-start' }}>{txt} — {worldName}</div>;
    const MC = (props) => <div style={{ ...mCard, ...props.style }} onClick={props.onClick}>{props.children}</div>;
    const McTitle = ({ t: txt }) => <div style={{ fontFamily:FONT.cinzel, fontSize:'0.54rem', letterSpacing:'0.14em', color:'rgba(200,164,74,0.88)' }}>{txt}</div>;
    const McSub = ({ t: txt }) => <div style={{ fontSize:'0.47rem', color:'rgba(140,160,200,0.55)', lineHeight:1.55 }}>{txt}</div>;
    const BtnRow = ({ children }) => <div style={{ position:'fixed', bottom:'8vh', left:'50%', transform:'translateX(-50%)', width:'min(700px, 90vw)', display:'flex', gap:'0.6rem', justifyContent:'space-between', zIndex:20 }}>{children}</div>;

    const toggleFictif = (id) => setSelFictifs(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 6 ? [...prev, id] : prev
    );

    const isNew = selFictifs.includes('new');
    const selectedPays = selFictifs
        .filter(id => id !== 'new')
        .map(id => getPaysLocaux().find(p => p.id === id))
        .filter(Boolean);

    const canPlay = selectedPays.length >= 1 || (isNew && defautNom.trim().length > 0);

    const handleJouer = () => {
        const defs = selectedPays.map(p => ({ type:'imaginaire', realData: p }));
        if (isNew && defautNom.trim()) {
            defs.push({ type:'imaginaire', nom: defautNom.trim(), terrain: newFictifTerrain, regime: newFictifRegime, realData: null });
        }
        onPreLaunch('defaut_local', defs);
    };

    // Estimations pour la carte "créer"
    const ARIA_BASE = {
        republique_federale:44, democratie_liberale:48, monarchie_constitutionnelle:38,
        technocratie_ia:72, oligarchie:26, junte_militaire:16, regime_autoritaire:20,
        monarchie_absolue:28, theocratie:18, communisme:32
    };
    const POP_BASE = {
        coastal:8_000_000, inland:5_000_000, highland:3_500_000,
        island:2_000_000, archipelago:1_500_000
    };
    const SAT_BASE = {
        democratie_liberale:62, republique_federale:58, monarchie_constitutionnelle:55,
        technocratie_ia:60, oligarchie:40, junte_militaire:35, regime_autoritaire:38,
        theocratie:50, communisme:45
    };

    return (
        <div style={wrapWide}>
        <ARIAHeader showQuote={false} />
        {H('NATIONS FICTIVES')}

        {/* Grille : presets multi-sélectables + carte Créer */}
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

        {/* Carte Créer une nation fictive */}
        <MC
        style={{
            border: isNew ? '1px solid rgba(58,191,122,0.55)' : '1px solid rgba(58,191,122,0.18)',
            background: isNew ? 'rgba(58,191,122,0.07)' : undefined,
            cursor:'pointer', justifyContent:'center', alignItems:'center',
        }}
        onClick={() => toggleFictif('new')}>
        <div style={{ fontSize:'1.4rem' }}>🌍</div>
        <McTitle t={t('CREATE', lang)} />
        <McSub t={lang === 'en' ? 'Custom fictional nation' : 'Nation fictive personnalisée'} />
        {isNew && <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(58,191,122,0.80)', letterSpacing:'0.10em' }}>✓ SÉLECTIONNÉ</div>}
        </MC>
        </div>

        {/* Formulaire création nation — visible si 'new' sélectionné */}
        {isNew && (
            <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.65rem' }}>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem', letterSpacing:'0.16em', color:'rgba(58,191,122,0.55)' }}>
            {t('NEW_NATION', lang)}
            </div>
            <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>NOM</div>
            <input
            style={{ ...INPUT_STYLE, fontSize:'0.54rem', border:'1px solid rgba(58,191,122,0.25)' }}
            value={defautNom}
            onChange={e => setDefautNom(e.target.value)}
            placeholder="Ex : Arvalia, Morvaine, Zephoria…"
            autoFocus
            />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
            <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('TERRAIN', lang)}</div>
            <select style={SELECT_STYLE} value={newFictifTerrain} onChange={e => setNewFictifTerrain(e.target.value)}>
            {Object.entries(getTerrainLabelMap(lang)).map(([k,v]) => <option key={k} value={k}>{getTerrainIcon(k)} {v}</option>)}
            </select>
            </div>
            <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('REGIME', lang)}</div>
            <select style={SELECT_STYLE} value={newFictifRegime} onChange={e => setNewFictifRegime(e.target.value)}>
            {Object.entries(getRegimeLabelMap(lang)).map(([k,v]) => <option key={k} value={k}>{getRegimeIcon(k)} {v}</option>)}
            </select>
            </div>
            </div>
            {/* Estimations */}
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap', padding:'0.35rem 0.5rem', background:'rgba(58,191,122,0.03)', borderLeft:'2px solid rgba(58,191,122,0.15)', borderRadius:'2px' }}>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.50)' }}>
            👥 ~{((POP_BASE[newFictifTerrain] || 5e6) / 1e6).toFixed(1)} M hab.
            </span>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.50)' }}>
            😊 ~{SAT_BASE[newFictifRegime] || 50}% sat.
            </span>
            {(() => {
                const irl = ARIA_BASE[newFictifRegime] ?? 35;
                const col = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';
                return <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:col }}>◈ ARIA IRL ~{irl}%</span>;
            })()}
            </div>
            </div>
        )}

        {selFictifs.length > 0 && (
            <div style={{ fontFamily:FONT.mono, fontSize:'0.41rem', color:'rgba(140,160,200,0.50)', alignSelf:'flex-start' }}>
            {selFictifs.length} nation{selFictifs.length > 1 ? 's' : ''} sélectionnée{selFictifs.length > 1 ? 's' : ''}
            {isNew && defautNom.trim() ? ` (dont ${defautNom.trim()})` : isNew ? ' (+ nom requis)' : ''}
            </div>
        )}

        <BtnRow>
        <button style={BTN_SECONDARY} onClick={onBack}>{t('BACK', lang)}</button>
        <button
            style={{ ...BTN_PRIMARY, opacity: canPlay ? 1 : 0.35 }}
            disabled={!canPlay}
            onClick={handleJouer}>
            JOUER →
        </button>
        </BtnRow>
        </div>
    );
}
