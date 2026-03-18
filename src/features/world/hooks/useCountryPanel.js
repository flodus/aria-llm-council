// src/features/world/components/CountryPanel/hooks/useCountryPanel.js

import { useState, useEffect, useCallback } from 'react';
import { loadLang } from '../../../ariaI18n';

export default function useCountryPanel({ onSubmitQuestion }) {
    // État de la langue
    const [lang, setLang] = useState(() => loadLang());

    // États locaux du panel
    const [openMinistry, setOpenMinistry] = useState(null);
    const [customQ, setCustomQ] = useState('');
    const [freeQ, setFreeQ] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Effet pour écouter les changements de langue
    useEffect(() => {
        const onLangChange = () => setLang(loadLang());
        window.addEventListener('aria-lang-change', onLangChange);
        return () => window.removeEventListener('aria-lang-change', onLangChange);
    }, []);

    // Gestionnaire de soumission
    const handleSubmit = useCallback((question, ministryId = null) => {
        if (!question?.trim() || submitting) return;

        setSubmitting(true);
        onSubmitQuestion?.(question.trim(), ministryId);
        setCustomQ('');
        setFreeQ('');

        // Timeout pour réinitialiser l'état de soumission
        setTimeout(() => setSubmitting(false), 1200);
    }, [submitting, onSubmitQuestion]);

    return {
        // États
        lang,
        openMinistry,
        setOpenMinistry,
        customQ,
        setCustomQ,
        freeQ,
        setFreeQ,
        submitting,

        // Actions
        handleSubmit,
    };
}
