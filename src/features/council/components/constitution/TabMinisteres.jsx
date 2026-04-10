// src/features/council/components/constitution/TabMinisteres.jsx
// Onglet Ministères de ConstitutionModal

import { BTN_SECONDARY } from '../../../../shared/theme';
import { sauvegarderEmojiAgent } from '../../../../shared/utils/agentsOverrides';
import { getDestin } from '../../services/agentsManager';
import { MinistriesList, MinistryDetail, NewMinistryForm } from './index';

export default function TabMinisteres({ isEn, constitution, BASE_IDS, selectedMinistry, setSelectedMinistry, toggleMinistry, isMinistryActive, updateMinistryMission, assignMinisterToMinistry, updateMinisterPrompt, addMinistry, deleteMinistry, setAllMinistriesActive, setEmojiVersion, showNewMinistry, setShowNewMinistry, nMinistryD, setNMinistryD }) {
    return (
        <>
        <MinistriesList
            ministries={constitution.ministries}
            activeMins={constitution.activeMins}
            onToggleMinistry={toggleMinistry}
            onMinistryClick={id => setSelectedMinistry(prev => prev === id ? null : id)}
            onSetAllActive={setAllMinistriesActive}
            onEditEmoji={(id, emoji) => { sauvegarderEmojiAgent('ministries', id, emoji); setEmojiVersion(v => v + 1); }}
        />

        {showNewMinistry ? (
            <NewMinistryForm
                formData={nMinistryD}
                setFormData={setNMinistryD}
                onCancel={() => setShowNewMinistry(false)}
                onSubmit={() => {
                    const id = nMinistryD.id.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
                    if (!id || constitution.ministries.some(m => m.id === id)) return;
                    addMinistry({ ...nMinistryD, id }, newId => setSelectedMinistry(newId));
                    setNMinistryD({ id:'', name:'', emoji:'🏛️', color:'#8090C0', mission:'', ministers:[] });
                    setShowNewMinistry(false);
                }}
            />
        ) : (
            <button style={{ ...BTN_SECONDARY, alignSelf: 'center', color: 'rgba(100,160,255,0.55)', border: '1px solid rgba(100,160,255,0.22)' }} onClick={() => setShowNewMinistry(true)}>
                + {isEn ? 'New ministry' : 'Nouveau ministère'}
            </button>
        )}

        {selectedMinistry && (
            <MinistryDetail
                ministry={constitution.ministries.find(m => m.id === selectedMinistry)}
                isActive={isMinistryActive(selectedMinistry)}
                isSelected={true}
                onToggleActive={() => toggleMinistry(selectedMinistry)}
                onUpdateMission={newMission => updateMinistryMission(selectedMinistry, newMission)}
                ministers={Object.fromEntries(
                    Object.entries(constitution.ministers).filter(([id]) => !(getDestin()?.agents || []).includes(id))
                )}
                onAssignMinister={(ministerId, isIn) => assignMinisterToMinistry(selectedMinistry, ministerId, isIn)}
                onUpdatePrompt={(ministerId, newPrompt) => updateMinisterPrompt(selectedMinistry, ministerId, newPrompt)}
                onClose={() => setSelectedMinistry(null)}
                onDelete={() => { deleteMinistry(selectedMinistry); setSelectedMinistry(null); }}
                isBase={BASE_IDS.includes(selectedMinistry)}
            />
        )}
        </>
    );
}
