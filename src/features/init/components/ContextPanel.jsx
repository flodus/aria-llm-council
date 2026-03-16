import { useLocale, t } from '../../../ariaI18n';
import { FONT, INPUT_STYLE, BTN_SECONDARY } from '../../../shared/theme';

export default function ContextPanel({ countryName, open, onToggle, mode, setMode, override, setOverride, embedded }) {
  const { lang } = useLocale();
  const GOLD = 'rgba(200,164,74,0.88)';
  const DIM  = 'rgba(140,160,200,0.46)';
  const _globalCtxMode = (() => { try { return JSON.parse(localStorage.getItem('aria_options')||'{}').gameplay?.context_mode || 'auto'; } catch { return 'auto'; } })();
  const _globalCtxLabel = ({ auto:'🤖 Auto', rich: lang==='en'?'📖 Enriched':'📖 Enrichi', stats_only: lang==='en'?'📊 Stats only':'📊 Stats seules', off: lang==='en'?'🚫 Disabled':'🚫 Désactivé' })[_globalCtxMode] || '🤖 Auto';
  return (
    <div style={{ width:'100%', borderRadius:'2px',
      ...(!embedded ? {
        border:`1px solid ${open ? 'rgba(200,164,74,0.22)' : 'rgba(255,255,255,0.07)'}`,
        background: open ? 'rgba(200,164,74,0.03)' : 'transparent',
        transition:'all 0.2s'
      } : {}) }}>
      {/* Header toggle — masqué si embedded */}
      {!embedded && (
        <button style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.5rem',
          padding:'0.42rem 0.65rem', background:'none', border:'none', cursor:'pointer',
          textAlign:'left' }}
          onClick={onToggle}>
          <span style={{ fontSize:'0.75rem' }}>{open ? '▾' : '▸'}</span>
          <span style={{ fontFamily:FONT.mono, fontSize:'0.44rem', letterSpacing:'0.12em',
            color: open ? GOLD : 'rgba(140,160,200,0.55)' }}>
            {t('CONTEXT',lang)}
          </span>
          {(mode || override) && (
            <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', marginLeft:'auto',
              color:'rgba(200,164,74,0.55)',
              background:'rgba(200,164,74,0.08)', border:'1px solid rgba(200,164,74,0.20)',
              borderRadius:'2px', padding:'0.10rem 0.35rem' }}>
              {override ? '✎ custom' : mode || 'auto'}
            </span>
          )}
        </button>
      )}

      {(open || embedded) && (
        <div style={{ padding:'0 0.65rem 0.6rem', display:'flex', flexDirection:'column', gap:'0.55rem' }}>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:DIM, lineHeight:1.5 }}>
            Contrôle ce qui est injecté dans chaque prompt de délibération pour {countryName || 'ce pays'}.
          </div>

          {/* Mode radio */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.26rem' }}>
            {[
              ['', '⚙️ '+(lang==='en'?'Inherit global':'Hérite du global'), lang==='en'?`Follows global setting (currently: ${_globalCtxLabel})`:`Suit le réglage mondial (actuellement : ${_globalCtxLabel})`],
              ['auto',       '🤖 Auto',                  'Stats + description si disponible'],
              ['rich', '📖 '+(lang==='en'?'Enriched':'Enrichi'), lang==='en'?"Full context — AI reasons from regime history and its resources.":"Contexte complet — l'IA raisonne sur l'historique du régime."],
              ['stats_only', '📊 Stats seules',          'Chiffres uniquement — neutre'],
              ['off', '🚫 '+(lang==='en'?'Disabled':'Désactivé'), lang==='en'?'No context — blind deliberation':'Aucun contexte — délibération aveugle'],
            ].map(([val, lbl, hint]) => {
              const on = mode === val;
              return (
                <label key={val} style={{ display:'flex', alignItems:'center', gap:'0.5rem',
                  cursor:'pointer', padding:'0.30rem 0.5rem', borderRadius:'2px',
                  background: on ? 'rgba(200,164,74,0.07)' : 'transparent',
                  border:`1px solid ${on ? 'rgba(200,164,74,0.25)' : 'transparent'}`,
                  width:'100%', boxSizing:'border-box' }}>
                  <input type="radio" name={`ctx_mode_${(countryName||'x').replace(/\s+/g,'_')}`} value={val} checked={on}
                    onChange={() => setMode(val)}
                    style={{ accentColor:'#C8A44A', flexShrink:0 }} />
                  <div>
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.46rem',
                      color: on ? GOLD : 'rgba(200,215,240,0.78)' }}>{lbl}</div>
                    <div style={{ fontSize:'0.40rem', color:DIM, marginTop:'0.05rem', lineHeight:1.35 }}>{hint}</div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Textarea override */}
          <div>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:DIM,
              marginBottom:'0.22rem' }}>
              {t('CUSTOM_CONTEXT',lang)}
            </div>
            <textarea
              style={{ ...INPUT_STYLE, width:'100%', minHeight:'64px', resize:'vertical',
                fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.55,
                border: override ? '1px solid rgba(200,164,74,0.30)' : undefined }}
              value={override}
              onChange={e => setOverride(e.target.value)}
              placeholder={lang==='en'
                ? `E.g. ${countryName||'This country'} is a former colony turned into an island technocracy. Its council deliberates according to the doctrine of the Grand Algorithms of 1978…`
                : `Ex : ${countryName||'Ce pays'} est une ancienne colonie reconvertie en technocratie insulaire. Son conseil délibère selon la doctrine des Grands Algorithmes de 1978…`}
            />
            {override && (
              <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.12rem 0.38rem',
                marginTop:'0.2rem', color:'rgba(200,80,80,0.50)',
                border:'1px solid rgba(200,80,80,0.20)', alignSelf:'flex-end' }}
                onClick={() => setOverride('')}>{lang==='en'?'✕ Clear':'✕ Effacer'}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
