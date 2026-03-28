// src/shared/components/PresidencyTiles.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  Grille de tuiles de sélection de présidence
//  solaire · lunaire · duale · trinaire · collégiale
//
//  Props :
//    presType     'solaire' | 'lunaire' | 'duale' | 'trinaire' | 'collegiale'
//    onSelect     (presType: string) => void
//    isEn         boolean
//    presSymbols  { phare, boussole, trinaire } — emojis/symboles surchargés (optionnel)
//    onEditEmoji  (presId: 'phare'|'boussole'|'trinaire', emoji: string) => void (optionnel)
//    showTrinaire boolean — afficher la tuile trinaire (défaut false)
// ═══════════════════════════════════════════════════════════════════════════

import EmojiPicker from './EmojiPicker';

// Helpers de traduction activePres (string[]) ↔ presType (string)
export function activePresToType(activePres = []) {
  if (activePres.length === 0) return 'collegiale';
  if (activePres.length === 1) return activePres[0] === 'phare' ? 'solaire' : 'lunaire';
  if (activePres.length === 2) return 'duale';
  return 'trinaire';
}
export function typeToActivePres(presType) {
  return {
    solaire:    ['phare'],
    lunaire:    ['boussole'],
    duale:      ['phare', 'boussole'],
    trinaire:   ['phare', 'boussole'], // le 3e président est custom, géré par PresidencyDetail
    collegiale: [],
  }[presType] ?? ['phare', 'boussole'];
}

const ACCENT = {
  solaire:    'rgba(200,164,74,0.80)',
  lunaire:    'rgba(140,100,220,0.80)',
  duale:      'rgba(170,132,147,0.80)',
  trinaire:   'rgba(60,200,140,0.80)',
  collegiale: 'rgba(165,55,75,0.80)',
};

// Icône symbole seul (sans édition)
function SymSolaire({ sym }) {
  return <span style={{ color: 'rgba(200,164,74,0.90)', fontSize: '1.6rem', lineHeight: 1 }}>{sym}</span>;
}
function SymLunaire({ sym }) {
  return <span style={{ color: 'rgba(150,100,220,0.90)', fontSize: '1.6rem', lineHeight: 1 }}>{sym}</span>;
}

export default function PresidencyTiles({ presType, onSelect, isEn, presSymbols, onEditEmoji, showTrinaire = false }) {
  const sel = presType || 'duale';

  const symPhare    = presSymbols?.phare    || '☉';
  const symBoussole = presSymbols?.boussole || '☽';
  const symTrinaire = presSymbols?.trinaire || '★';

  const tiles = [
    {
      value: 'solaire',
      iconRender: onEditEmoji ? (
        <span onClick={e => e.stopPropagation()}>
          <EmojiPicker compact value={symPhare} onChange={e => onEditEmoji('phare', e)} />
        </span>
      ) : <SymSolaire sym={symPhare} />,
      label: isEn ? 'Phare' : 'Phare',
      tooltip: isEn ? 'The Phare — The Will' : 'Le Phare — La Volonté',
    },
    {
      value: 'lunaire',
      iconRender: onEditEmoji ? (
        <span onClick={e => e.stopPropagation()}>
          <EmojiPicker compact value={symBoussole} onChange={e => onEditEmoji('boussole', e)} />
        </span>
      ) : <SymLunaire sym={symBoussole} />,
      label: isEn ? 'Boussole' : 'Boussole',
      tooltip: isEn ? 'The Boussole — The Soul' : "La Boussole — L'Âme",
    },
    {
      value: 'duale',
      iconRender: (
        <span style={{ fontSize: '1.2rem', lineHeight: 1, letterSpacing: '-0.05em' }}>
          <span style={{ color: 'rgba(200,164,74,0.90)' }}>{symPhare}</span>
          <span style={{ color: 'rgba(150,100,220,0.90)' }}>{symBoussole}</span>
        </span>
      ),
      label: isEn ? 'Dual' : 'Duale',
      tooltip: isEn ? 'Phare + Boussole — ARIA mode' : 'Phare + Boussole — Mode ARIA',
    },
    {
      value: 'trinaire',
      iconRender: onEditEmoji ? (
        <span onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '0.05rem' }}>
          <EmojiPicker compact value={symPhare}    onChange={e => onEditEmoji('phare', e)} />
          <EmojiPicker compact value={symBoussole} onChange={e => onEditEmoji('boussole', e)} />
          <EmojiPicker compact value={symTrinaire} onChange={e => onEditEmoji('trinaire', e)} />
        </span>
      ) : (
        <span style={{ fontSize: '0.9rem', lineHeight: 1, letterSpacing: '-0.05em' }}>
          <span style={{ color: 'rgba(200,164,74,0.90)' }}>{symPhare}</span>
          <span style={{ color: 'rgba(150,100,220,0.90)' }}>{symBoussole}</span>
          <span style={{ color: 'rgba(60,200,140,0.90)' }}>{symTrinaire}</span>
        </span>
      ),
      label: isEn ? 'Trinaire' : 'Trinaire',
      tooltip: isEn ? '3 presidents — equal power' : '3 présidents — pouvoir égal',
    },
    {
      value: 'collegiale',
      iconRender: (
        <span className="mdi mdi-hexagram-outline"
          style={{ fontSize: '1.6rem', lineHeight: 1, color: 'rgba(165,55,75,0.88)' }} />
      ),
      label: isEn ? 'Collegial' : 'Collégiale',
      tooltip: isEn ? 'Constitutional Synthesis' : 'Synthèse Constitutionnelle',
    },
  ];

  const desc = {
    solaire:    isEn ? `${symPhare} The Phare\npresides alone\nThe Will`                              : `${symPhare} Le Phare\npréside seul\nLa Volonté`,
    lunaire:    isEn ? `${symBoussole} The Boussole\npresides alone\nThe Soul`                        : `${symBoussole} La Boussole\npréside seule\nL'Âme`,
    duale:      isEn ? `${symPhare}${symBoussole} Phare and Boussole\ndeliberate equally\nARIA mode`  : `${symPhare}${symBoussole} Le Phare et La Boussole\ndélibèrent à égalité\nMode ARIA`,
    trinaire:   isEn ? `${symPhare}${symBoussole}${symTrinaire} Three presidents\nequal authority`   : `${symPhare}${symBoussole}${symTrinaire} Trois présidents\nautorite égale`,
    collegiale: isEn ? '✡ Vote of 12 ministers\nConstitutional Synthesis'                            : '✡ Vote des 12 ministres\nSynthèse Constitutionnelle',
  }[sel] || '';

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {tiles.filter(({ value }) => value !== 'trinaire' || showTrinaire).map(({ value, iconRender, label, tooltip }) => {
          const isSel = sel === value;
          return (
            <button key={value} title={tooltip} onClick={() => onSelect(value)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                padding: '0.6rem 0.7rem', borderRadius: '6px', cursor: 'pointer', minWidth: '3.5rem',
                background: isSel ? 'rgba(200,164,74,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSel ? 'rgba(200,164,74,0.5)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.12s',
              }}>
              <span style={{ height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {iconRender}
              </span>
              <span style={{
                fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.52rem',
                color: isSel ? 'rgba(200,164,74,0.9)' : 'rgba(170,185,215,0.55)',
                letterSpacing: '0.03em', textAlign: 'center',
                maxWidth: '4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3,
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{
        borderLeft: `2px solid ${ACCENT[sel] || ACCENT.duale}44`, paddingLeft: '1rem',
        fontStyle: 'italic', color: ACCENT[sel] || ACCENT.duale,
        fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.50rem',
        lineHeight: 1.7, whiteSpace: 'pre-line', alignSelf: 'center',
      }}>
        {desc}
      </div>
    </div>
  );
}
