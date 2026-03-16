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
        type="password"
        value={entry.key}
        onChange={e => onUpdate(entry._id, 'key', e.target.value)}
        placeholder="Clé API…"
        />

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

        {isMulti && (
            <button
            style={{ ...BTN_SECONDARY, padding: '0.18rem 0.35rem', fontSize: '0.80rem', lineHeight: 1, flexShrink: 0 }}
            onClick={() => onRemove(entry._id)}
            title={lang === 'en' ? 'Delete key' : 'Supprimer'}
            >
            🗑
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
