// src/features/council/components/constitution/TabDestin.jsx
// Onglet Destinée du monde de ConstitutionModal

import { FONT, CARD_STYLE, INPUT_STYLE } from '../../../../shared/theme';
import { t } from '../../../../ariaI18n';
import { sauvegarderEmojiAgent } from '../../../../shared/utils/agentsOverrides';
import { getAgentsEffectifs } from '../../../../shared/utils/agentsOverrides';
import { getDestin } from '../../services/agentsManager';
import AgentGrid from '../../../../shared/components/AgentGrid';

export default function TabDestin({ isEn, constitution, selectedDestin, setSelectedDestin, activeDestinAgents, setActiveDestinAgents, setDestinyMode, setActiveTab, updateMinisterEssence, updateMinisterComm, setEmojiVersion, lang }) {
    const destin    = getDestin();
    const destingIds = destin?.agents || [];
    const destAgents = destingIds
        .map(id => ({ id, ...(constitution.ministers?.[id] || getAgentsEffectifs().ministers?.[id] || {}) }))
        .filter(a => a.name);

    const toggleDestinAgent = (id) => {
        setActiveDestinAgents(prev => {
            const all  = destin?.agents || [];
            const cur  = prev || all;
            const on   = cur.includes(id);
            const next = on ? cur.filter(k => k !== id) : [...cur, id];
            if (next.length === 0) {
                setDestinyMode(false);
                setActiveTab('regime');
                return all;
            }
            return next.length === all.length ? all : next;
        });
    };

    return (
        <>
        <AgentGrid
            agents={destAgents}
            selectedId={selectedDestin}
            activeIds={activeDestinAgents}
            onAgentClick={id => {
                if (selectedDestin !== id) {
                    setSelectedDestin(id);
                } else {
                    toggleDestinAgent(id);
                    setSelectedDestin(null);
                }
            }}
            onResetAll={() => setActiveDestinAgents(destin?.agents || [])}
            onEditEmoji={(id, emoji) => { sauvegarderEmojiAgent('ministers', id, emoji); setEmojiVersion(v => v + 1); }}
            countLabel={`${destAgents.length} ${t('CONSEIL_DESTINY_AGENTS', lang)}`}
            lang={lang}
        />

        {destAgents.map(agent => {
            if (selectedDestin && selectedDestin !== agent.id) return null;
            const on = activeDestinAgents === null || activeDestinAgents.includes(agent.id);
            return (
                <div key={agent.id} style={{ ...CARD_STYLE, border: `1px solid ${agent.color}33`, opacity: on ? 1 : 0.4 }}>
                    <div style={{ fontFamily: FONT.mono, fontSize: '0.44rem', color: agent.color + 'CC', marginBottom: '0.4rem' }}>
                        {agent.emoji} {agent.name?.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.12rem' }}>ESSENCE</div>
                    <textarea
                        style={{ ...INPUT_STYLE, width: '100%', minHeight: '40px', resize: 'vertical', fontSize: '0.40rem', fontFamily: FONT.mono, lineHeight: 1.5, marginBottom: '0.25rem' }}
                        readOnly={!on}
                        value={agent.essence || ''}
                        onChange={e => on && updateMinisterEssence && updateMinisterEssence(agent.id, e.target.value)}
                    />
                    <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.12rem' }}>
                        {t('TAB_DESTIN_COMM', lang)}
                    </div>
                    <textarea
                        style={{ ...INPUT_STYLE, width: '100%', minHeight: '32px', resize: 'vertical', fontSize: '0.40rem', fontFamily: FONT.mono, lineHeight: 1.5 }}
                        readOnly={!on}
                        value={agent.comm || ''}
                        onChange={e => on && updateMinisterComm && updateMinisterComm(agent.id, e.target.value)}
                    />
                </div>
            );
        })}
        </>
    );
}
