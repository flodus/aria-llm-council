// src/features/world/components/CountryPanel/components/timeline/EventList.jsx
import { FONT } from '../../../../../shared/theme';
import EventEntry from './TimelineEventEntry';

export default function EventList({ events, isEn }) {
    // Grouper les événements par année
    const eventsByYear = events.reduce((acc, event) => {
        if (!acc[event.year]) {
            acc[event.year] = [];
        }
        acc[event.year].push(event);
        return acc;
    }, {});

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
        }}>
        {Object.entries(eventsByYear)
            .sort(([yearA], [yearB]) => yearB - yearA) // Années récentes d'abord
            .map(([year, yearEvents]) => (
                <div key={year}>
                <div style={{
                    fontFamily: FONT.mono,
                    fontSize: '0.45rem',
                    color: 'rgba(200,164,74,0.6)',
                                          borderBottom: '1px solid rgba(200,164,74,0.2)',
                                          paddingBottom: '0.2rem',
                                          marginBottom: '0.4rem',
                }}>
                {isEn ? `YEAR ${year}` : `AN ${year}`}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {yearEvents.map(event => (
                    <EventEntry key={event.id} event={event} isEn={isEn} />
                ))}
                </div>
                </div>
            ))}
            </div>
    );
}
