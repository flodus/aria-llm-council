// src/features/world/modals/DiplomacyModal.jsx
import { S } from './modalStyles';

export default function DiplomacyModal({ sourceCountry, allCountries, alliances, onSetRelation, onClose }) {
  const others = allCountries.filter(c => c.id !== sourceCountry.id);

  const getCurrentRelation = (otherId) => {
    const a = alliances.find(
      x => (x.a === sourceCountry.id && x.b === otherId) ||
           (x.b === sourceCountry.id && x.a === otherId)
    );
    return a?.type || 'Neutre';
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: '460px' }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={S.modalTitle}>🤝 DIPLOMATIE — {sourceCountry?.nom}</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '55vh', overflowY: 'auto' }}>
          {others.length === 0 && (
            <p style={S.modalHint}>Aucun autre pays dans le monde.</p>
          )}
          {others.map(other => {
            const current = getCurrentRelation(other.id);
            return (
              <div key={other.id} style={S.diploRow}>
                <span style={S.diploNom}>{other.emoji} {other.nom}</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {['Alliance', 'Neutre', 'Tension'].map(type => (
                    <button
                      key={type}
                      style={{
                        ...S.relBtn,
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.48rem',
                        ...(current === type ? S.relBtnActive : {}),
                      }}
                      onClick={() => onSetRelation(sourceCountry.id, other.id, type)}
                    >
                      {type === 'Alliance' ? '🤝' : type === 'Tension' ? '⚡' : '○'}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={S.modalFooter}>
          <button style={S.saveBtn} onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
