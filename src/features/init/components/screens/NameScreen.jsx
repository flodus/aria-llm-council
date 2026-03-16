import { useLocale, t } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_PRIMARY, labelStyle, wrap } from '../../../../shared/theme';
import ARIAHeader from '../ARIAHeader';
import APIKeyInline from '../APIKeyInline';

export default function NameScreen({
    worldName,
    setWorldName,
    lang,
    setLang,
    hasApiKeys,
    showKeys,
    setShowKeys,
    onRefreshKeys,
    onContinue
}) {
    return (
        <div style={{ ...wrap(false), position:'relative' }}>
        {/* Lang switcher */}
        <div style={{ position:'absolute', top:'0.8rem', right:'0.8rem', display:'flex', gap:'0.3rem', zIndex:10 }}>
        {['fr','en'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
                background: lang===l ? 'rgba(200,164,74,0.15)' : 'transparent',
                               border:`1px solid ${lang===l ? 'rgba(200,164,74,0.45)' : 'rgba(255,255,255,0.10)'}`,
                               borderRadius:'2px', padding:'0.22rem 0.55rem',
                               color: lang===l ? 'rgba(200,164,74,0.90)' : 'rgba(150,170,205,0.35)',
                               fontFamily:"'JetBrains Mono',monospace", fontSize:'0.44rem',
                               letterSpacing:'0.10em', cursor:'pointer', transition:'all 0.15s',
                               display:'flex', alignItems:'center', gap:'0.25rem',
            }}>
            <span style={{fontSize:'0.85rem',lineHeight:1}}>{l==='fr'?'🇫🇷':'🇬🇧'}</span>
            <span>{l.toUpperCase()}</span>
            </button>
        ))}
        </div>

        {showKeys && <APIKeyInline onClose={() => { setShowKeys(false); onRefreshKeys?.(); }} />}

        <ARIAHeader showQuote={true} />

        <div style={{ ...CARD_STYLE, display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        <div style={labelStyle()}>{t('WORLD_NAME', lang)}</div>
        <input
        style={INPUT_STYLE}
        value={worldName}
        onChange={e => setWorldName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && worldName.trim() && onContinue()}
        placeholder={t("WORLD_NAME_PH", lang)}
        autoFocus
        />
        <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
        <button
        style={{
            background:'rgba(200,164,74,0.06)', border:'1px solid rgba(200,164,74,0.30)',
            borderRadius:'2px', padding:'0.35rem 0.75rem', cursor:'pointer',
            fontFamily:FONT.mono, fontSize:'0.46rem', letterSpacing:'0.12em',
            color: hasApiKeys ? 'rgba(100,200,120,0.70)' : 'rgba(200,164,74,0.55)',
            whiteSpace:'nowrap', flexShrink:0,
        }}
        onClick={() => setShowKeys(true)}
        title={lang==='en' ? 'Configure API keys' : 'Configurer les clés API'}>
        {hasApiKeys
            ? `${lang==='en' ? '🔑 API KEYS' : '🔑 CLÉS API'} ✓`
            : (lang==='en' ? '🔑 API KEYS' : '🔑 CLÉS API')}
            </button>
            <span style={{
                fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(200,100,74,0.55)',
            flex:1, textAlign:'center', lineHeight:1.6,
            visibility: hasApiKeys ? 'hidden' : 'visible'
            }}>
            {lang==='en'
                ? <>⚠ No key<br/>offline mode only</>
                : <>⚠ Pas de clé<br/>mode hors ligne uniquement</>}
                </span>
                <button
                style={{
                    ...BTN_PRIMARY,
                    opacity: worldName.trim() ? 1 : 0.35,
            flexShrink:0,
            minWidth:'8rem',
            textAlign:'center'
                }}
                disabled={!worldName.trim()}
                onClick={onContinue}>
                {t('CONTINUE', lang)}
                </button>
                </div>
                </div>
                </div>
    );
}
