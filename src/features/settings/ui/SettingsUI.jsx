// src/features/settings/ui/SettingsUI.jsx
// Composants UI réutilisables pour les pages de paramètres

import { useState, useEffect, useRef } from 'react';
import { useLocale } from '../../../ariaI18n';

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION TITLE
// ─────────────────────────────────────────────────────────────────────────────

export function SectionTitle({ icon, label, sub }) {
    return (
        <div className="settings-section-title">
        <span className="settings-section-icon">{icon}</span>
        <div>
        <div className="settings-section-name">{label}</div>
        {sub && <div className="settings-section-sub">{sub}</div>}
        </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  FIELD
// ─────────────────────────────────────────────────────────────────────────────

export function Field({ label, hint, children }) {
    return (
        <div className="settings-field">
        <label className="settings-field-label">{label}</label>
        {hint && <div className="settings-field-hint">{hint}</div>}
        {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEXT INPUT
// ─────────────────────────────────────────────────────────────────────────────

export function TextInput({ value, onChange, password, placeholder, mono }) {
    const [show, setShow] = useState(false);
    if (!password) return (
        <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ''}
        className={`settings-input${mono ? ' mono' : ''}`}
        />
    );
    return (
        <div style={{ position:'relative', flex:1, display:'flex' }}>
        <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ''}
        className={`settings-input${mono ? ' mono' : ''}`}
        style={{ flex:1, paddingRight:'2rem' }}
        />
        <button onClick={() => setShow(p => !p)}
        style={{ position:'absolute', right:'0.4rem', top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', padding:'0.1rem', lineHeight:1,
            color: show ? 'rgba(200,164,74,0.70)' : 'rgba(140,160,200,0.35)', fontSize:'0.9rem' }}>
            <span className={show ? 'mdi mdi-eye-lock-open' : 'mdi mdi-eye-lock'} />
            </button>
            </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEXT AREA
// ─────────────────────────────────────────────────────────────────────────────

export function TextArea({ value, onChange, rows = 1, mono }) {
    const ref = useRef(null);
    const resize = (el) => { if (!el) return; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
    useEffect(() => { resize(ref.current); }, []);
    useEffect(() => { resize(ref.current); }, [value]);
    return (
        <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        onInput={e => resize(e.target)}
        rows={rows}
        className={`settings-textarea${mono ? ' mono' : ''}`}
        style={{ overflow:'hidden', resize:'none' }}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

export function Toggle({ value, onChange, label }) {
    return (
        <button
        className={`settings-toggle${value ? ' active' : ''}`}
        onClick={() => onChange(!value)}
        >
        <span className="settings-toggle-track">
        <span className="settings-toggle-thumb" />
        </span>
        {label && <span className="settings-toggle-label">{label}</span>}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SELECT
// ─────────────────────────────────────────────────────────────────────────────

export function Select({ value, onChange, options }) {
    return (
        <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="settings-select"
        >
        {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        </select>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  NUMBER INPUT
// ─────────────────────────────────────────────────────────────────────────────

export function NumberInput({ value, onChange, min, max, step = 1, style }) {
    return (
        <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min} max={max} step={step}
        className="settings-input-number"
        style={style}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SAVE BADGE
// ─────────────────────────────────────────────────────────────────────────────

export function SaveBadge({ saved }) {
    const { lang: badgeLang } = useLocale();
    if (!saved) return null;
    const { t } = require('../../../ariaI18n');
    return <span className="settings-save-badge">{t('SETTINGS_SAVED', badgeLang)}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DANGER BUTTON
// ─────────────────────────────────────────────────────────────────────────────

export function DangerButton({ label, onClick, confirm: confirmMsg }) {
    const [armed, setArmed] = useState(false);
    const handleClick = () => {
        if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; }
        onClick();
        setArmed(false);
    };
    return (
        <button
        className={`settings-danger-btn${armed ? ' armed' : ''}`}
        onClick={handleClick}
        >
        {armed ? (confirmMsg || 'Confirmer ?') : label}
        </button>
    );
}
