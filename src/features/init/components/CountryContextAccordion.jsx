import { useLocale, t } from '../../../ariaI18n';
import { BTN_SECONDARY } from '../../../shared/theme';
import ContextPanel from './ContextPanel';

export default function CountryContextAccordion({
    pendingDefs,
    plCtxOpen,
    setPlCtxOpen,
    plCtxModes,
    setPlCtxModes,
    plCtxOvrs,
    setPlCtxOvrs
}) {
    const { lang } = useLocale();

    if (!pendingDefs || pendingDefs.length === 0) return null;

    return (
        <div className={`aria-accordion${plCtxOpen != null ? ' open' : ''}`}>
        {/* Header groupe */}
        <button
        className="aria-accordion__hdr"
        onClick={() => setPlCtxOpen(p => p != null ? null : 0)}
        >
        <span className="aria-accordion__arrow">{plCtxOpen != null ? '▾' : '▸'}</span>
        <span className="aria-accordion__label">{t('CONTEXT', lang)}</span>
        <span className="aria-accordion__badge">
        {pendingDefs.length} {lang === 'en' ? 'countries' : 'pays'}
        </span>
        </button>

        {/* Onglets pays + contenu */}
        {plCtxOpen != null && (
            <div style={{ padding: '0 0.65rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {pendingDefs.length > 1 && (
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {pendingDefs.map((def, i) => (
                    <button
                    key={i}
                    style={{
                        ...BTN_SECONDARY,
                        fontSize: '0.40rem',
                        padding: '0.16rem 0.45rem',
                        ...(plCtxOpen === i ? {
                            border: '1px solid rgba(200,164,74,0.40)',
                            color: 'rgba(200,164,74,0.85)',
                            background: 'rgba(200,164,74,0.08)'
                        } : {})
                    }}
                    onClick={() => setPlCtxOpen(i)}
                    >
                    {def.realData?.flag || def.realData?.emoji || '🌐'} {def.nom || def.realData?.nom || `Nation ${i + 1}`}
                    </button>
                ))}
                </div>
            )}

            {pendingDefs.map((def, i) => plCtxOpen === i && (
                <ContextPanel
                key={i}
                countryName={def.nom || def.realData?.nom || `Nation ${i + 1}`}
                open={true}
                onToggle={() => { }}
                mode={plCtxModes[i] || ''}
                setMode={v => setPlCtxModes(p => {
                    const a = [...p];
                    a[i] = v;
                    return a;
                })}
                override={plCtxOvrs[i] || ''}
                setOverride={v => setPlCtxOvrs(p => {
                    const a = [...p];
                    a[i] = v;
                    return a;
                })}
                embedded={true}
                />
            ))}
            </div>
        )}
        </div>
    );
}
