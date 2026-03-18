// src/features/council/components/constitution/PresidentsList.jsx
import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';

export default function PresidentsList({ presidents, activePres, onPresidentClick }) {
    const { lang } = useLocale();
    const GOLD = 'rgba(200,164,74,0.88)';
    const DIM = 'rgba(140,160,200,0.48)';

    // Ordre fixe : phare, boussole
    const presidentEntries = [
        { id: 'phare', data: presidents.phare },
        { id: 'boussole', data: presidents.boussole }
    ].filter(p => p.data);

    const noActive = activePres.length === 0;

    return (
        <div style={{ ...CARD_STYLE }}>
        <div style={labelStyle('0.42rem', 'rgba(200,164,74,0.55)', '0.5rem')}>
        {lang === 'en' ? 'ACTIVE FIGURES' : 'FIGURES ACTIVES'}
        </div>
        <p style={{ fontSize: '0.40rem', color: DIM, margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
        {lang === 'en'
            ? 'Activate/deactivate each figure. No presidency → collegial mode.'
    : 'Activez / désactivez chaque figure. Sans présidence → mode collégial.'}
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
    {presidentEntries.map(({ id, data }) => {
        const isActive = activePres.includes(id);
        return (
            <button
            key={id}
            onClick={() => onPresidentClick(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.52rem 0.68rem',
                background: isActive ? 'rgba(200,164,74,0.07)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${isActive ? 'rgba(200,164,74,0.36)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '2px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.15s'
            }}
            >
            <span style={{ fontSize: '1.15rem', minWidth: '1.4rem' }}>{data.symbol}</span>
            <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.56rem', letterSpacing: '0.10em', color: isActive ? GOLD : 'rgba(200,215,240,0.50)' }}>
            {data.name}
            </div>
            <div style={{ fontSize: '0.44rem', color: DIM, marginTop: '0.08rem' }}>{data.subtitle}</div>
            </div>
            <span style={{ fontFamily: FONT, fontSize: '0.48rem', color: isActive ? GOLD : 'rgba(140,160,200,0.22)' }}>
            {isActive ? '● ACTIF' : '○ INACTIF'}
            </span>
            </button>
        );
    })}
    </div>

    {noActive && (
        <div style={{
            fontFamily: FONT,
            fontSize: '0.47rem',
            color: 'rgba(200,100,60,0.62)',
                  padding: '0.38rem 0.5rem',
                  border: '1px solid rgba(200,100,60,0.20)',
                  borderRadius: '2px',
                  background: 'rgba(200,100,60,0.05)',
                  marginTop: '0.5rem'
        }}>
        ⚠ {lang === 'en' ? 'Collegial mode — deliberation without presidential arbitration' : 'Mode collégial — délibération sans arbitrage présidentiel'}
        </div>
    )}
    </div>
    );
}
