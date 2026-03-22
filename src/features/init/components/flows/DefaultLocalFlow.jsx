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
    const [selFictifs, setSelFictifs] = useState([]);        // ids PAYS_LOCAUX
    const [customCountries, setCustomCountries] = useState([]); // [{id, nom, terrain, regime, confirmed}]
    // Formulaire de la tuile CRÉER (null = fermé, objet = en cours d'édition)
    const [creatingForm, setCreatingForm] = useState(null);

    // Helpers JSX
    const H = (txt) => <div style={{ ...labelStyle(), alignSelf:'flex-start' }}>{txt} — {worldName}</div>;
    const MC = (props) => <div style={{ ...mCard, ...props.style }} onClick={props.onClick}>{props.children}</div>;
    const McTitle = ({ t: txt }) => <div style={{ fontFamily:FONT.cinzel, fontSize:'0.54rem', letterSpacing:'0.14em', color:'rgba(200,164,74,0.88)' }}>{txt}</div>;
    const McSub = ({ t: txt }) => <div style={{ fontSize:'0.47rem', color:'rgba(140,160,200,0.55)', lineHeight:1.55 }}>{txt}</div>;
    const BtnRow = ({ children }) => <div style={{ position:'fixed', bottom:'8vh', left:'50%', transform:'translateX(-50%)', width:'min(700px, 90vw)', display:'flex', gap:'0.6rem', justifyContent:'space-between', zIndex:20 }}>{children}</div>;

    const totalSelected = selFictifs.length + customCountries.length;
    const canAdd = totalSelected < 6;

    const toggleFictif = (id) => setSelFictifs(prev =>
        prev.includes(id)
            ? prev.filter(x => x !== id)
            : canAdd ? [...prev, id] : prev
    );

    const removeCustom = (id) => setCustomCountries(prev => prev.filter(c => c.id !== id));

    // Ouverture du formulaire CRÉER
    const openCreating = () => {
        if (!canAdd) return;
        setCreatingForm({ nom: '', terrain: 'coastal', regime: 'democratie_liberale' });
    };

    // Confirmation du formulaire → ajoute la tuile
    const confirmCreating = () => {
        if (!creatingForm || !creatingForm.nom.trim()) return;
        setCustomCountries(prev => [...prev, {
            id: Math.random().toString(36).slice(2),
            nom: creatingForm.nom.trim(),
            terrain: creatingForm.terrain,
            regime: creatingForm.regime,
        }]);
        setCreatingForm(null);
    };

    const selectedPays = selFictifs
        .map(id => getPaysLocaux().find(p => p.id === id))
        .filter(Boolean);

    const canPlay = selectedPays.length >= 1 || customCountries.some(c => c.nom.trim().length > 0);

    const handleJouer = () => {
        const defs = [
            ...selectedPays.map(p => ({ type:'imaginaire', realData: p })),
            ...customCountries
                .filter(c => c.nom.trim())
                .map(c => ({ type:'imaginaire', nom: c.nom.trim(), terrain: c.terrain, regime: c.regime, realData: null }))
        ];
        onPreLaunch('defaut_local', defs);
    };

    // Estimations pour les pays custom
    const POP_BASE = {
        coastal:8_000_000, inland:5_000_000, highland:3_500_000,
        island:2_000_000, archipelago:1_500_000,
        desert:1_800_000, foret:2_500_000, tropical:4_200_000, toundra:900_000,
    };
    const SAT_BASE = {
        democratie_liberale:62, republique_federale:58, monarchie_constitutionnelle:55,
        democratie_directe:66, technocratie_ia:60, oligarchie:40, junte_militaire:35,
        regime_autoritaire:38, theocratie:50, communisme:45, nationalisme_autoritaire:36, monarchie_absolue:42,
    };
    const ARIA_BASE = {
        republique_federale:44, democratie_liberale:48, monarchie_constitutionnelle:38, democratie_directe:52,
        technocratie_ia:72, oligarchie:26, junte_militaire:16, regime_autoritaire:20,
        monarchie_absolue:28, theocratie:18, communisme:32, nationalisme_autoritaire:14,
    };

    return (
        <div style={wrapWide}>
        <ARIAHeader showQuote={false} />
        {H('NATIONS FICTIVES')}

        {/* Grille : presets + nations custom confirmées + tuile CRÉER */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'0.7rem', width:'100%' }}>

        {/* Presets multi-sélectables */}
        {getPaysLocaux().map(p => {
            const sel = selFictifs.includes(p.id);
            const disabled = !sel && !canAdd;
            return (
                <MC key={p.id}
                style={{
                    background: sel ? `linear-gradient(135deg, rgba(8,14,26,0.78) 60%, ${p.couleur}28)` : 'rgba(8,14,26,0.78)',
                    border: sel ? `1px solid ${p.couleur}80` : '1px solid rgba(140,160,200,0.12)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.45 : 1,
                    backdropFilter: 'blur(2px)',
                }}
                onClick={() => !disabled && toggleFictif(p.id)}>
                <div style={{ fontSize:'1.2rem' }}>{p.emoji}</div>
                <McTitle t={p.nom} />
                <McSub t={`${getTerrainIcon(p.terrain)} ${getTerrainLabelMap(lang)[p.terrain] || p.terrain} · ${getRegimeIcon(p.regime)} ${getRegimeLabelMap(lang)[p.regime] || p.regime.replace(/_/g,' ')}`} />
                {p.description && (
                    <div style={{ fontSize:'0.40rem', color:'rgba(140,160,200,0.42)', lineHeight:1.5, marginTop:'0.15rem' }}>{p.description}</div>
                )}
                <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.2rem' }}>
                    {p.population && <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(140,160,200,0.40)' }}>👥 {(p.population/1e6).toFixed(1)}M</span>}
                    {p.satisfaction && <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(140,160,200,0.40)' }}>😊 {p.satisfaction}%</span>}
                </div>
                {sel && (
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:`${p.couleur}`, letterSpacing:'0.10em', marginTop:'0.1rem' }}>✓ SÉLECTIONNÉ</div>
                )}
                </MC>
            );
        })}

        {/* Tuiles nations custom confirmées */}
        {customCountries.map(c => {
            const irl = ARIA_BASE[c.regime] ?? 35;
            const col = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';
            return (
                <div key={c.id} style={{ ...mCard, border:'1px solid rgba(58,191,122,0.35)', background:'rgba(8,14,26,0.78)', backdropFilter:'blur(2px)', position:'relative' }}>
                <button
                    onClick={() => removeCustom(c.id)}
                    style={{ position:'absolute', top:'0.35rem', right:'0.4rem', background:'none', border:'none', cursor:'pointer', fontSize:'0.70rem', color:'rgba(200,80,80,0.55)', lineHeight:1 }}
                    title={lang === 'en' ? 'Remove' : 'Supprimer'}
                >✕</button>
                <div style={{ fontSize:'1.2rem' }}>🌐</div>
                <div style={{ fontFamily:FONT.cinzel, fontSize:'0.54rem', letterSpacing:'0.14em', color:'rgba(58,191,122,0.85)' }}>{c.nom}</div>
                <McSub t={`${getTerrainIcon(c.terrain)} ${getTerrainLabelMap(lang)[c.terrain] || c.terrain} · ${getRegimeIcon(c.regime)} ${getRegimeLabelMap(lang)[c.regime] || c.regime.replace(/_/g,' ')}`} />
                <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.2rem', flexWrap:'wrap' }}>
                    <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(140,160,200,0.40)' }}>👥 {((POP_BASE[c.terrain]||5e6)/1e6).toFixed(1)}M</span>
                    <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(140,160,200,0.40)' }}>😊 ~{SAT_BASE[c.regime]||50}%</span>
                    <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:col }}>◈ ARIA IRL ~{irl}%</span>
                </div>
                <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(58,191,122,0.70)', letterSpacing:'0.10em', marginTop:'0.1rem' }}>✓ CONFIRMÉ</div>
                </div>
            );
        })}

        {/* Tuile CRÉER */}
        {canAdd && !creatingForm && (
            <MC
            style={{ border:'1px dashed rgba(140,160,200,0.30)', background:'rgba(8,14,26,0.75)', backdropFilter:'blur(2px)', cursor:'pointer', alignItems:'center', justifyContent:'center', minHeight:'7rem' }}
            onClick={openCreating}>
            <div style={{ fontSize:'1.5rem' }}>🌍</div>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.44rem', color:'rgba(140,160,200,0.55)', letterSpacing:'0.12em', marginTop:'0.25rem' }}>
                {lang === 'en' ? '+ CREATE' : '+ CRÉER'}
            </div>
            </MC>
        )}

        {/* Formulaire inline en lieu et place de la tuile CRÉER */}
        {creatingForm && (
            <div style={{ ...CARD_STYLE, border:'1px solid rgba(58,191,122,0.30)', display:'flex', flexDirection:'column', gap:'0.55rem' }}>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem', letterSpacing:'0.14em', color:'rgba(58,191,122,0.60)' }}>
                {lang === 'en' ? 'NEW NATION' : 'NOUVELLE NATION'}
            </div>
            <div>
            <div style={{ ...labelStyle('0.40rem'), marginBottom:'0.25rem' }}>NOM</div>
            <input
                style={{ ...INPUT_STYLE, fontSize:'0.50rem', border:'1px solid rgba(58,191,122,0.25)' }}
                value={creatingForm.nom}
                onChange={e => setCreatingForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="Ex : Arvalia, Morvaine…"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && confirmCreating()}
            />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
            <div>
            <div style={{ ...labelStyle('0.38rem'), marginBottom:'0.20rem' }}>{t('TERRAIN', lang)}</div>
            <select style={{ ...SELECT_STYLE, fontSize:'0.44rem' }} value={creatingForm.terrain} onChange={e => setCreatingForm(f => ({ ...f, terrain: e.target.value }))}>
            {Object.entries(getTerrainLabelMap(lang)).map(([k,v]) => <option key={k} value={k}>{getTerrainIcon(k)} {v}</option>)}
            </select>
            </div>
            <div>
            <div style={{ ...labelStyle('0.38rem'), marginBottom:'0.20rem' }}>{t('REGIME', lang)}</div>
            <select style={{ ...SELECT_STYLE, fontSize:'0.44rem' }} value={creatingForm.regime} onChange={e => setCreatingForm(f => ({ ...f, regime: e.target.value }))}>
            {Object.entries(getRegimeLabelMap(lang)).map(([k,v]) => <option key={k} value={k}>{getRegimeIcon(k)} {v}</option>)}
            </select>
            </div>
            </div>
            <div style={{ display:'flex', gap:'0.4rem', justifyContent:'flex-end' }}>
            <button
                style={{ ...BTN_SECONDARY, fontSize:'0.42rem', padding:'0.30rem 0.7rem' }}
                onClick={() => setCreatingForm(null)}>
                ✕
            </button>
            <button
                style={{ ...BTN_PRIMARY, fontSize:'0.42rem', padding:'0.30rem 0.7rem', opacity: creatingForm.nom.trim() ? 1 : 0.4 }}
                disabled={!creatingForm.nom.trim()}
                onClick={confirmCreating}>
                {lang === 'en' ? '+ Add' : '+ Ajouter'}
            </button>
            </div>
            </div>
        )}

        </div>

        {totalSelected > 0 && (
            <div style={{ fontFamily:FONT.mono, fontSize:'0.41rem', color:'rgba(140,160,200,0.50)', alignSelf:'flex-start' }}>
            {totalSelected}/6 nation{totalSelected > 1 ? 's' : ''} sélectionnée{totalSelected > 1 ? 's' : ''}
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
