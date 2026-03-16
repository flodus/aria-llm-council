import { useState } from 'react';
import { useLocale } from '../../../../ariaI18n';
import ProviderHeader from './ProviderHeader';
import KeyEntryRow from './KeyEntryRow';
import AddKeyButton from './AddKeyButton';

export default function ProviderAccordion({
    provider,
    keys,
    keyStatus,
    onUpdateEntry,
    onTestEntry,
    onRemoveEntry,
    onSetDefault,
    onAddKey
}) {
    const { lang } = useLocale();
    const [isOpen, setIsOpen] = useState(() => {
        // Ouvre automatiquement si pas de clé configurée
        const hasKey = keys.some(k => k.key?.trim());
        return !hasKey;
    });

    const hasAnyKey = keys.some(k => k.key?.trim());
    const providerOk = keys.some(k => keyStatus[k._id] === 'ok');
    const providerDbg = !providerOk && keys.some(k => keyStatus[k._id] === 'debug');
    const providerErr = !providerOk && !providerDbg && hasAnyKey &&
    keys.filter(k => k.key?.trim()).every(k => keyStatus[k._id] === 'error');

    const providerStatus = providerOk ? 'ok' : providerDbg ? 'debug' : providerErr ? 'error' : null;

    return (
        <div style={{
            border: `1px solid ${hasAnyKey ? 'rgba(200,164,74,0.14)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '2px',
            overflow: 'hidden',
            background: hasAnyKey ? 'rgba(200,164,74,0.02)' : 'rgba(255,255,255,0.01)'
        }}>
        <ProviderHeader
        provider={provider}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        hasKey={hasAnyKey}
        status={providerStatus}
        />

        {isOpen && (
            <div style={{
                padding: '0.5rem 0.65rem 0.6rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                borderTop: `1px solid ${hasAnyKey ? 'rgba(200,164,74,0.10)' : 'rgba(255,255,255,0.05)'}`
            }}>
            {keys.map((entry, idx) => (
                <div key={entry._id}>
                <KeyEntryRow
                entry={entry}
                providerId={provider.id}
                providerVersions={provider.versions}
                isMulti={keys.length > 1}
                status={keyStatus[entry._id]}
                onUpdate={(id, field, value) => onUpdateEntry(provider.id, id, field, value)}
                onTest={(id, key, model) => onTestEntry(provider.id, id, key, model)}
                onRemove={(id) => onRemoveEntry(provider.id, id)}
                onSetDefault={(id) => onSetDefault(provider.id, id)}
                />
                {idx < keys.length - 1 && (
                    <div style={{ marginTop: '0.45rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                )}
                </div>
            ))}

            <AddKeyButton onClick={() => onAddKey(provider.id)} />
            </div>
        )}
        </div>
    );
}
