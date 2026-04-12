// src/features/settings/components/SectionInterface.jsx
// SECTION INTERFACE — Préférences visuelles (curseurs, lecteur radio)

import { useState } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { getOptions, saveOptions } from '../../../shared/config/options';
import { SectionTitle, Field, Toggle } from '../ui/SettingsUI';

export default function SectionInterface() {
    const { lang } = useLocale();
    const isEn = lang === 'en';
    const [opts, setOpts] = useState(() => getOptions());
    const [saved, setSaved] = useState(false);

    const update = (key, val) => {
        setOpts(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            if (!next.interface) next.interface = {};
            next.interface[key] = val;
            return next;
        });
        setSaved(false);
    };

    const save = () => { saveOptions(opts); setSaved(true); };

    const curseurs = opts.interface?.custom_cursors !== false;
    const radio    = opts.interface?.radio_visible  !== false;

    return (
        <div className="settings-section-body">
        <SectionTitle icon="🎨" label="INTERFACE" sub={t('IFACE_SUB', lang)} />

        <div className="settings-group">
        <div className="settings-group-title">{t('IFACE_VISUAL_HDR', lang)}</div>
        <Field label={t('IFACE_CURSORS', lang)}>
        <Toggle value={curseurs} onChange={v => update('custom_cursors', v)}
        label={curseurs ? t('IFACE_ENABLED', lang) : t('IFACE_DISABLED', lang)} />
        </Field>
        </div>

        <div className="settings-group">
        <div className="settings-group-title">AUDIO</div>
        <Field label={t('IFACE_RADIO', lang)}>
        <Toggle value={radio} onChange={v => update('radio_visible', v)}
        label={radio ? 'Visible' : t('SYS_HIDDEN', lang)} />
        </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button className="settings-save-btn" onClick={save}>
        {saved ? t('SETTINGS_SAVED', lang) : t('SETTINGS_SAVE', lang)}
        </button>
        </div>

        <div style={{
            marginTop: '1rem', padding: '0.6rem 0.8rem',
            background: 'rgba(198,162,76,0.05)', border: '1px solid rgba(198,162,76,0.15)',
            borderRadius: 4, fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic',
        }}>
        {t('IFACE_CHANGES_EFFECT', lang)}
    </div>
    </div>
    );
}
