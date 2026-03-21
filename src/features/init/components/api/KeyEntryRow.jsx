// src/features/init/components/api/KeyEntryRow.jsx

import { useState } from 'react';
import { INPUT_STYLE, BTN_SECONDARY } from '../../../../shared/theme';
import { useLocale } from '../../../../ariaI18n';
import ModelSelector from './ModelSelector';

export default function KeyEntryRow({
    entry,
    providerId,
    providerVersions,
    isMulti,
    status,
    onUpdate,
    onTest,
    onRemove,
    onSetDefault
}) {
    const { lang } = useLocale();
    const [showKey, setShowKey] = useState(false);

    const statusIcon = {
        ok: '✅',
        error: '❌',
        testing: '⏳ …',
        debug: '🐛'
    }[status] || '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        {isMulti && (
            <button
            onClick={() => onSetDefault(entry._id)}
            title={lang === 'en' ? 'Set as default' : 'Clé par défaut'}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                padding: '0 0.15rem',
                lineHeight: 1,
                opacity: entry.default ? 1 : 0.40,
                flexShrink: 0
            }}
            >
            {entry.default ? '⭐' : '☆'}
            </button>
        )}

        <input
        style={{ ...INPUT_STYLE, fontSize: '0.44rem', flex: 1 }}
        type={showKey ? 'text' : 'password'}
        value={entry.key}
        onChange={e => onUpdate(entry._id, 'key', e.target.value)}
        placeholder="Clé API…"
        />

        <button
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.15rem', color: 'rgba(140,160,200,0.55)', flexShrink: 0, fontSize: '1rem', lineHeight: 1 }}
        onClick={() => setShowKey(v => !v)}
        title={showKey ? (lang === 'en' ? 'Hide' : 'Masquer') : (lang === 'en' ? 'Show' : 'Afficher')}
        tabIndex={-1}
        >
        <span className={showKey ? 'mdi mdi-eye-lock-open' : 'mdi mdi-eye-lock'} />
        </button>

        <button
        style={{ ...BTN_SECONDARY, padding: '0.28rem 0.50rem', fontSize: '0.42rem', whiteSpace: 'nowrap' }}
        disabled={!entry.key?.trim()}
        onClick={() => onTest(entry._id, entry.key, entry.model)}
        >
        Test
        </button>

        {status && (
            <span style={{ fontSize: '0.75rem', minWidth: '1rem', flexShrink: 0 }}>
            {statusIcon}
            </span>
        )}

        {entry.key?.trim() && (
            <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.15rem', color: 'rgba(200,80,80,0.55)', flexShrink: 0, fontSize: '1rem', lineHeight: 1 }}
            onClick={() => isMulti ? onRemove(entry._id) : onUpdate(entry._id, 'key', '')}
            title={lang === 'en' ? 'Delete key' : 'Supprimer'}
            >
            <span className="mdi mdi-delete" />
            </button>
        )}
        </div>

        <div style={{ paddingLeft: isMulti ? '1.6rem' : 0 }}>
        <ModelSelector
        versions={providerVersions}
        selectedModel={entry.model}
        onSelect={(modelId) => onUpdate(entry._id, 'model', modelId)}
        disabled={!entry.key?.trim()}
        />
        </div>
        </div>
    );
}
