import { useState } from 'react';
import { useLocale, t } from '../../../../ariaI18n';
import {
    FONT, CARD_STYLE, INPUT_STYLE, SELECT_STYLE,
    BTN_PRIMARY, BTN_SECONDARY, labelStyle,
    wrapWide, mCard
} from '../../../../shared/theme';
import { getTerrainLabels, getRegimeLabels, getPaysLocaux } from '../../services/labels';
import ARIAHeader from '../ARIAHeader';
import CountryEstimations from '../CountryEstimations';

export default function FlowFictionalCountry({ worldName, onConfirm, onBack }) {
    const { lang } = useLocale();
    const [defautFictif, setDefautFictif] = useState(null);
    const [defautNom, setDefautNom] = useState('');
    const [newFictifTerrain, setNewFictifTerrain] = useState('coastal');
    const [newFictifRegime, setNewFictifRegime] = useState('democratie_liberale');

    const chosen = defautFictif && defautFictif !== 'new'
    ? getPaysLocaux().find(p => p.id === defautFictif)
    : null;
    const isNew = defautFictif === 'new';

    const H = (txt) => <div style={{ ...labelStyle(), alignSelf: 'flex-start' }}>{txt} — {worldName}</div>;
    const MC = (props) => <div style={{ ...mCard, ...props.style, cursor: 'pointer' }} onClick={props.onClick}>{props.children}</div>;
    const McTitle = ({ t }) => <div style={{ fontFamily: FONT.cinzel, fontSize: '0.54rem', letterSpacing: '0.14em', color: 'rgba(200,164,74,0.88)' }}>{t}</div>;
    const McSub = ({ t }) => <div style={{ fontSize: '0.47rem', color: 'rgba(140,160,200,0.55)', lineHeight: 1.55 }}>{t}</div>;
    const BtnRow = ({ children }) => <div style={{ display: 'flex', gap: '0.6rem', width: '100%', justifyContent: 'space-between' }}>{children}</div>;

    return (
        <div style={wrapWide}>
        <ARIAHeader showQuote={false} />
        {H('NATION FICTIVE')}

        {/* Grille 2×2 : 3 presets + 1 créer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.7rem', width: '100%' }}>
        {getPaysLocaux().map(p => (
            <MC key={p.id}
            style={{
                border: defautFictif === p.id ? `1px solid ${p.couleur}70` : undefined,
                background: defautFictif === p.id ? `${p.couleur}14` : undefined,
            }}
            onClick={() => { setDefautFictif(p.id); setDefautNom(''); }}>
            <div style={{ fontSize: '1.2rem' }}>{p.emoji}</div>
            <McTitle t={p.nom} />
            <McSub t={`${getTerrainLabels()[p.terrain] || p.terrain} · ${getRegimeLabels()[p.regime] || p.regime.replace(/_/g,' ')}`} />
            </MC>
        ))}

        <MC
        style={{
            border: isNew ? '1px solid rgba(58,191,122,0.55)' : '1px solid rgba(58,191,122,0.18)',
            background: isNew ? 'rgba(58,191,122,0.07)' : undefined,
            justifyContent: 'center', alignItems: 'center',
        }}
        onClick={() => { setDefautFictif('new'); setDefautNom(''); }}>
        <div style={{ fontSize: '1.4rem' }}>🌍</div>
        <McTitle t={t('CREATE', lang)} />
        <McSub t={lang==='en' ? 'Custom fictional nation' : 'Nation fictive personnalisée'} />
        </MC>
        </div>

        {/* Détail preset choisi */}
        {chosen && (
            <div style={{ ...CARD_STYLE, width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.44rem', color: 'rgba(140,160,200,0.65)', lineHeight: 1.6 }}>{chosen.description}</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(140,160,200,0.50)' }}>
            👤 {typeof chosen.leader === 'string' ? chosen.leader : (chosen.leader?.nom || chosen.leader?.name || '')}
            </span>
            <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(140,160,200,0.50)' }}>
            👥 {(chosen.population/1e6).toFixed(1)} M hab.
            </span>
            <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(140,160,200,0.50)' }}>
            😊 Satisfaction {chosen.satisfaction}%
            </span>
            </div>
            </div>
        )}

        {/* Formulaire nouveau pays fictif */}
        {isNew && (
            <div style={{ ...CARD_STYLE, width: '100%', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', letterSpacing: '0.16em', color: 'rgba(58,191,122,0.55)' }}>
            {t('NEW_NATION', lang)}
            </div>
            <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom: '0.3rem' }}>NOM</div>
            <input
            style={{ ...INPUT_STYLE, fontSize: '0.54rem', border: '1px solid rgba(58,191,122,0.25)' }}
            value={defautNom}
            onChange={e => setDefautNom(e.target.value)}
            placeholder="Ex : Arvalia, Morvaine, Zephoria…"
            autoFocus
            />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom: '0.3rem' }}>{t('TERRAIN', lang)}</div>
            <select style={SELECT_STYLE} value={newFictifTerrain} onChange={e => setNewFictifTerrain(e.target.value)}>
            {Object.entries(getTerrainLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            </div>
            <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom: '0.3rem' }}>{t('REGIME', lang)}</div>
            <select style={SELECT_STYLE} value={newFictifRegime} onChange={e => setNewFictifRegime(e.target.value)}>
            {Object.entries(getRegimeLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            </div>
            </div>
            <CountryEstimations regime={newFictifRegime} terrain={newFictifTerrain} />
            </div>
        )}

        <BtnRow>
        <button style={BTN_SECONDARY} onClick={onBack}>{t('BACK', lang)}</button>
        {!isNew && chosen && (
            <button style={BTN_PRIMARY} onClick={() => onConfirm({
                type: 'imaginaire',
                nom: chosen.nom,
                realData: chosen
            })}>
            {t('GENERATE_SHORT', lang)}
            </button>
        )}
        {isNew && (
            <button style={{ ...BTN_PRIMARY, opacity: defautNom.trim() ? 1 : 0.35 }}
            disabled={!defautNom.trim()}
            onClick={() => onConfirm({
                type: 'imaginaire',
                nom: defautNom.trim(),
                                     terrain: newFictifTerrain,
                                     regime: newFictifRegime,
                                     realData: null,
            })}>
            {t('GENERATE_SHORT', lang)}
            </button>
        )}
        </BtnRow>
        </div>
    );
}
