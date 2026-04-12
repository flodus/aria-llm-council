// src/features/council/components/constitution/NewMinisterForm.jsx

import { useLocale, t } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_PRIMARY, BTN_SECONDARY } from '../../../../shared/theme';
import EmojiPicker from '../../../../shared/components/EmojiPicker';

export default function NewMinisterForm({ formData, setFormData, onCancel, onSubmit }) {
    const { lang } = useLocale();
    const isEn = lang === 'en';

    return (
        <section style={{ ...CARD_STYLE, border: '1px solid rgba(100,200,120,0.22)', padding: '0.7rem' }}>
        <h3 style={{ fontSize: '0.50rem', color: 'rgba(100,200,120,0.65)' }}>
        + {t('FORM_NEW_MINISTER', lang)}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '0.38rem', marginBottom: '0.32rem', alignItems: 'center' }}>
        <details style={{ position: 'relative' }}>
        <summary style={{ listStyle: 'none', cursor: 'pointer', fontSize: '1.2rem', width: '2.8rem', textAlign: 'center', padding: '0.2rem', border: '1px solid rgba(200,164,74,0.18)', borderRadius: '2px' }}>
            {formData.emoji || '🌟'}
        </summary>
        <div style={{ position: 'absolute', zIndex: 100, top: '2.4rem', left: 0, background: 'rgba(8,13,22,0.98)', border: '1px solid rgba(200,164,74,0.22)', borderRadius: '3px', padding: '0.5rem', width: '340px' }}>
            <EmojiPicker value={formData.emoji} onChange={e => setFormData({ ...formData, emoji: e })} />
        </div>
        </details>
        <input
        style={INPUT_STYLE}
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        placeholder={t('FORM_MINISTER_NAME_PH', lang)}
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
        placeholder={t('FORM_MINISTER_ESS_PH', lang)}
        />
        <textarea
        style={{ ...INPUT_STYLE, minHeight: '26px', resize: 'vertical', lineHeight: 1.5, fontFamily: FONT, marginBottom: '0.28rem' }}
        value={formData.comm}
        onChange={e => setFormData({ ...formData, comm: e.target.value })}
        placeholder={t('FORM_MINISTER_COMM_PH', lang)}
        />
        <div style={{ fontSize: '0.42rem', color: 'rgba(90,110,150,0.45)', marginBottom: '0.12rem' }}>
        {t('FORM_MINISTER_ANNOT', lang)}
        <span style={{ fontWeight: 'normal', color: 'rgba(90,110,150,0.35)' }}>
        {t('FORM_MINISTER_ANNOT_DESC', lang)}
        </span>
        </div>
        <textarea
        style={{ ...INPUT_STYLE, minHeight: '26px', resize: 'vertical', lineHeight: 1.5, fontFamily: FONT, marginBottom: '0.38rem' }}
        value={formData.annotation}
        onChange={e => setFormData({ ...formData, annotation: e.target.value })}
        placeholder={t('FORM_MINISTER_ANNOT_PH', lang)}
        />
        <div style={{ display: 'flex', gap: '0.38rem', justifyContent: 'flex-end' }}>
        <button style={BTN_SECONDARY} onClick={onCancel}>{t('TAB_PRES_CANCEL', lang)}</button>
        <button
        style={{ ...BTN_PRIMARY, opacity: formData.name && formData.id ? 1 : 0.35 }}
        disabled={!formData.name || !formData.id}
        onClick={onSubmit}
        >
        {t('TAB_PRES_CREATE', lang)}
        </button>
        </div>
        </section>
    );
}
