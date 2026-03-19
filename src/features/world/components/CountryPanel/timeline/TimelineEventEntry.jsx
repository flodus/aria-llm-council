// src/features/world/components/CountryPanel/timeline/TimelineEventEntry.jsx

import { FONT } from '../../../../../shared/theme';

const TYPE_STYLES = {
    economic: { color: '#4CAF50', icon: '💰' },
    diplomatic: { color: '#2196F3', icon: '🤝' },
    military: { color: '#F44336', icon: '⚔️' },
    social: { color: '#9C27B0', icon: '👥' },
    crisis: { color: '#FF9800', icon: '⚠️' },
    default: { color: '#607D8B', icon: '📌' }
};

export default function EventEntry({ event, isEn }) {
    const { type, title, description, impact } = event;
    const style = TYPE_STYLES[type] || TYPE_STYLES.default;

    return (
        <div style={{
            background: 'rgba(14,20,36,0.5)',
            border: `1px solid ${style.color}22`,
            borderRadius: '2px',
            padding: '0.5rem',
        }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.3rem',
        }}>
        <span style={{ fontSize: '0.9rem' }}>{style.icon}</span>
        <span style={{
            fontFamily: FONT.mono,
            fontSize: '0.5rem',
            color: style.color,
            fontWeight: 500,
        }}>
        {title}
        </span>
        </div>

        <p style={{
            fontFamily: FONT.mono,
            fontSize: '0.43rem',
            color: 'rgba(180,200,230,0.7)',
            margin: '0 0 0.3rem 1.3rem',
            lineHeight: 1.5,
        }}>
        {description}
        </p>

        {impact && (
            <div style={{
                marginLeft: '1.3rem',
                fontFamily: FONT.mono,
                fontSize: '0.38rem',
                color: 'rgba(140,160,200,0.5)',
                    borderTop: '1px solid rgba(90,110,160,0.2)',
                    paddingTop: '0.2rem',
                    marginTop: '0.2rem',
            }}>
            <span style={{ color: style.color }}>⚡</span> {impact}
            </div>
        )}
        </div>
    );
}
