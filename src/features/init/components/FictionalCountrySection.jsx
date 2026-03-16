import { useLocale, t } from '../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, SELECT_STYLE, BTN_SECONDARY, labelStyle } from '../../../shared/theme';
import { getTerrainLabels, getRegimeLabels, getPaysLocaux } from '../services/labels';
import { CountryInfoCard, CountryEstimations } from './index';

export default function FictionalCountrySection({ country, idx, onChange, setField }) {
    const { lang } = useLocale();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {/* Sélecteur preset */}
        <div>
        <div style={{ ...labelStyle('0.43rem'), marginBottom: '0.3rem' }}>NATION PRÉDÉFINIE</div>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {getPaysLocaux().map(p => {
            const sel = country.realData?.id === p.id;
            return (
                <button
                key={p.id}
                style={{
                    flex: '1 1 80px',
                    cursor: 'pointer',
                    padding: '0.28rem 0.4rem',
                    fontFamily: FONT.mono,
                    fontSize: '0.46rem',
                    letterSpacing: '0.06em',
                    borderRadius: '2px',
                    transition: 'all 0.13s',
                    border: sel ? `1px solid ${p.couleur}80` : '1px solid rgba(140,160,200,0.14)',
                    background: sel ? `${p.couleur}18` : 'rgba(8,14,26,0.75)',
                    color: sel ? p.couleur : 'rgba(180,200,230,0.60)',
                    boxShadow: sel ? `0 0 8px ${p.couleur}18` : 'none',
                }}
                onClick={() => onChange({ ...country, nom: p.nom, terrain: p.terrain, regime: p.regime, realData: p })}
                >
                {p.emoji} {p.nom}
                </button>
            );
        })}

        <button
        style={{
            flex: '1 1 80px',
            cursor: 'pointer',
            padding: '0.28rem 0.4rem',
            fontFamily: FONT.mono,
            fontSize: '0.46rem',
            letterSpacing: '0.06em',
            borderRadius: '2px',
            transition: 'all 0.13s',
            border: !country.realData ? '1px solid rgba(200,164,74,0.45)' : '1px solid rgba(140,160,200,0.14)',
            background: !country.realData ? 'rgba(200,164,74,0.08)' : 'rgba(8,14,26,0.75)',
            color: !country.realData ? 'rgba(200,164,74,0.90)' : 'rgba(180,200,230,0.55)',
        }}
        onClick={() => onChange({ ...country, nom: '', realData: null })}
        >
        {lang === 'en' ? '✨ New' : '✨ Nouveau'}
        </button>
        </div>
        </div>

        {/* Résumé preset */}
        {country.realData?.id && getPaysLocaux().find(p => p.id === country.realData.id) && (
            <div style={{
                fontSize: '0.43rem',
                color: 'rgba(140,160,200,0.55)',
                                                                                             lineHeight: 1.55,
                                                                                             padding: '0.35rem 0.5rem',
                                                                                             background: 'rgba(200,164,74,0.03)',
                                                                                             borderLeft: '2px solid rgba(200,164,74,0.15)',
                                                                                             borderRadius: '2px'
            }}>
            {country.realData.description}
            <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <span>👤 {typeof country.realData.leader === 'object'
                ? [country.realData.leader.titre, country.realData.leader.nom].filter(Boolean).join(' ')
                : country.realData.leader}</span>
                <span>👥 {(country.realData.population / 1e6).toFixed(1)} M hab.</span>
                <span style={{ color: country.realData.couleur }}>■ {country.realData.terrain}</span>
                </div>
                </div>
        )}

        {/* Formulaire nouveau pays */}
        {!country.realData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ ...labelStyle('0.43rem'), marginBottom: '0.3rem' }}>NOM</div>
            <input
            style={{ ...INPUT_STYLE, fontSize: '0.54rem' }}
            value={country.nom}
            onChange={e => setField('nom', e.target.value)}
            placeholder={`Nation ${idx + 1}…`}
            />
            </div>
            <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom: '0.3rem' }}>{t('TERRAIN', lang)}</div>
            <select style={SELECT_STYLE} value={country.terrain} onChange={e => setField('terrain', e.target.value)}>
            {Object.entries(getTerrainLabels()).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            </div>
            <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom: '0.3rem' }}>{t('REGIME', lang)}</div>
            <select style={SELECT_STYLE} value={country.regime} onChange={e => setField('regime', e.target.value)}>
            {Object.entries(getRegimeLabels()).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            </div>
            </div>

            {/* Estimations */}
            <CountryEstimations regime={country.regime} terrain={country.terrain} />
            </div>
        )}
        </div>
    );
}
