// src/features/init/components/PresidencyDetail.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  PresidencyDetail.jsx — Configuration de la présidence (init)
//
//  0 à 3 présidents actifs.
//  Phare + Boussole sont prédéfinis, un 3e peut être créé par le joueur.
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocale } from '../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_PRIMARY, BTN_SECONDARY } from '../../../shared/theme';
import PresidencyList from '../../../shared/components/PresidencyList';
import EmojiPicker from '../../../shared/components/EmojiPicker';

// Couleurs par ordre d'entrée : or, violet, émeraude
const ACCENTS = [
    'rgba(200,164,74,0.88)',
    'rgba(140,100,220,0.85)',
    'rgba(60,200,140,0.85)',
];

const ORDRE_CANONIQUE = ['phare', 'boussole'];

function trierEntrees(presidency) {
    const entries = Object.entries(presidency || {}).filter(([, d]) => d);
    return [
        ...ORDRE_CANONIQUE.map(id => entries.find(([k]) => k === id)).filter(Boolean),
        ...entries.filter(([k]) => !ORDRE_CANONIQUE.includes(k)),
    ];
}

const FORM_VIDE = { id: '', name: '', emoji: '★', subtitle: '', essence: '' };

export default function PresidencyDetail({ presidency, activePres, setActivePres, setPlAgents }) {
    const { lang } = useLocale();
    const isEn = lang === 'en';
    const [ajoutOuvert, setAjoutOuvert] = useState(false);
    const [formData, setFormData] = useState(FORM_VIDE);

    const entries = trierEntrees(presidency);
    const accentDe = (i) => ACCENTS[i] || ACCENTS[ACCENTS.length - 1];

    const handleToggle = (key) =>
        setActivePres(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

    const handleChamp = (key, champ, valeur) =>
        setPlAgents(a => ({
            ...a,
            presidency: { ...a.presidency, [key]: { ...a.presidency[key], [champ]: valeur } }
        }));

    const handleAjouter = () => {
        if (!formData.id.trim() || !formData.name.trim()) return;
        const id = formData.id.trim().toLowerCase().replace(/\s+/g, '_');
        const nouveau = {
            id,
            name:     formData.name.trim(),
            symbol:   formData.emoji || '★',
            emoji:    formData.emoji || '★',
            subtitle: formData.subtitle.trim() || (isEn ? 'Custom president' : 'Président personnalisé'),
            essence:  formData.essence.trim(),
            custom:   true,
        };
        setPlAgents(a => ({
            ...a,
            presidency: { ...a.presidency, [id]: nouveau }
        }));
        setActivePres(prev => [...prev, id]);
        setFormData(FORM_VIDE);
        setAjoutOuvert(false);
    };

    const handleSupprimer = (key) => {
        setPlAgents(a => {
            const { [key]: _, ...reste } = a.presidency;
            return { ...a, presidency: reste };
        });
        setActivePres(prev => prev.filter(k => k !== key));
    };

    return (
        <>
        {/* Tuiles colorées */}
        <PresidencyList
            presidency={presidency}
            activePres={activePres}
            onPresidentClick={handleToggle}
            onAddPresident={entries.length < 3 ? () => setAjoutOuvert(true) : undefined}
            lang={lang}
        />

        {/* Formulaire ajout 3e président */}
        {ajoutOuvert && (
            <section style={{ ...CARD_STYLE, border: '1px solid rgba(60,200,140,0.22)', padding: '0.7rem' }}>
                <h3 style={{ fontSize: '0.50rem', color: 'rgba(60,200,140,0.65)', marginBottom: '0.5rem' }}>
                    + {isEn ? 'NEW PRESIDENT' : 'NOUVEAU PRÉSIDENT'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '0.38rem', marginBottom: '0.32rem' }}>
                    {/* Emoji picker */}
                    <details style={{ position: 'relative' }}>
                        <summary style={{ listStyle: 'none', cursor: 'pointer', fontSize: '1.2rem', width: '2.8rem', textAlign: 'center', padding: '0.2rem', border: '1px solid rgba(60,200,140,0.25)', borderRadius: '2px' }}>
                            {formData.emoji || '★'}
                        </summary>
                        <div style={{ position: 'absolute', zIndex: 100, top: '2.4rem', left: 0, background: 'rgba(8,13,22,0.98)', border: '1px solid rgba(60,200,140,0.22)', borderRadius: '3px', padding: '0.5rem', width: '340px' }}>
                            <EmojiPicker value={formData.emoji} onChange={e => setFormData({ ...formData, emoji: e })} />
                        </div>
                    </details>
                    <input
                        style={INPUT_STYLE}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isEn ? 'President name' : 'Nom du président'}
                    />
                    <input
                        style={INPUT_STYLE}
                        value={formData.id}
                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                        placeholder="id_unique"
                    />
                </div>

                <input
                    style={{ ...INPUT_STYLE, marginBottom: '0.28rem' }}
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder={isEn ? 'Subtitle (optional)' : 'Sous-titre (optionnel)'}
                />
                <textarea
                    style={{ ...INPUT_STYLE, minHeight: '40px', resize: 'vertical', fontFamily: FONT.mono, lineHeight: 1.5, marginBottom: '0.38rem' }}
                    value={formData.essence}
                    onChange={e => setFormData({ ...formData, essence: e.target.value })}
                    placeholder={isEn ? 'Essence — personality and role…' : 'Essence — personnalité et rôle…'}
                />
                <div style={{ display: 'flex', gap: '0.38rem', justifyContent: 'flex-end' }}>
                    <button style={BTN_SECONDARY} onClick={() => { setAjoutOuvert(false); setFormData(FORM_VIDE); }}>
                        {isEn ? 'Cancel' : 'Annuler'}
                    </button>
                    <button
                        style={{ ...BTN_PRIMARY, opacity: formData.name && formData.id ? 1 : 0.35 }}
                        disabled={!formData.name || !formData.id}
                        onClick={handleAjouter}
                    >
                        {isEn ? 'Create' : 'Créer'}
                    </button>
                </div>
            </section>
        )}

        {/* Fiches éditables — tous les présidents dynamiquement */}
        {entries.map(([key, p], i) => {
            const on     = activePres.includes(key);
            const accent = accentDe(i);
            const custom = !!p.custom;
            return (
                <div
                    key={key}
                    style={{
                        ...CARD_STYLE,
                        border: `1px solid ${on ? accent.replace('0.88', '0.20').replace('0.85', '0.20') : 'rgba(255,255,255,0.05)'}`,
                        opacity: on ? 1 : 0.42,
                        transition: 'opacity 0.15s',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <div style={{ fontFamily: FONT.mono, fontSize: '0.44rem', color: accent.replace('0.88', 'bb').replace('0.85', 'bb') }}>
                            {p.symbol || p.emoji} {p.name?.toUpperCase()} — {p.subtitle || p.titre || ''}
                        </div>
                        {custom && (
                            <button
                                onClick={() => handleSupprimer(key)}
                                style={{ background: 'none', border: 'none', color: 'rgba(165,55,75,0.55)', cursor: 'pointer', fontFamily: FONT.mono, fontSize: '0.38rem', padding: '0.1rem 0.3rem' }}
                            >
                                {isEn ? '✕ REMOVE' : '✕ SUPPRIMER'}
                            </button>
                        )}
                    </div>

                    <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(90,110,150,0.42)', marginBottom: '0.15rem' }}>
                        {isEn ? 'NAME' : 'NOM'}
                    </div>
                    <input
                        style={{ ...INPUT_STYLE, fontSize: '0.46rem', marginBottom: '0.35rem' }}
                        readOnly={!on}
                        value={p.name}
                        onChange={e => on && handleChamp(key, 'name', e.target.value)}
                    />

                    <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(90,110,150,0.42)', marginBottom: '0.15rem' }}>ESSENCE</div>
                    <textarea
                        style={{ ...INPUT_STYLE, width: '100%', minHeight: '48px', resize: 'vertical', fontSize: '0.41rem', fontFamily: FONT.mono, lineHeight: 1.5 }}
                        readOnly={!on}
                        value={p.essence || ''}
                        onChange={e => on && handleChamp(key, 'essence', e.target.value)}
                    />

                    {/* Rôle étendu (optionnel) */}
                    {p.role_long !== undefined && (
                        <>
                        <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(90,110,150,0.42)', margin: '0.28rem 0 0.15rem' }}>
                            {isEn ? 'EXTENDED ROLE' : 'RÔLE ÉTENDU'}
                        </div>
                        <textarea
                            style={{ ...INPUT_STYLE, width: '100%', minHeight: '48px', resize: 'vertical', fontSize: '0.41rem', fontFamily: FONT.mono, lineHeight: 1.5 }}
                            readOnly={!on}
                            value={p.role_long || ''}
                            onChange={e => on && handleChamp(key, 'role_long', e.target.value)}
                        />
                        </>
                    )}
                </div>
            );
        })}
        </>
    );
}
