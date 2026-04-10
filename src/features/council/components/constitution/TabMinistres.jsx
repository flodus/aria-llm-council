// src/features/council/components/constitution/TabMinistres.jsx
// Onglet Ministres de ConstitutionModal

import { BTN_SECONDARY } from '../../../../shared/theme';
import { sauvegarderEmojiAgent } from '../../../../shared/utils/agentsOverrides';
import { MinistersList, MinisterDetail, NewMinisterForm } from './index';

export default function TabMinistres({ isEn, constitution, selectedMinister, setSelectedMinister, toggleMinister, isMinisterActive, updateMinisterEssence, updateMinisterComm, updateMinisterAnnotation, addMinister, deleteMinister, setAllMinistersActive, setEmojiVersion, showNewMin, setShowNewMin, nMinD, setNMinD }) {
    return (
        <>
        <MinistersList
            ministers={constitution.ministers}
            activeMinsters={constitution.activeMinsters}
            onMinisterClick={id => setSelectedMinister(prev => prev === id ? null : id)}
            onSetAllActive={setAllMinistersActive}
            onEditEmoji={(id, emoji) => { sauvegarderEmojiAgent('ministers', id, emoji); setEmojiVersion(v => v + 1); }}
        />

        {showNewMin ? (
            <NewMinisterForm
                formData={nMinD}
                setFormData={setNMinD}
                onCancel={() => setShowNewMin(false)}
                onSubmit={() => {
                    const id = nMinD.id.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
                    if (!id || constitution.ministers[id]) return;
                    addMinister({ ...nMinD, id }, newId => setSelectedMinister(newId));
                    setNMinD({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'', annotation:'' });
                    setShowNewMin(false);
                }}
            />
        ) : (
            <button style={{ ...BTN_SECONDARY, alignSelf: 'center', color: 'rgba(100,200,120,0.55)', border: '1px solid rgba(100,200,120,0.22)' }} onClick={() => setShowNewMin(true)}>
                + {isEn ? 'New minister' : 'Nouveau ministre'}
            </button>
        )}

        {selectedMinister && constitution.ministers[selectedMinister] && (
            <MinisterDetail
                minister={constitution.ministers[selectedMinister]}
                ministerId={selectedMinister}
                isActive={isMinisterActive(selectedMinister)}
                isSelected={true}
                onToggleActive={() => toggleMinister(selectedMinister)}
                onUpdateEssence={value => updateMinisterEssence(selectedMinister, value)}
                onUpdateComm={value => updateMinisterComm(selectedMinister, value)}
                onUpdateAnnotation={value => updateMinisterAnnotation(selectedMinister, value)}
                onClose={() => setSelectedMinister(null)}
                onDelete={() => { deleteMinister(selectedMinister); setSelectedMinister(null); }}
                isCustom={constitution.ministers[selectedMinister]?.sign === 'Custom'}
            />
        )}
        </>
    );
}
