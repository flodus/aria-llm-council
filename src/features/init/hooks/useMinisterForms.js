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

    return {
        newMinForm, setNewMinForm,
        newMinData, setNewMinData, resetNewMinData,
        newMinistryForm, setNewMinistryForm,
        newMinistryData, setNewMinistryData, resetNewMinistryData
    };
}
