// src/features/settings/hooks/useAccordion.js
// Hook réutilisable pour gérer l'état d'ouverture des accordéons

import { useState, useCallback } from 'react';

export function useAccordion() {
    const [ouvert, setOuvert] = useState(null);

    const basculer = useCallback(cle => setOuvert(prev => prev === cle ? null : cle), []);

    return { ouvert, basculer };
}
