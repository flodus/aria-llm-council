// src/features/council/components/constitution/TabPresidence.jsx
// Onglet Présidence de ConstitutionModal

import { FONT, CARD_STYLE, BTN_PRIMARY, BTN_SECONDARY, INPUT_STYLE } from '../../../../shared/theme';
import { t } from '../../../../ariaI18n';
import { sauvegarderEmojiAgent } from '../../../../shared/utils/agentsOverrides';
import PresidencyTiles, { activePresToType, typeToActivePres } from '../../../../shared/components/PresidencyTiles';
import EmojiPicker from '../../../../shared/components/EmojiPicker';
import { PresidentDetail } from './index';

const ACCENTS_PRES = ['rgba(200,164,74,0.88)', 'rgba(140,100,220,0.85)', 'rgba(60,200,140,0.85)'];

export default function TabPresidence({ isEn, constitution, presSymbols, selectedPresident, setSelectedPresident, setActivePres, togglePresident, updatePresidency, addPresident, deletePresident, setEmojiVersion, showNewPresident, setShowNewPresident, nPresD, setNPresD }) {
    const ORDRE = ['phare', 'boussole'];
    const presEntries = [
        ...ORDRE.map(id => [id, constitution.presidency?.[id]]).filter(([, d]) => d),
        ...Object.entries(constitution.presidency || {}).filter(([k, d]) => d && !ORDRE.includes(k)),
    ];

    return (
        <>
        <PresidencyTiles
            presType={activePresToType(constitution.activePres)}
            onSelect={v => { setActivePres(typeToActivePres(v)); setSelectedPresident(null); }}
            isEn={isEn}
            presSymbols={presSymbols}
            onEditEmoji={(presId, emoji) => { sauvegarderEmojiAgent('presidency', presId, emoji); setEmojiVersion(v => v + 1); }}
            showTrinaire={Object.keys(constitution.presidency || {}).some(k => !['phare','boussole'].includes(k))}
        />
        <p style={{ fontSize: '0.40rem', color: 'rgba(140,160,200,0.45)', margin: '0.3rem 0 0.5rem', lineHeight: 1.5 }}>
            {isEn
                ? `${presEntries.length}/3 figures — 0 to 3 presidents active. No presidency → collegial mode.`
                : `${presEntries.length}/3 figures — 0 à 3 présidents actifs. Sans présidence → mode collégial.`}
        </p>

        {presEntries.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
                {presEntries.map(([pid, p], i) => {
                    if (!p) return null;
                    const isSel   = selectedPresident === pid;
                    const acc     = ACCENTS_PRES[i] || ACCENTS_PRES[ACCENTS_PRES.length - 1];
                    const isActif = constitution.activePres.includes(pid);
                    return (
                        <button key={pid}
                            onClick={() => setSelectedPresident(isSel ? null : pid)}
                            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.42rem', padding: '0.25rem 0.65rem', borderRadius: '2px', cursor: 'pointer', background: isSel ? acc.replace('0.88','0.12').replace('0.85','0.12') : 'rgba(255,255,255,0.03)', border: `1px solid ${isSel ? acc.replace('0.88','0.45').replace('0.85','0.45') : 'rgba(140,160,200,0.15)'}`, color: isActif ? acc : 'rgba(140,160,200,0.35)', opacity: isActif ? 1 : 0.5 }}>
                            {p.symbol || p.emoji || '★'} {t('TAB_PRES_CONFIGURE', lang)} {p.name}
                        </button>
                    );
                })}
                {presEntries.length < 3 && (
                    <button onClick={() => setShowNewPresident(v => !v)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.42rem', padding: '0.25rem 0.65rem', borderRadius: '2px', cursor: 'pointer', background: 'transparent', border: '1px dashed rgba(60,200,140,0.30)', color: 'rgba(60,200,140,0.60)' }}>
                        + {t('TAB_PRES_ADD', lang)}
                    </button>
                )}
            </div>
        )}

        {showNewPresident && (
            <section style={{ ...CARD_STYLE, border: '1px solid rgba(60,200,140,0.22)', padding: '0.7rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.50rem', color: 'rgba(60,200,140,0.65)', marginBottom: '0.5rem' }}>
                    + {t('TAB_PRES_NEW', lang)}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '0.38rem', marginBottom: '0.28rem' }}>
                    <details style={{ position: 'relative' }}>
                        <summary style={{ listStyle: 'none', cursor: 'pointer', fontSize: '1.2rem', width: '2.8rem', textAlign: 'center', padding: '0.2rem', border: '1px solid rgba(60,200,140,0.25)', borderRadius: '2px' }}>
                            {nPresD.emoji || '★'}
                        </summary>
                        <div style={{ position: 'absolute', zIndex: 200, top: '2.4rem', left: 0, background: 'rgba(8,13,22,0.98)', border: '1px solid rgba(60,200,140,0.22)', borderRadius: '3px', padding: '0.5rem', width: '340px' }}>
                            <EmojiPicker value={nPresD.emoji} onChange={e => setNPresD(d => ({ ...d, emoji: e }))} />
                        </div>
                    </details>
                    <input style={INPUT_STYLE} value={nPresD.name} placeholder={t('TAB_PRES_NAME_PH', lang)} onChange={e => setNPresD(d => ({ ...d, name: e.target.value }))} />
                    <input style={INPUT_STYLE} value={nPresD.id} placeholder="id_unique" onChange={e => setNPresD(d => ({ ...d, id: e.target.value }))} />
                </div>
                <input style={{ ...INPUT_STYLE, marginBottom: '0.28rem' }} value={nPresD.subtitle} placeholder={t('TAB_PRES_SUBTITLE_PH', lang)} onChange={e => setNPresD(d => ({ ...d, subtitle: e.target.value }))} />
                <textarea style={{ ...INPUT_STYLE, minHeight: '38px', resize: 'vertical', fontFamily: FONT, lineHeight: 1.5, marginBottom: '0.38rem' }} value={nPresD.essence} placeholder="Essence…" onChange={e => setNPresD(d => ({ ...d, essence: e.target.value }))} />
                <div style={{ display: 'flex', gap: '0.38rem', justifyContent: 'flex-end' }}>
                    <button style={BTN_SECONDARY} onClick={() => { setShowNewPresident(false); setNPresD({ id:'', name:'', emoji:'★', subtitle:'', essence:'' }); }}>
                        {t('TAB_PRES_CANCEL', lang)}
                    </button>
                    <button style={{ ...BTN_PRIMARY, opacity: nPresD.name && nPresD.id ? 1 : 0.35 }} disabled={!nPresD.name || !nPresD.id}
                        onClick={() => {
                            const id = nPresD.id.trim().toLowerCase().replace(/\s+/g,'_');
                            addPresident({ id, name: nPresD.name.trim(), symbol: nPresD.emoji, emoji: nPresD.emoji, subtitle: nPresD.subtitle.trim() || t('TAB_PRES_CUSTOM', lang), essence: nPresD.essence.trim(), custom: true });
                            setShowNewPresident(false);
                            setNPresD({ id:'', name:'', emoji:'★', subtitle:'', essence:'' });
                            setSelectedPresident(id);
                        }}>
                        {t('TAB_PRES_CREATE', lang)}
                    </button>
                </div>
            </section>
        )}

        {selectedPresident && constitution.presidency[selectedPresident] && (
            <PresidentDetail
                president={constitution.presidency[selectedPresident]}
                presidentId={selectedPresident}
                isActive={constitution.activePres.includes(selectedPresident)}
                isSelected={true}
                onToggleActive={() => togglePresident(selectedPresident)}
                onUpdateField={(field, value) => updatePresidency(selectedPresident, field, value)}
                onDelete={constitution.presidency[selectedPresident]?.custom ? () => { deletePresident(selectedPresident); setSelectedPresident(null); } : undefined}
                onClose={() => setSelectedPresident(null)}
            />
        )}
        </>
    );
}
