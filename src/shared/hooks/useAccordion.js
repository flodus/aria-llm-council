// src/shared/hooks/useAccordion.js
// Hook partagé — gère l'état d'ouverture des accordéons à clé unique
// Usage : const { ouvert, basculer } = useAccordion()

import { useState, useCallback } from 'react';

export function useAccordion() {
  const [ouvert, setOuvert] = useState(null);
  const basculer = useCallback(cle => setOuvert(prev => prev === cle ? null : cle), []);
  return { ouvert, basculer };
}
