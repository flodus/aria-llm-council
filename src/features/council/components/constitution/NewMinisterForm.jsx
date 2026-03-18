// src/features/council/components/constitution/NewMinisterForm.jsx
import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_PRIMARY, BTN_SECONDARY } from '../../../../shared/theme';

export default function NewMinisterForm({ formData, setFormData, onCancel, onSubmit }) {
    const { lang } = useLocale();
    const isEn = lang === 'en';

    return (
        <section style={{ ...CARD_STYLE, border: '1px solid rgba(100,200,120,0.22)', padding: '0.7rem' }}>
        <h3 style={{ fontSize: '0.50rem', color: 'rgba(100,200,120,0.65)' }}>
        + {isEn ? 'NEW MINISTER' : 'NOUVEAU MINISTRE'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '0.38rem', marginBottom: '0.32rem', alignItems: 'center' }}>
        <input
        style={{ ...INPUT_STYLE, width: '1.9rem', textAlign: 'center', fontSize: '1rem' }}
        value={formData.emoji}
        onChange={e => setFormData({ ...formData, emoji: e.target.value })}
        placeholder="🌟"
        />
        <input
        style={INPUT_STYLE}
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        placeholder={isEn ? 'Minister name' : 'Nom du ministre'}
        />
        <input
        style={INPUT_STYLE}
        value={formData.id}
        onChange={e => setFormData({ ...formData, id: e.target.value })}
        placeholder="id_unique"
        />
        <input
        type="color"
        value={formData.color}
        style={{ width: '1.9rem', height: '1.8rem', border: 'none', background: 'none', cursor: 'pointer' }}
        onChange={e => setFormData({ ...formData, color: e.target.value })}
        />
        </div>
        <textarea
        style={{ ...INPUT_STYLE, minHeight: '34px', resize: 'vertical', lineHeight: 1.5, fontFamily: FONT, marginBottom: '0.28rem' }}
        value={formData.essence}
        onChange={e => setFormData({ ...formData, essence: e.target.value })}
        placeholder={isEn ? 'Minister essence…' : 'Essence du ministre…'}
        />
        <textarea
        style={{ ...INPUT_STYLE, minHeight: '26px', resize: 'vertical', lineHeight: 1.5, fontFamily: FONT, marginBottom: '0.28rem' }}
        value={formData.comm}
        onChange={e => setFormData({ ...formData, comm: e.target.value })}
        placeholder={isEn ? 'Communication style…' : 'Style de communication…'}
        />
        <div style={{ fontSize: '0.42rem', color: 'rgba(90,110,150,0.45)', marginBottom: '0.12rem' }}>
        {isEn ? 'ANNOTATION ANGLE' : 'ANGLE D\'ANNOTATION'}
        <span style={{ fontWeight: 'normal', color: 'rgba(90,110,150,0.35)' }}>
        {isEn ? ' — question asked in inter-ministerial annotations' : ' — question posée lors des annotations inter-ministérielles'}
        </span>
        </div>
        <textarea
        style={{ ...INPUT_STYLE, minHeight: '26px', resize: 'vertical', lineHeight: 1.5, fontFamily: FONT, marginBottom: '0.38rem' }}
        value={formData.annotation}
        onChange={e => setFormData({ ...formData, annotation: e.target.value })}
        placeholder={isEn ? "E.g. What is the minister's position on…" : "Ex : Quelle est la position du ministre sur l'équilibre entre…"}
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
