// src/shared/components/AgentGrid.jsx
//
// Grille de chips agent (ministres ou ministères)
// Style Init (3 états : sélectionné / actif / inactif, couleur par agent)
//
// Props :
//   agents        [{ id, name, emoji, color }] — ordre fourni par le parent (actifs en tête)
//   selectedId    string | null
//   activeIds     string[] | null  (null = tous actifs)
//   onAgentClick  (id) => void
//   onResetAll    () => void | null  (masque le bouton si null)
//   onEditEmoji   (id, emoji) => void | null  (active le mode édition emoji si fourni)
//   countLabel    string  ex: "7 MINISTÈRES"
//   lang          'fr' | 'en'

import { FONT, CARD_STYLE, BTN_SECONDARY, labelStyle } from '../theme';
import EmojiPicker from './EmojiPicker';

export default function AgentGrid({ agents, selectedId, activeIds, onAgentClick, onResetAll, onEditEmoji, countLabel, lang }) {
  const isOn = (id) => activeIds === null || activeIds.includes(id);

  return (
    <div style={{ ...CARD_STYLE }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
        <div style={labelStyle('0.42rem')}>{countLabel}</div>
        {onResetAll && (
          <button
            style={{ ...BTN_SECONDARY, fontSize: '0.38rem', padding: '0.14rem 0.38rem' }}
            onClick={onResetAll}
          >
            {lang === 'en' ? 'All active' : 'Tous actifs'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
        {agents.map(a => {
          const on  = isOn(a.id);
          const sel = selectedId === a.id;
          return (
            <div
              key={a.id}
              onClick={() => onAgentClick(a.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.28rem',
                padding: '0.26rem 0.50rem', borderRadius: '3px',
                cursor: 'pointer',
                background:  sel ? a.color + '38' : on ? a.color + '18' : 'rgba(8,14,26,0.60)',
                border:      sel ? `2px solid ${a.color}CC` : on ? `1px solid ${a.color}55` : '1px solid rgba(140,160,200,0.10)',
                transition:  'all 0.13s',
                boxShadow:   sel ? `0 0 8px ${a.color}22` : 'none',
              }}
            >
              {/* Emoji — compact EmojiPicker si onEditEmoji fourni */}
              {onEditEmoji ? (
                <span
                  onClick={e => e.stopPropagation()}
                  style={{ opacity: on ? 1 : 0.45, filter: on ? 'none' : 'grayscale(1)', transition: 'all 0.13s' }}
                >
                  <EmojiPicker compact value={a.emoji} onChange={emoji => onEditEmoji(a.id, emoji)} />
                </span>
              ) : (
                <span style={{ fontSize: '0.85rem', opacity: on ? 1 : 0.45, filter: on ? 'none' : 'grayscale(1)', transition: 'all 0.13s' }}>
                  {a.emoji}
                </span>
              )}
              <span style={{
                fontFamily: FONT.mono, fontSize: '0.41rem',
                color: sel ? a.color : on ? a.color + 'CC' : 'rgba(140,160,200,0.28)',
                transition: 'all 0.13s',
              }}>
                {a.name}
              </span>
            </div>
          );
        })}
      </div>

      {activeIds?.length === 0 && (
        <p style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(200,100,60,0.55)', margin: '0.3rem 0 0' }}>
          ⚠ {lang === 'en' ? 'No active agent' : 'Aucun agent actif'}
        </p>
      )}
    </div>
  );
}
