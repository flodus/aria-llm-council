// src/features/init/components/api/ProviderAccordion.jsx

import { useState } from 'react';
import { useLocale } from '../../../../ariaI18n';
import { FONT } from '../../../../shared/theme';
import ProviderHeader from './ProviderHeader';
import KeyEntryRow from './KeyEntryRow';
import AddKeyButton from './AddKeyButton';

const inputStyle = {
    fontFamily: "'JetBrains Mono',monospace", fontSize: '0.42rem',
    background: 'rgba(8,14,26,0.70)', border: '1px solid rgba(90,110,160,0.22)',
    borderRadius: '2px', color: 'rgba(200,220,255,0.80)', padding: '0.22rem 0.45rem',
    outline: 'none', flex: 1, minWidth: 0, boxSizing: 'border-box',
};

export default function ProviderAccordion({
    provider,
    keys,
    keyStatus,
    onUpdateEntry,
    onTestEntry,
    onRemoveEntry,
    onSetDefault,
    onAddKey,
    onClear,
    customModels = [],
    onAddModel,
    onRemoveModel,
}) {
    const { lang } = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [showModelForm, setShowModelForm] = useState(false);
    const [newModel, setNewModel] = useState({ id: '', label: '' });

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
                onClear={onClear}
                onSetDefault={(id) => onSetDefault(provider.id, id)}
                />
                {idx < keys.length - 1 && (
                    <div style={{ marginTop: '0.45rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                )}
                </div>
            ))}

            <AddKeyButton onClick={() => onAddKey(provider.id)} />

            {/* ── Modèles custom ── */}
            <div style={{ borderTop: '1px solid rgba(90,110,160,0.10)', paddingTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: FONT.mono, fontSize: '0.38rem', letterSpacing: '0.10em', color: 'rgba(140,160,200,0.38)', textTransform: 'uppercase' }}>
                  {lang === 'en' ? 'Custom models' : 'Modèles custom'}
                </span>
                {!showModelForm && (
                  <button onClick={() => setShowModelForm(true)} style={{ background: 'none', border: '1px solid rgba(90,110,160,0.20)', borderRadius: '2px', cursor: 'pointer', padding: '0.10rem 0.4rem', fontFamily: FONT.mono, fontSize: '0.36rem', color: 'rgba(140,160,200,0.50)', letterSpacing: '0.06em' }}>
                    + {lang === 'en' ? 'Add' : 'Ajouter'}
                  </button>
                )}
              </div>

              {customModels.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(200,220,255,0.65)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</span>
                  <span style={{ fontFamily: FONT.mono, fontSize: '0.36rem', color: 'rgba(140,160,200,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '45%' }}>{m.id}</span>
                  <button onClick={() => onRemoveModel?.(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.15rem', color: 'rgba(200,80,80,0.50)', fontSize: '0.85rem', lineHeight: 1, flexShrink: 0 }}>✕</button>
                </div>
              ))}

              {showModelForm && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.22rem' }}>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <input style={inputStyle} value={newModel.id} onChange={e => setNewModel(m => ({ ...m, id: e.target.value }))} placeholder={lang === 'en' ? 'Model ID (e.g. claude-mythos-20260101)' : 'ID modèle (ex: claude-mythos-20260101)'} />
                    <input style={{ ...inputStyle, flex: '0 0 30%' }} value={newModel.label} onChange={e => setNewModel(m => ({ ...m, label: e.target.value }))} placeholder={lang === 'en' ? 'Label' : 'Libellé'} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setShowModelForm(false); setNewModel({ id: '', label: '' }); }} style={{ background: 'none', border: '1px solid rgba(90,110,160,0.18)', borderRadius: '2px', cursor: 'pointer', padding: '0.14rem 0.5rem', fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(140,160,200,0.45)' }}>
                      {lang === 'en' ? 'Cancel' : 'Annuler'}
                    </button>
                    <button
                      disabled={!newModel.id.trim()}
                      onClick={() => { onAddModel?.(newModel.id, newModel.label); setNewModel({ id: '', label: '' }); setShowModelForm(false); }}
                      style={{ background: 'rgba(90,110,160,0.10)', border: '1px solid rgba(90,110,160,0.28)', borderRadius: '2px', cursor: newModel.id.trim() ? 'pointer' : 'not-allowed', padding: '0.14rem 0.5rem', fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(140,160,200,0.70)', opacity: newModel.id.trim() ? 1 : 0.35 }}>
                      {lang === 'en' ? 'Add' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
        )}
        </div>
    );
}
