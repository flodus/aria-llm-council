import { useState, useRef } from 'react';
import { useLocale, t } from '../../../../ariaI18n';
import {
    FONT, CARD_STYLE, INPUT_STYLE, SELECT_STYLE,
    BTN_PRIMARY, BTN_SECONDARY, labelStyle,
    wrapNarrow, wrapWide, mCard, tag
} from '../../../../shared/theme';
import { getTerrainLabels, getRegimeLabels, getPaysLocaux } from '../../services/labels';
import { getRealCountries } from '../../services/realCountries';
import { validateCountryWithAI } from '../../services/countryValidation';
import ARIAHeader from '../ARIAHeader';
import CountryInfoCard from '../CountryInfoCard';

export default function DefaultAIFlow({ worldName, onBack, onPreLaunch }) {
    const { lang } = useLocale();
    const [defautType, setDefautType] = useState(null);  // 'fictif'|'reel'
    const [defautFictif, setDefautFictif] = useState(null);  // id PAYS_LOCAUX ou 'new'
    const [defautReel, setDefautReel] = useState('');  // id REAL_COUNTRIES_DATA
    const [defautNom, setDefautNom] = useState('');  // nom libre
    const [newFictifTerrain, setNewFictifTerrain] = useState('coastal');
    const [newFictifRegime, setNewFictifRegime] = useState('democratie_liberale');

    // État pour la validation du pays réel
    const [rcStatus, setRcStatus] = useState(null); // null|'searching'|'found'|'notfound'|'suggestion'|'error'
    const [rcSuggestion, setRcSuggestion] = useState(null);
    const [rcDefautData, setRcDefautData] = useState(null);
    const rcTimer = useRef(null);
    const rcQueryRef = useRef('');

    const resetDefaut = () => {
        setDefautType(null);
        setDefautFictif(null);
        setDefautReel('');
        setDefautNom('');
        setRcStatus(null);
        setRcSuggestion(null);
        setRcDefautData(null);
    };

    // Fonction de recherche pour la validation
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

                // Fetch drapeau + population
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

    // Helpers JSX
    const H = (txt) => <div style={{ ...labelStyle(), alignSelf:'flex-start' }}>{txt} — {worldName}</div>;
    const MC = (props) => <div style={{ ...mCard, ...props.style }} onClick={props.onClick}>{props.children}</div>;
    const McTitle = ({ t }) => <div style={{ fontFamily:FONT.cinzel, fontSize:'0.54rem', letterSpacing:'0.14em', color:'rgba(200,164,74,0.88)' }}>{t}</div>;
    const McSub = ({ t }) => <div style={{ fontSize:'0.47rem', color:'rgba(140,160,200,0.55)', lineHeight:1.55 }}>{t}</div>;
    const BtnRow = ({ children }) => <div style={{ display:'flex', gap:'0.6rem', width:'100%', justifyContent:'space-between' }}>{children}</div>;

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
            <McSub t={lang==='en' ? "1 of 3 preset nations or 1 new one — AI enriches it." : "1 des 3 nations prédéfinies ou 1 nouvelle — l'IA l'enrichit."} />
            </MC>
            <MC onClick={() => setDefautType('reel')}>
            <div style={{ fontSize:'1.3rem' }}>🗺</div>
            <McTitle t={t('REAL_COUNTRY', lang)} />
            <McSub t={lang==='en' ? "AI generates the portrait from its current situation." : "L'IA génère le portrait depuis sa situation actuelle."} />
            </MC>
            </div>
            <BtnRow>
            <button style={BTN_SECONDARY} onClick={onBack}>{t('BACK', lang)}</button>
            </BtnRow>
            </div>
        );
    }

    // Écran de sélection pays réel (IA)
    if (defautType === 'reel') {
        const knownReel = getRealCountries().find(r => r.id === defautReel);
        const canLaunch = defautReel || (defautNom.trim() && rcStatus === 'found');

        return (
            <div style={wrapNarrow}>
            <ARIAHeader showQuote={false} />
            {H('PAYS RÉEL')}
            <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.7rem' }}>
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

            <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.35)', textAlign:'center' }}>— OU —</div>

            <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem' }}>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(100,120,160,0.45)' }}>SAISIE LIBRE</span>
            {rcStatus === 'searching'  && <span style={{ color:'rgba(200,164,74,0.55)', fontSize:'0.38rem' }}>⟳ vérification…</span>}
            {rcStatus === 'found'      && <span style={{ color:'rgba(58,191,122,0.80)',  fontSize:'0.38rem' }}>✓ pays reconnu</span>}
            {rcStatus === 'notfound'   && <span style={{ color:'rgba(200,80,80,0.70)',   fontSize:'0.38rem' }}>✗ pays inconnu</span>}
            {rcStatus === 'error'      && <span style={{ color:'rgba(200,164,74,0.50)',  fontSize:'0.38rem' }}>⚠ hors ligne</span>}
            {rcStatus === 'suggestion' && rcSuggestion && (
                <button onClick={() => {
                    setDefautNom(rcSuggestion);
                    setRcStatus(null);
                    setRcSuggestion(null);
                    clearTimeout(rcTimer.current);
                    setTimeout(() => searchDefautCountry(rcSuggestion), 50);
                }}
                style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(200,164,74,0.90)',
                    background:'rgba(200,164,74,0.10)', border:'1px solid rgba(200,164,74,0.30)',
                                                           borderRadius:'2px', padding:'0.10rem 0.40rem', cursor:'pointer' }}>
                                                           → {rcSuggestion} ?
                                                           </button>
            )}
            </div>
            <input style={{ ...INPUT_STYLE, fontSize:'0.53rem', width:'100%' }}
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
                    <div style={{ fontSize:'0.43rem', color:'rgba(100,120,160,0.55)', fontStyle:'italic', lineHeight:1.5 }}>
                    ⚡ L'IA génèrera <strong style={{ color:'rgba(200,164,74,0.65)' }}>{defautNom}</strong> depuis sa situation politique actuelle.
                    </div>
                )}
                </div>

                <BtnRow>
                <button style={BTN_SECONDARY} onClick={() => setDefautType(null)}>{t('BACK', lang)}</button>
                <button style={{ ...BTN_PRIMARY, opacity: canLaunch ? 1 : 0.35 }}
                disabled={!canLaunch}
                onClick={() => {
                    const nom = knownReel?.nom || defautNom;
                    onPreLaunch('defaut_ai', [{
                        type:'reel',
                        nom,
                        realData: knownReel || rcDefautData || null
                    }]);
                }}>
                {t('GENERATE_SHORT', lang)}
                </button>
                </BtnRow>
                </div>
        );
    }

    // Écran de sélection fictif (IA) – identique au mode local
    if (defautType === 'fictif') {
        const chosen = defautFictif && defautFictif !== 'new'
        ? getPaysLocaux().find(p => p.id === defautFictif)
        : null;
        const isNew = defautFictif === 'new';

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
                onClick={() => { setDefautFictif(p.id); setDefautNom(''); }}>
                <div style={{ fontSize:'1.2rem' }}>{p.emoji}</div>
                <McTitle t={p.nom} />
                <McSub t={`${getTerrainLabels()[p.terrain] || p.terrain} · ${getRegimeLabels()[p.regime] || p.regime.replace(/_/g,' ')}`} />
                </MC>
            ))}

            <MC
            style={{
                border: isNew ? '1px solid rgba(58,191,122,0.55)' : '1px solid rgba(58,191,122,0.18)',
                background: isNew ? 'rgba(58,191,122,0.07)' : undefined,
                cursor:'pointer', justifyContent:'center', alignItems:'center',
            }}
            onClick={() => { setDefautFictif('new'); setDefautNom(''); }}>
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
                {Object.entries(getTerrainLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                </div>
                <div>
                <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('REGIME', lang)}</div>
                <select style={SELECT_STYLE} value={newFictifRegime} onChange={e => setNewFictifRegime(e.target.value)}>
                {Object.entries(getRegimeLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
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
                <button style={{ ...BTN_PRIMARY }}
                onClick={() => onPreLaunch('defaut_ai', [{
                    type:'imaginaire',
                    nom: chosen.nom,
                    realData: chosen
                }])}>
                {t('GENERATE_SHORT', lang)}
                </button>
            )}
            {isNew && (
                <button style={{ ...BTN_PRIMARY, opacity: defautNom.trim() ? 1 : 0.35 }}
                disabled={!defautNom.trim()}
                onClick={() => onPreLaunch('defaut_ai', [{
                    type:'imaginaire',
                    nom: defautNom.trim(),
                                           terrain: newFictifTerrain,
                                           regime: newFictifRegime,
                                           realData: null,
                }])}>
                {t('GENERATE_SHORT', lang)}
                </button>
            )}
            </BtnRow>
            </div>
        );
    }

    return null;
}
