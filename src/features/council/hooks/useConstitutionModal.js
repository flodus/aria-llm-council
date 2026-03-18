/**
 * Hook personnalisé pour gérer l'état et la logique de la modale de constitution
 *
 * @param {Object} initialConstitution - Constitution initiale (agents, ministères, présidence)
 * @returns {Object} État et fonctions de manipulation
 */

import { useState, useCallback } from 'react';
import { useLocale } from '../../../ariaI18n';
import { BASE_AGENTS, BASE_AGENTS_EN } from '../../../../templates';

export default function useConstitutionModal(props) {
    const { lang } = useLocale();

    // Sécuriser l'entrée
    const initialConstitution = props || {};

    const BASE_AGENTS_DATA = lang === 'en' ? BASE_AGENTS_EN : BASE_AGENTS;

    const defaultConstitution = {
        presidency: BASE_AGENTS_DATA.presidency,
        activePres: ['phare', 'boussole'],
        ministers: BASE_AGENTS_DATA.ministers,
        activeMinsters: null,
        ministries: (BASE_AGENTS_DATA.ministries || []).map(m => ({
            ...m,
            ministerPrompts: m.ministerPrompts || {}
        }))
    };

    const [constitution, setConstitution] = useState({
        ...defaultConstitution,
        ...initialConstitution,
        // ... autres fusions
        ministries: initialConstitution.ministries?.length
        ? initialConstitution.ministries.map(m => ({
            ...m,
            ministerPrompts: m.ministerPrompts || {}
        }))
        : defaultConstitution.ministries
    });

    // États pour l'UI
    const [selectedMinistry, setSelectedMinistry] = useState(null);
    const [selectedMinister, setSelectedMinister] = useState(null);
    const [activeTab, setActiveTab] = useState('presidency'); // 'presidency' | 'ministries' | 'ministers'

    // États pour l'édition de prompts
    const [openPromptEditor, setOpenPromptEditor] = useState(null); // id du prompt ouvert

    /**
     * Met à jour un champ de la présidence
     * @param {string} president - 'phare' ou 'boussole'
     * @param {string} field - Le champ à modifier (name, essence, role_long)
     * @param {string} value - Nouvelle valeur
     */
    const updatePresidency = useCallback((president, field, value) => {
        setConstitution(prev => ({
            ...prev,
            presidency: {
                ...prev.presidency,
                [president]: {
                    ...prev.presidency[president],
                    [field]: value
                }
            }
        }));
    }, []);

    /**
     * Active ou désactive un président
     * @param {string} president - 'phare' ou 'boussole'
     */
    const togglePresident = useCallback((president) => {
        setConstitution(prev => ({
            ...prev,
            activePres: prev.activePres.includes(president)
            ? prev.activePres.filter(p => p !== president)
            : [...prev.activePres, president]
        }));
    }, []);

    /**
     * Active ou désactive un ministre
     * @param {string} ministerId - ID du ministre
     */
    const toggleMinister = useCallback((ministerId) => {
        setConstitution(prev => {
            const all = Object.keys(prev.ministers || {});
            const cur = prev.activeMinsters || all;
            const on = cur.includes(ministerId);
            const next = on ? cur.filter(k => k !== ministerId) : [...cur, ministerId];

            return {
                ...prev,
                activeMinsters: next.length === all.length ? null : next
            };
        });
    }, []);

    /**
     * Active ou désactive tous les ministres
     */
    const setAllMinistersActive = useCallback(() => {
        setConstitution(prev => ({ ...prev, activeMinsters: null }));
    }, []);

    /**
     * Active ou désactive un ministère
     * @param {string} ministryId - ID du ministère
     */
    const toggleMinistry = useCallback((ministryId) => {
        setConstitution(prev => {
            const all = (prev.ministries || []).map(m => m.id);
            const cur = prev.activeMins || all;
            const on = cur.includes(ministryId);
            const next = on ? cur.filter(id => id !== ministryId) : [...cur, ministryId];

            return {
                ...prev,
                activeMins: next.length === all.length ? null : next
            };
        });
    }, []);

    /**
     * Active ou désactive tous les ministères
     */
    const setAllMinistriesActive = useCallback(() => {
        setConstitution(prev => ({ ...prev, activeMins: null }));
    }, []);

    /**
     * Met à jour la mission d'un ministère
     * @param {string} ministryId - ID du ministère
     * @param {string} newMission - Nouvelle mission
     */
    const updateMinistryMission = useCallback((ministryId, newMission) => {
        setConstitution(prev => ({
            ...prev,
            ministries: (prev.ministries || []).map(m =>
            m.id === ministryId ? { ...m, mission: newMission } : m
            )
        }));
    }, []);

    /**
     * Assigne ou retire un ministre d'un ministère
     * @param {string} ministryId - ID du ministère
     * @param {string} ministerId - ID du ministre
     * @param {boolean} currentlyIn - Le ministre est-il actuellement dans le ministère ?
     */
    const assignMinisterToMinistry = useCallback((ministryId, ministerId, currentlyIn) => {
        setConstitution(prev => ({
            ...prev,
            ministries: (prev.ministries || []).map(m =>
            m.id === ministryId
            ? {
                ...m,
                ministers: currentlyIn
                ? (m.ministers || []).filter(id => id !== ministerId)
                : [...(m.ministers || []), ministerId]
            }
            : m
            )
        }));
    }, []);

    /**
     * Met à jour un prompt spécifique d'un ministre dans un ministère
     * @param {string} ministryId - ID du ministère
     * @param {string} ministerId - ID du ministre
     * @param {string} newPrompt - Nouveau contenu du prompt
     */
    const updateMinisterPrompt = useCallback((ministryId, ministerId, newPrompt) => {
        setConstitution(prev => ({
            ...prev,
            ministries: (prev.ministries || []).map(m =>
            m.id === ministryId
            ? {
                ...m,
                ministerPrompts: {
                    ...(m.ministerPrompts || {}),
                                                    [ministerId]: newPrompt
                }
            }
            : m
            )
        }));
    }, []);

    /**
     * Vérifie si un ministre est actif
     * @param {string} ministerId - ID du ministre
     * @returns {boolean} True si le ministre est actif
     */
    const isMinisterActive = useCallback((ministerId) => {
        // 🔥 Sécurisation
        const activeMinsters = constitution.activeMinsters || [];
        return activeMinsters.length === 0 || activeMinsters.includes(ministerId);
    }, [constitution.activeMinsters]);

    /**
     * Vérifie si un ministère est actif
     * @param {string} ministryId - ID du ministère
     * @returns {boolean} True si le ministère est actif
     */
    const isMinistryActive = useCallback((ministryId) => {
        // 🔥 Sécurisation
        const activeMins = constitution.activeMins || [];
        return activeMins.length === 0 || activeMins.includes(ministryId);
    }, [constitution.activeMins]);

    return {
        // États
        constitution,
        selectedMinistry,
        selectedMinister,
        activeTab,
        openPromptEditor,

        // Setters UI
        setSelectedMinistry,
        setSelectedMinister,
        setActiveTab,
        setOpenPromptEditor,

        // Actions présidence
        updatePresidency,
        togglePresident,

        // Actions ministres
        toggleMinister,
        setAllMinistersActive,
        isMinisterActive,

        // Actions ministères
        toggleMinistry,
        setAllMinistriesActive,
        updateMinistryMission,
        assignMinisterToMinistry,
        updateMinisterPrompt,
        isMinistryActive,

        // Reset
        resetConstitution: () => setConstitution(initialConstitution)
    };
}
