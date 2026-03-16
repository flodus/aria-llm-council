import { useState } from 'react';

export default function useMinisterForms() {
    const [newMinForm, setNewMinForm] = useState(false);
    const [newMinData, setNewMinData] = useState({
        id: '', name: '', emoji: '🌟', color: '#8090C0',
        essence: '', comm: '', annotation: ''
    });

    const [newMinistryForm, setNewMinistryForm] = useState(false);
    const [newMinistryData, setNewMinistryData] = useState({
        id: '', name: '', emoji: '🏛', color: '#8090C0',
        mission: '', ministers: []
    });

    const resetNewMinData = () => {
        setNewMinData({
            id: '', name: '', emoji: '🌟', color: '#8090C0',
            essence: '', comm: '', annotation: ''
        });
    };

    const resetNewMinistryData = () => {
        setNewMinistryData({
            id: '', name: '', emoji: '🏛', color: '#8090C0',
            mission: '', ministers: []
        });
    };

    const addMinister = (setPlAgents) => {
        if (!newMinData.id || !newMinData.name) return;
        const id = newMinData.id.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
        if (!id) return;
        setPlAgents(a => ({
            ...a,
            ministers: {
                ...a.ministers,
                [id]: { ...newMinData, id, sign: 'Custom', weight: 1 }
            }
        }));
        resetNewMinData();
        setNewMinForm(false);
    };

    const addMinistry = (setPlAgents) => {
        if (!newMinistryData.id || !newMinistryData.name) return;
        const id = newMinistryData.id.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
        if (!id) return;
        setPlAgents(a => ({
            ...a,
            ministries: [...a.ministries, {
                ...newMinistryData,
                id,
                keywords: [],
                questions: [],
                ministerPrompts: {}
            }]
        }));
        resetNewMinistryData();
        setNewMinistryForm(false);
    };

    return {
        // États
        newMinForm, setNewMinForm,
        newMinData, setNewMinData,
        newMinistryForm, setNewMinistryForm,
        newMinistryData, setNewMinistryData,

        // Reset
        resetNewMinData,
        resetNewMinistryData,

        // Add (NOUVEAU)
        addMinister,
        addMinistry
    };
}
