// src/features/settings/components/SectionInterface.jsx
// SECTION INTERFACE — Préférences visuelles (curseurs, lecteur radio)

import { useState } from 'react';
import { useLocale } from '../../../ariaI18n';
import { getOptions, saveOptions } from '../../../Dashboard_p1';
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
        <SectionTitle icon="🎨" label="INTERFACE" sub={isEn?"Visual preferences — cursors, radio player":"Préférences visuelles — curseurs, lecteur radio"} />

        <div className="settings-group">
        <div className="settings-group-title">{isEn?"VISUAL":"VISUEL"}</div>
        <Field label={isEn?"Custom cursors (gold SVG)":"Curseurs personnalisés (or SVG)"}>
        <Toggle value={curseurs} onChange={v => update('custom_cursors', v)}
        label={curseurs ? (isEn?'Enabled':'Activés') : (isEn?'Disabled':'Désactivés')} />
        </Field>
        </div>

        <div className="settings-group">
        <div className="settings-group-title">{isEn?"AUDIO":"AUDIO"}</div>
        <Field label={isEn?"Show radio player in topbar":"Afficher le lecteur radio dans la topbar"}>
        <Toggle value={radio} onChange={v => update('radio_visible', v)}
        label={radio ? (isEn?'Visible':'Visible') : (isEn?'Hidden':'Masqué')} />
        </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button className="settings-save-btn" onClick={save}>
        {saved ? (isEn?'✓ Saved':'✓ Sauvegardé') : (isEn?'Save':'Sauvegarder')}
        </button>
        </div>

        <div style={{
            marginTop: '1rem', padding: '0.6rem 0.8rem',
            background: 'rgba(198,162,76,0.05)', border: '1px solid rgba(198,162,76,0.15)',
            borderRadius: 4, fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic',
        }}>
        {isEn
            ? 'Changes take effect after closing Settings.'
    : 'Les modifications prennent effet à la fermeture de Settings.'}
    </div>
    </div>
    );
}
