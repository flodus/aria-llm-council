/**
 * Modale de modification de la constitution en cours de jeu
 * Permet de modifier la présidence, les ministères, les ministres et leurs prompts
 *
 * @param {Object} props - Les props du composant
 * @param {boolean} props.isOpen - La modale est-elle ouverte ?
 * @param {function} props.onClose - Callback de fermeture
 * @param {Object} props.initialConstitution - Constitution initiale
 * @param {function} props.onSave - Callback de sauvegarde
 * @returns {JSX.Element} La modale de constitution
 */

import { useLocale, t } from '../../../ariaI18n';
import { FONT, CARD_STYLE, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from '../../../shared/theme';
import useConstitutionModal from '../hooks/useConstitutionModal';
import {
    PresidencySection,
    MinistersList,
    MinistryDetail,
    PromptEditor
} from './constitution';

export default function ConstitutionModal({ country, onSave, onClose }) {
    const { lang } = useLocale();

    const {
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

        // Actions
        updatePresidency,
        togglePresident,
        toggleMinister,
        setAllMinistersActive,
        isMinisterActive,
        toggleMinistry,
        setAllMinistriesActive,
        updateMinistryMission,
        assignMinisterToMinistry,
        updateMinisterPrompt,
        isMinistryActive,
        resetConstitution
    } = useConstitutionModal(country?.governance);

    const handleSave = () => {
        onSave(constitution);
        onClose();
    };

    const handleClose = () => {
        resetConstitution();
        onClose();
    };

    const tabs = [
        { id: 'presidency', label: lang === 'en' ? 'PRESIDENCY' : 'PRÉSIDENCE' },
        { id: 'ministries', label: lang === 'en' ? 'MINISTRIES' : 'MINISTÈRES' },
        { id: 'ministers', label: lang === 'en' ? 'MINISTERS' : 'MINISTRES' }
    ];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4,8,18,0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        }}>
        <div style={{
            ...CARD_STYLE,
            width: 680,
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.5rem'
        }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={labelStyle('0.58rem')}>
        ⚖ {lang === 'en' ? 'CONSTITUTION' : 'CONSTITUTION'}
        </div>
        <button
        onClick={handleClose}
        style={{
            background: 'none',
            border: 'none',
            color: 'rgba(200,80,80,0.45)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0.2rem'
        }}
        >
        ✕
        </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.2rem', borderBottom: '1px solid rgba(200,164,74,0.10)' }}>
        {tabs.map(tab => (
            <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
                fontFamily: FONT.mono,
                fontSize: '0.46rem',
                letterSpacing: '0.10em',
                padding: '0.35rem 0.75rem',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id
                ? '2px solid rgba(200,164,74,0.70)'
                : '2px solid transparent',
                color: activeTab === tab.id
                ? 'rgba(200,164,74,0.90)'
                : 'rgba(140,160,200,0.35)'
            }}
            >
            {tab.label}
            </button>
        ))}
        </div>

        {/* Contenu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activeTab === 'presidency' && (
            <PresidencySection
            presidency={constitution.presidency}
            activePres={constitution.activePres}
            setActivePres={togglePresident}
            setPresidencyField={updatePresidency}
            />
        )}

        {activeTab === 'ministers' && (
            <>
            <MinistersList
            ministers={constitution.ministers}
            activeMinsters={constitution.activeMinsters}
            onToggleMinister={toggleMinister}
            onSetAllActive={setAllMinistersActive}
            />

            {/* Éditeur de prompt pour le ministre sélectionné */}
            {selectedMinister && (
                <PromptEditor
                prompt={{
                    id: selectedMinister,
                    title: constitution.ministers[selectedMinister]?.name,
                    content: constitution.ministers[selectedMinister]?.essence,
                    type: 'minister',
                    color: constitution.ministers[selectedMinister]?.color
                }}
                isOpen={openPromptEditor === selectedMinister}
                onToggle={() => setOpenPromptEditor(
                    openPromptEditor === selectedMinister ? null : selectedMinister
                )}
                onSave={(newContent) => {
                    // À implémenter selon la structure des données
                    console.log('Save prompt for', selectedMinister, newContent);
                }}
                onCancel={() => setOpenPromptEditor(null)}
                />
            )}
            </>
        )}

        {activeTab === 'ministries' && (
            <>
            {/* Liste des ministères sous forme de grille (à faire si besoin) */}
            {constitution.ministries.map(ministry => (
                <MinistryDetail
                key={ministry.id}
                ministry={ministry}
                isActive={isMinistryActive(ministry.id)}
                isSelected={selectedMinistry === ministry.id}
                onToggleActive={() => toggleMinistry(ministry.id)}
                onUpdateMission={(newMission) =>
                    updateMinistryMission(ministry.id, newMission)
                }
                ministers={constitution.ministers}
                onAssignMinister={(ministerId, isIn) =>
                    assignMinisterToMinistry(ministry.id, ministerId, isIn)
                }
                onUpdatePrompt={(ministerId, newPrompt) =>
                    updateMinisterPrompt(ministry.id, ministerId, newPrompt)
                }
                />
            ))}
            </>
        )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button style={BTN_SECONDARY} onClick={handleClose}>
        {lang === 'en' ? 'CANCEL' : 'ANNULER'}
        </button>
        <button style={BTN_PRIMARY} onClick={handleSave}>
        {lang === 'en' ? 'SAVE' : 'SAUVEGARDER'}
        </button>
        </div>
        </div>
        </div>
    );
}
