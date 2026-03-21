// src/features/init/components/flows/DefaultLocalFlow.jsx

import { useState } from 'react';
import { useLocale, t } from '../../../../ariaI18n';
import {
    FONT, CARD_STYLE, INPUT_STYLE, SELECT_STYLE,
    BTN_PRIMARY, BTN_SECONDARY, labelStyle,
    wrapNarrow, wrapWide, mCard, tag, wrap
} from '../../../../shared/theme';
import { getTerrainLabelMap, getRegimeLabelMap, getPaysLocaux } from '../../services/labels';
import { getRealCountries } from '../../services/realCountries';  // ← corrigé !
import ARIAHeader from '../ARIAHeader';
import CountryInfoCard from '../CountryInfoCard';

export default function DefaultLocalFlow({ worldName, onBack, onPreLaunch }) {
    const { lang } = useLocale();
    const [defautType, setDefautType] = useState(null);  // 'fictif'|'reel'
    const [defautFictif, setDefautFictif] = useState(null);  // id PAYS_LOCAUX ou 'new'
    const [defautReel, setDefautReel] = useState('');  // id REAL_COUNTRIES_DATA
    const [defautNom, setDefautNom] = useState('');  // nom libre
    const [newFictifTerrain, setNewFictifTerrain] = useState('coastal');
    const [newFictifRegime, setNewFictifRegime] = useState('democratie_liberale');

    const resetDefaut = () => {
        setDefautType(null);
        setDefautFictif(null);
        setDefautReel('');
        setDefautNom('');
    };

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

    // Écran de sélection fictif
    if (defautType === 'fictif') {
        const chosen = defautFictif && defautFictif !== 'new'
        ? getPaysLocaux().find(p => p.id === defautFictif)
        : null;
        const isNew = defautFictif === 'new';

        // Estimations
        const ARIA_BASE = {
            republique_federale:44, democratie_liberale:48, monarchie_constitutionnelle:38,
            technocratie_ia:72, oligarchie:26, junte_militaire:16, regime_autoritaire:20,
            monarchie_absolue:28, theocracie:18, communisme:32
        };
        const POP_BASE = {
            coastal:8_000_000, inland:5_000_000, highland:3_500_000,
            island:2_000_000, archipelago:1_500_000
        };
        const SAT_BASE = {
            democratie_liberale:62, republique_federale:58, monarchie_constitutionnelle:55,
            technocratie_ia:60, oligarchie:40, junte_militaire:35, regime_autoritaire:38,
            theocracie:50, communisme:45
        };

        const canPlay = (defautFictif && !isNew) || (isNew && defautNom.trim().length > 0);

        return (
            <div style={wrapWide}>
            <ARIAHeader showQuote={false} />
            {H('NATION FICTIVE')}

            {/* Grille 2×2 : 3 presets + 1 créer */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'0.7rem', width:'100%' }}>
            {getPaysLocaux().map(p => (
                <MC key={p.id}
                style={{
                    border: defautFictif === p.id ? `1px solid ${p.couleur}70` : undefined,
                    background: defautFictif === p.id ? `${p.couleur}14` : undefined,
                    cursor:'pointer',
                }}
                onClick={() => setDefautFictif(p.id)}>
                <div style={{ fontSize:'1.2rem' }}>{p.emoji}</div>
                <McTitle t={p.nom} />
                <McSub t={`${getTerrainLabelMap(lang)[p.terrain] || p.terrain} · ${getRegimeLabelMap(lang)[p.regime] || p.regime.replace(/_/g,' ')}`} />
                </MC>
            ))}

            {/* Carte + Créer */}
            <MC
            style={{
                border: isNew ? '1px solid rgba(58,191,122,0.55)' : '1px solid rgba(58,191,122,0.18)',
                background: isNew ? 'rgba(58,191,122,0.07)' : undefined,
                cursor:'pointer', justifyContent:'center', alignItems:'center',
            }}
            onClick={() => setDefautFictif('new')}>
            <div style={{ fontSize:'1.4rem' }}>🌍</div>
            <McTitle t={t('CREATE', lang)} />
            <McSub t={lang==='en' ? 'Custom fictional nation' : 'Nation fictive personnalisée'} />
            </MC>
            </div>

            {/* Détail preset choisi */}
            {chosen && (
                <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                <div style={{ fontSize:'0.44rem', color:'rgba(140,160,200,0.65)', lineHeight:1.6 }}>{chosen.description}</div>
                <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.50)' }}>
                👤 {typeof chosen.leader === 'string' ? chosen.leader : (chosen.leader?.nom || chosen.leader?.name || '')}
                </span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.50)' }}>
                👥 {(chosen.population/1e6).toFixed(1)} M hab.
                </span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.50)' }}>
                😊 Satisfaction {chosen.satisfaction}%
                </span>
                {(() => {
                    const irl = ARIA_BASE[chosen.regime] ?? 35;
                    const col = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';
                    return <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:col }}>◈ ARIA IRL ~{irl}%</span>;
                })()}
                </div>
                </div>
            )}

            {/* Formulaire nouveau pays fictif */}
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
                {Object.entries(getTerrainLabelMap(lang)).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                </div>
                <div>
                <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('REGIME', lang)}</div>
                <select style={SELECT_STYLE} value={newFictifRegime} onChange={e => setNewFictifRegime(e.target.value)}>
                {Object.entries(getRegimeLabelMap(lang)).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                </div>
                </div>
                {/* Estimations */}
                <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap', padding:'0.35rem 0.5rem', background:'rgba(58,191,122,0.03)', borderLeft:'2px solid rgba(58,191,122,0.15)', borderRadius:'2px' }}>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.50)' }}>
                👥 ~{((POP_BASE[newFictifTerrain]||5e6)/1e6).toFixed(1)} M hab.
                </span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.50)' }}>
                😊 ~{SAT_BASE[newFictifRegime]||50}% sat.
                </span>
                {(() => {
                    const irl = ARIA_BASE[newFictifRegime] ?? 35;
                    const col = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';
                    return <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:col }}>◈ ARIA IRL ~{irl}%</span>;
                })()}
                </div>
                </div>
            )}

            <BtnRow>
            {isNew
                ? <button style={BTN_SECONDARY} onClick={() => { setDefautFictif(null); setDefautNom(''); }}>{t('BACK', lang)}</button>
                : <button style={BTN_SECONDARY} onClick={() => { setDefautType(null); setDefautFictif(null); setDefautNom(''); }}>{t('BACK', lang)}</button>
            }
            {!isNew && chosen && (
                <button
                style={{ ...BTN_PRIMARY, opacity: canPlay ? 1 : 0.35 }}
                disabled={!canPlay}
                onClick={() => onPreLaunch('defaut_local', [{ type:'imaginaire', realData: chosen }])}>
                JOUER →
                </button>
            )}
            {isNew && (
                <button
                style={{ ...BTN_PRIMARY, opacity: defautNom.trim() ? 1 : 0.35 }}
                disabled={!defautNom.trim()}
                onClick={() => onPreLaunch('defaut_local', [{
                    type:'imaginaire', nom:defautNom.trim(),
                                           terrain:newFictifTerrain, regime:newFictifRegime, realData:null,
                }])}>
                JOUER →
                </button>
            )}
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
