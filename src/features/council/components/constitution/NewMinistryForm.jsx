// src/features/council/components/constitution/NewMinistryForm.jsx

import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_PRIMARY, BTN_SECONDARY } from '../../../../shared/theme';

export default function NewMinistryForm({ formData, setFormData, onCancel, onSubmit }) {
    const { lang } = useLocale();
    const isEn = lang === 'en';

    return (
        <section style={{ ...CARD_STYLE, border: '1px solid rgba(100,160,255,0.22)', padding: '0.7rem' }}>
        <h3 style={{ fontSize: '0.50rem', color: 'rgba(100,160,255,0.65)' }}>
        + {isEn ? 'NEW MINISTRY' : 'NOUVEAU MINISTÈRE'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '0.38rem', marginBottom: '0.32rem' }}>
        <input
        style={{ ...INPUT_STYLE, width: '2.8rem', padding: '0.38rem 0.1rem', textAlign: 'center', fontSize: '1rem' }}
        value={formData.emoji}
        onChange={e => setFormData({ ...formData, emoji: e.target.value })}
        placeholder="🏛️"
        />
        <input
        style={INPUT_STYLE}
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        placeholder={isEn ? 'Ministry name' : 'Nom du ministère'}
        />
        <input
        style={INPUT_STYLE}
        value={formData.id}
        onChange={e => setFormData({ ...formData, id: e.target.value })}
        placeholder="id_unique"
        />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.32rem' }}>
        <span style={{ fontFamily: FONT, fontSize: '0.43rem', color: 'rgba(140,160,200,0.48)' }}>
        {isEn ? 'Color' : 'Couleur'}
        </span>
        <input
        type="color"
        value={formData.color}
        style={{ width: '1.9rem', height: '1.5rem', border: 'none', background: 'none', cursor: 'pointer' }}
        onChange={e => setFormData({ ...formData, color: e.target.value })}
        />
        </div>
        <textarea
        style={{ ...INPUT_STYLE, minHeight: '34px', resize: 'vertical', lineHeight: 1.5, fontFamily: FONT, marginBottom: '0.38rem' }}
        value={formData.mission}
        onChange={e => setFormData({ ...formData, mission: e.target.value })}
        placeholder={isEn ? 'Ministry mission…' : 'Mission du ministère…'}
        />
        <div style={{ display: 'flex', gap: '0.38rem', justifyContent: 'flex-end' }}>
        <button style={BTN_SECONDARY} onClick={onCancel}>{isEn ? 'Cancel' : 'Annuler'}</button>
        <button
        style={{ ...BTN_PRIMARY, opacity: formData.name && formData.id ? 1 : 0.35 }}
        disabled={!formData.name || !formData.id}
        onClick={onSubmit}
        >
        {isEn ? 'Create' : 'Créer'}
        </button>
        </div>
        </section>
    );
}
