// src/features/init/components/screens/NameScreen.jsx

import { useLocale, t } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_PRIMARY, labelStyle } from '../../../../shared/theme';
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
        <div style={{
            position:'fixed', inset:0,
            display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'space-between',
            padding:'2rem 1.5rem 14vh', boxSizing:'border-box',
        }}>
            {/* ARIAHeader en haut avec lang switcher intégré */}
            <ARIAHeader showQuote={false} lang={lang} setLang={setLang} />

            {/* Card en bas milieu */}
            <div style={{ width:'min(460px, 90vw)' }}>
                {showKeys && <APIKeyInline onClose={() => { setShowKeys(false); onRefreshKeys?.(); }} />}
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
                        flexShrink:0, minWidth:'8rem', textAlign:'center'
                    }}
                    disabled={!worldName.trim()}
                    onClick={onContinue}>
                    {t('CONTINUE', lang)}
                </button>
                </div>
                </div>
            </div>
        </div>
    );
}
