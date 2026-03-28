// src/shared/components/EmojiPicker.jsx
//
// Sélecteur d'emoji pays — grille par catégorie + saisie libre.
// Aucune dépendance externe, emojis unicode natifs.
//
// Props :
//   value     : string  — emoji actuel
//   onChange  : fn(emoji) — callback à la sélection

import { useState } from 'react';
import { useLocale } from '../../ariaI18n';
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
];

const STYLE = {
    wrapper: {
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
    },
    catRow: {
        display: 'flex', gap: '0.3rem', flexWrap: 'wrap',
    },
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
    grille: {
        display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px',
    },
    emojiBtn: (selectionne) => ({
        fontSize: '1.1rem', lineHeight: 1,
        padding: '0.25rem',
        background: selectionne ? 'rgba(200,164,74,0.18)' : 'transparent',
        border: `1px solid ${selectionne ? 'rgba(200,164,74,0.45)' : 'transparent'}`,
        borderRadius: '3px', cursor: 'pointer',
        transition: 'background 0.1s',
        textAlign: 'center',
    }),
    champLibre: {
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginTop: '0.2rem',
    },
    input: {
        width: '60px', textAlign: 'center', fontSize: '1.2rem',
        background: 'rgba(8,13,22,0.95)',
        border: '1px solid rgba(200,164,74,0.20)',
        color: '#C8D4E8', borderRadius: '2px', padding: '0.2rem',
        outline: 'none',
    },
    label: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.42rem', color: 'rgba(140,160,200,0.55)',
        letterSpacing: '0.08em',
    },
};

export default function EmojiPicker({ value, onChange }) {
    const { lang } = useLocale();
    const isEn = lang === 'en';
    const [catActive, setCatActive] = useState('drapeaux');
    const [saisie, setSaisie] = useState('');

    const cat = CATEGORIES.find(c => c.id === catActive) || CATEGORIES[0];

    const handleSaisie = (e) => {
        const val = e.target.value;
        setSaisie(val);
        // Prendre le premier caractère emoji (peut être multi-codepoint)
        const chars = [...val];
        if (chars.length > 0) onChange(chars[0]);
    };

    return (
        <div style={STYLE.wrapper}>
            {/* Catégories */}
            <div style={STYLE.catRow}>
                {CATEGORIES.map(c => (
                    <button key={c.id} style={STYLE.catBtn(catActive === c.id)}
                        onClick={() => setCatActive(c.id)}>
                        {c.label[lang] || c.label.fr}
                    </button>
                ))}
            </div>

            {/* Grille emojis */}
            <div style={STYLE.grille}>
                {cat.emojis.map(e => (
                    <button key={e} style={STYLE.emojiBtn(value === e)}
                        onClick={() => { onChange(e); setSaisie(''); }}
                        title={e}>
                        {e}
                    </button>
                ))}
            </div>

            {/* Saisie libre */}
            <div style={STYLE.champLibre}>
                <span style={STYLE.label}>{isEn ? 'OR TYPE DIRECTLY:' : 'OU SAISIR DIRECTEMENT :'}</span>
                <input
                    style={STYLE.input}
                    value={saisie}
                    onChange={handleSaisie}
                    placeholder={value}
                    maxLength={4}
                />
            </div>
        </div>
    );
}
