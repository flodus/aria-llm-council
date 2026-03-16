import { useLocale, t } from '../../../ariaI18n';
import { FONT, BTN_SECONDARY, BTN_PRIMARY } from '../../../shared/theme';
import RecapAccordion from './RecapAccordion';

export default function ConfirmLaunchDialog({
    confirmLaunch,
    setConfirmLaunch,
    pendingDefs,
    perGov,
    commonAgents,
    commonMins,
    commonPres,
    commonMinsters,
    lang,
    plCtxModes,
    plCtxOvrs,
    saveAndLaunch
}) {
    const { lang: contextLang } = useLocale();
    const activeLang = lang || contextLang;

    if (!confirmLaunch) return null;

    return (
        <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(4,8,18,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
        onClick={() => setConfirmLaunch(false)}
        >
        <div
        style={{ background: 'rgba(8,14,26,0.98)', border: '1px solid rgba(200,164,74,0.30)', borderRadius: '4px', maxWidth: 480, width: '92%', display: 'flex', flexDirection: 'column', gap: '1.1rem', padding: '1.8rem', boxShadow: '0 8px 40px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
        >
        <div style={{ fontFamily: FONT.mono, fontSize: '0.58rem', letterSpacing: '0.18em', color: 'rgba(200,164,74,0.90)' }}>
        ⚖ {activeLang === 'en' ? 'WORLD SUMMARY' : 'RÉCAPITULATIF DU MONDE'}
        </div>

        <RecapAccordion
        pendingDefs={pendingDefs}
        perGov={perGov}
        commonAgents={commonAgents}
        commonMins={commonMins}
        commonPres={commonPres}
        commonMinsters={commonMinsters}
        lang={activeLang}
        ctxModes={plCtxModes}
        ctxOvrs={plCtxOvrs}
        />

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
        <button style={{ ...BTN_SECONDARY, fontSize: '0.46rem' }} onClick={() => setConfirmLaunch(false)}>
        {activeLang === 'en' ? '← Edit' : '← Modifier'}
        </button>
        <button style={{ ...BTN_PRIMARY, fontSize: '0.46rem' }} onClick={() => { setConfirmLaunch(false); saveAndLaunch(); }}>
        {activeLang === 'en' ? 'GENERATE WORLD →' : 'GÉNÉRER LE MONDE →'}
        </button>
        </div>
        </div>
        </div>
    );
}
