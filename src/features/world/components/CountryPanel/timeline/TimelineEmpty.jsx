// src/features/world/components/CountryPanel/timeline/TimelineEmpty.jsx

import { FONT } from '../../../../../shared/theme';

export default function EmptyTimeline({ isEn }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '2rem',
            textAlign: 'center',
        }}>
        <div style={{ fontSize: '3rem', opacity: 0.15, marginBottom: '1rem' }}>📜</div>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.5rem',
            color: 'rgba(140,160,200,0.35)',
            letterSpacing: '0.16em',
            marginBottom: '0.5rem',
        }}>
        {isEn ? 'NO HISTORY YET' : 'AUCUN HISTORIQUE'}
        </div>
        <p style={{
            fontFamily: FONT.mono,
            fontSize: '0.43rem',
            color: 'rgba(100,120,160,0.4)',
            maxWidth: '250px',
            lineHeight: 1.6,
        }}>
        {isEn
            ? 'Events will appear here as the world evolves through cycles and crises.'
    : 'Les événements apparaîtront ici à mesure que le monde évolue à travers les cycles et les crises.'}
    </p>
    </div>
    );
}
