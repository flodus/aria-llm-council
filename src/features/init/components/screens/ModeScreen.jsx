import { useLocale, t } from '../../../../ariaI18n';
import { FONT, wrap, mCard, tag, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';
import ARIAHeader from '../ARIAHeader';

export default function ModeScreen({ worldName, hasApiKeys, onSelectMode, onBack }) {
    const { lang } = useLocale();

    return (
        <div style={wrap(false)}>
        <ARIAHeader showQuote={false} />
        <div style={{ width:'100%' }}>
        <div style={{ ...labelStyle(), marginBottom:'0.9rem' }}>
        {t('MODE_LABEL', lang)} — {worldName}
        </div>
        <div style={{ display:'flex', gap:'0.8rem' }}>
        {[
            { id:'local', icon:'🗺', title:t('MODE_LOCAL', lang), desc:t('MODE_LOCAL_DESC', lang) },
            { id:'ai', icon:'⚡', title:t('MODE_AI', lang), desc:t('MODE_AI_DESC', lang), disabled:!hasApiKeys },
        ].map(m => (
            <div key={m.id}
            style={{ ...mCard, opacity: m.disabled ? 0.35 : 1, cursor: m.disabled ? 'not-allowed' : 'pointer' }}
            onClick={() => {
                if (m.disabled) return;
                onSelectMode(m.id);
            }}>
            <div style={{ fontSize:'1.4rem' }}>{m.icon}</div>
            <div style={{
                fontFamily:FONT.cinzel, fontSize:'0.58rem',
                letterSpacing:'0.18em', color:'rgba(200,164,74,0.85)'
            }}>
            {m.title}
            </div>
            <div style={{ fontSize:'0.50rem', color:'rgba(140,160,200,0.55)', lineHeight:1.6 }}>
            {m.desc}
            </div>
            {m.disabled && (
                <span style={{
                    ...tag,
                    color:'rgba(200,80,80,0.55)',
                            border:'1px solid rgba(200,80,80,0.20)'
                }}>
                {t('KEY_MISSING', lang)}
                </span>
            )}
            </div>
        ))}
        </div>
        </div>
        <button style={BTN_SECONDARY} onClick={onBack}>
        {t('BACK', lang)}
        </button>
        </div>
    );
}
