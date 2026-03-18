// src/features/world/components/CountryPanel/components/timeline/TimelineView.jsx

import { useState, useEffect } from 'react';
import { FONT } from '../../../../../shared/theme';
import { loadLang } from '../../../../../ariaI18n';
import TimelineHeader from './timeline/TimelineHeader';
import EventList from './timeline/TimelineEventList';
import EmptyTimeline from './timeline/TimelineEmpty';

// Données mockées pour l'exemple - À remplacer par vos vraies données
const MOCK_EVENTS = [
    { id: 1, year: 2026, type: 'economic', title: 'Réforme fiscale', description: 'Adoption d\'une nouvelle politique économique', impact: '+5% satisfaction' },
{ id: 2, year: 2027, type: 'diplomatic', title: 'Traité commercial', description: 'Signature d\'un accord avec les pays voisins', impact: 'Nouvelles routes commerciales' },
{ id: 3, year: 2028, type: 'crisis', title: 'Crise énergétique', description: 'Pénurie de ressources due à la sécheresse', impact: '-8% production' },
{ id: 4, year: 2029, type: 'military', title: 'Réforme de l\'armée', description: 'Modernisation des forces armées', impact: 'Sécurité renforcée' },
{ id: 5, year: 2030, type: 'social', title: 'Réforme éducative', description: 'Investissement massif dans l\'éducation', impact: '+3% natalité' },
];

export default function TimelineView({ country, lang }) {
    const [events, setEvents] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' ou 'desc'
    const isEn = lang === 'en';

    // Simuler le chargement des événements (à remplacer par vraie data)
    useEffect(() => {
        // Plus tard, ici on chargera les événements depuis le contexte Chronolog
        setEvents(MOCK_EVENTS);
    }, [country]);

    // Filtrer les événements par type
    const filteredEvents = filterType === 'all'
    ? events
    : events.filter(e => e.type === filterType);

    // Trier les événements par année
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        return sortOrder === 'desc' ? b.year - a.year : a.year - b.year;
    });

    if (!events.length) {
        return <EmptyTimeline isEn={isEn} />;
    }

    return (
        <div className="side-panel-scroll">
        <div style={{ padding: '0.6rem 0.8rem' }}>
        <TimelineHeader
        isEn={isEn}
        filterType={filterType}
        setFilterType={setFilterType}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        countryName={country.nom}
        />

        <EventList
        events={sortedEvents}
        isEn={isEn}
        />
        </div>
        </div>
    );
}
