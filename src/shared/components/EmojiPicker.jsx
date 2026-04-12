// src/shared/components/EmojiPicker.jsx
//
// Sélecteur d'emoji — grille par catégorie + saisie libre.
// Deux modes :
//   compact=false (défaut) — picker toujours visible (usage en section dédiée)
//   compact=true           — bouton toggle : clic sur l'emoji actuel ouvre/ferme le picker
//
// Props :
//   value     : string  — emoji actuel
//   onChange  : fn(emoji) — callback à la sélection
//   compact   : bool    — mode toggle (défaut false)

import { useState } from 'react';
import { useLocale, t } from '../../ariaI18n';
import { COLORS } from '../theme/colors';

const CATEGORIES = [
  {
    id: 'drapeaux',
    label: { fr: '🏳 Drapeaux', en: '🏳 Flags' },
    emojis: ['🇫🇷','🇺🇸','🇨🇳','🇷🇺','🇩🇪','🇬🇧','🇯🇵','🇧🇷','🇮🇳','🇮🇹',
             '🇪🇸','🇨🇦','🇦🇺','🇰🇷','🇸🇦','🇲🇽','🇳🇬','🇦🇷','🇿🇦','🇹🇷',
             '🇵🇱','🇺🇦','🇸🇪','🇳🇴','🇨🇭','🇦🇹','🇧🇪','🇳🇱','🇵🇹','🇬🇷'],
  },
  {
    id: 'animaux',
    label: { fr: '🦁 Animaux', en: '🦁 Animals' },
    emojis: ['🦁','🐉','🦅','🐺','🦊','🐻','🦋','🦂','🐯','🦈',
             '🦝','🦌','🐘','🦏','🦬','🦖','🦉','🐍','🦀','🐊',
             '🦇','🐝','🦚','🦜','🐬','🐋','🦟','🦎','🐙','🦑'],
  },
  {
    id: 'symboles',
    label: { fr: '⚔️ Symboles', en: '⚔️ Symbols' },
    emojis: ['⚔️','🏛️','👑','🔱','⚜️','🛡️','🗡️','🔰','⚡','🌟',
             '✨','🔥','💎','🗺️','⚖️','🏺','🗿','💀','☠️','🏴‍☠️',
             '🎌','🏴','🚩','🎖️','🏆','🎯','🔮','💠','🧿','⭕'],
  },
  {
    id: 'nature',
    label: { fr: '🌲 Nature', en: '🌲 Nature' },
    emojis: ['🌲','🌊','🏔️','🌋','🏝️','🌾','🌸','🍀','🌿','🍃',
             '🌺','🌻','🌵','🌴','🍁','🌙','☀️','⭐','🌍','🪐',
             '🌌','🌠','💫','🌑','❄️','🌪️','🌈','🌅','🌄','🌃'],
  },
  {
    id: 'divers',
    label: { fr: '✦ Divers', en: '✦ Other' },
    emojis: ['☉','☽','★','✦','✧','✡','✝️','☪️','🕉️','☯️',
             '🧿','🔯','⛩️','🛕','🕌','⛪','🏯','🏰','🗼','🗽',
             '😈','👿','👁️','🤖','👽','🧙','🧛','🧜','🧝','🧞'],
  },
];

const STYLE = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  catRow:  { display: 'flex', gap: '0.3rem', flexWrap: 'wrap' },
  catBtn: (actif) => ({
    padding: '0.18rem 0.55rem',
    background: actif ? 'rgba(200,164,74,0.12)' : 'transparent',
    border: `1px solid ${actif ? 'rgba(200,164,74,0.45)' : 'rgba(140,160,200,0.15)'}`,
    color: actif ? COLORS.gold : COLORS.textDim,
    borderRadius: '2px', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.42rem', letterSpacing: '0.08em',
    transition: 'all 0.12s',
  }),
  grille: { display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px' },
  emojiBtn: (sel) => ({
    fontSize: '1.1rem', lineHeight: 1, padding: '0.25rem',
    background: sel ? 'rgba(200,164,74,0.18)' : 'transparent',
    border: `1px solid ${sel ? 'rgba(200,164,74,0.45)' : 'transparent'}`,
    borderRadius: '3px', cursor: 'pointer', transition: 'background 0.1s', textAlign: 'center',
  }),
  champLibre: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' },
  input: {
    width: '60px', textAlign: 'center', fontSize: '1.2rem',
    background: 'rgba(8,13,22,0.95)', border: '1px solid rgba(200,164,74,0.20)',
    color: '#C8D4E8', borderRadius: '2px', padding: '0.2rem', outline: 'none',
  },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.42rem', color: 'rgba(140,160,200,0.55)', letterSpacing: '0.08em',
  },
};

// Contenu interne du picker (partagé entre modes)
function PickerContenu({ value, onChange, lang, onClose }) {
  const [catActive, setCatActive] = useState('drapeaux');
  const [saisie, setSaisie]       = useState('');
  const isEn = lang === 'en';

  const cat = CATEGORIES.find(c => c.id === catActive) || CATEGORIES[0];

  const handleSaisie = (e) => {
    const val = e.target.value;
    setSaisie(val);
    const chars = [...val];
    if (chars.length > 0) { onChange(chars[0]); if (onClose) onClose(); }
  };

  const handleSelect = (emoji) => {
    onChange(emoji);
    setSaisie('');
    if (onClose) onClose();
  };

  return (
    <div style={STYLE.wrapper}>
      <div style={STYLE.catRow}>
        {CATEGORIES.map(c => (
          <button key={c.id} style={STYLE.catBtn(catActive === c.id)}
            onClick={() => setCatActive(c.id)}>
            {c.label[lang] || c.label.fr}
          </button>
        ))}
      </div>
      <div style={STYLE.grille}>
        {cat.emojis.map(e => (
          <button key={e} style={STYLE.emojiBtn(value === e)}
            onClick={() => handleSelect(e)} title={e}>
            {e}
          </button>
        ))}
      </div>
      <div style={STYLE.champLibre}>
        <span style={STYLE.label}>{t('EMOJI_TYPE_DIRECT', lang)}</span>
        <input style={STYLE.input} value={saisie} onChange={handleSaisie}
          placeholder={value} maxLength={4} />
      </div>
    </div>
  );
}

export default function EmojiPicker({ value, onChange, compact = false, emojiStyle = {} }) {
  const { lang } = useLocale();
  const [ouvert, setOuvert] = useState(false);

  // Mode compact : bouton toggle — fermé par défaut
  if (compact) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setOuvert(p => !p)}
          title={ouvert ? (lang === 'en' ? 'Close' : 'Fermer') : (lang === 'en' ? 'Change emoji' : 'Changer l\'emoji')}
          style={{
            background: ouvert ? 'rgba(200,164,74,0.10)' : 'transparent',
            border: `1px solid ${ouvert ? 'rgba(200,164,74,0.35)' : 'rgba(140,160,200,0.18)'}`,
            borderRadius: '3px', cursor: 'pointer',
            padding: '0.15rem 0.4rem', lineHeight: 1,
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            transition: 'all 0.12s',
          }}>
          <span style={{ fontSize: '1.1rem', ...emojiStyle }}>{value || '❓'}</span>
          <span style={{ fontSize: '0.55rem', opacity: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>✏</span>
        </button>
        {ouvert && (
          <div style={{
            position: 'absolute', zIndex: 300, top: 'calc(100% + 4px)', left: 0,
            background: 'rgba(8,13,22,0.98)',
            border: '1px solid rgba(140,160,200,0.20)',
            borderRadius: '4px', padding: '0.6rem',
            minWidth: '320px', boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
          }}>
            <PickerContenu value={value} onChange={onChange} lang={lang}
              onClose={() => setOuvert(false)} />
          </div>
        )}
      </div>
    );
  }

  // Mode normal : picker toujours visible
  return <PickerContenu value={value} onChange={onChange} lang={lang} />;
}
