// src/features/init/components/api/ModelSelector.jsx

import { BTN_SECONDARY } from '../../../../shared/theme';

export default function ModelSelector({ versions, selectedModel, onSelect, disabled = false }) {
    return (
        <div style={{ display: 'flex', gap: '0.22rem', flexWrap: 'wrap' }}>
        {versions.map(v => {
            const chosen = selectedModel === v.id;
            return (
                <button
                key={v.id}
                disabled={disabled}
                style={{
                    ...BTN_SECONDARY,
                    padding: '0.15rem 0.40rem',
                    fontSize: '0.38rem',
                    ...(chosen ? {
                        border: '1px solid rgba(200,164,74,0.45)',
                        color: 'rgba(200,164,74,0.88)',
                        background: 'rgba(200,164,74,0.08)'
                    } : { opacity: disabled ? 0.25 : 0.50 })
                }}
                onClick={() => onSelect(v.id)}
                >
                {v.label}
                </button>
            );
        })}
        </div>
    );
}
