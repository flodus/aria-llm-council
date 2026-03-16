import { useState } from 'react';
import { useLocale, t } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';
import CountryConfig from '../CountryConfig';
import ARIAHeader from '../ARIAHeader';

const DEFAULT_COUNTRY = () => ({
    key: Math.random().toString(36).slice(2),
                               type: 'imaginaire', nom: '', regime: 'democratie_liberale',
                               terrain: 'coastal', realData: null,
});

export default function CustomFlow({ worldName, mode, onBack, onPreLaunch }) {
    const { lang } = useLocale();
    const [countries, setCountries] = useState([DEFAULT_COUNTRY()]);

    const handlePreLaunch = () => {
        const filled = countries.map((c, i) => ({
            ...c,
            nom: c.nom.trim() || c.realData?.nom || `Nation ${i+1}`
        }));
        setCountries(filled);
        onPreLaunch('custom', filled);
    };

    const unvalidated = countries.filter(c =>
    c.type === 'reel' && mode === 'ai' && !c.realData?.id && !c.nom.trim()
    );
    const hasNotFound = countries.some(c =>
    c.type === 'reel' && mode === 'ai' && !c.realData?.id &&
    (c._rcStatus === 'notfound' || c._rcStatus === 'suggestion')
    );
    const canGen = unvalidated.length === 0 && !hasNotFound;

    return (
        <div style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            gap:'1.8rem', width:'100%', maxWidth: 700, padding:'2rem',
            overflowY:'auto', maxHeight:'calc(100vh - 2rem)', boxSizing:'border-box'
        }}>
        <ARIAHeader showQuote={false} />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%' }}>
        <div style={labelStyle()}>NATIONS — {countries.length}/6</div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
        {countries.length < 6 && (
            <button
            style={{ ...BTN_SECONDARY, padding:'0.3rem 0.7rem', fontSize:'0.48rem' }}
            onClick={() => setCountries(p => [...p, DEFAULT_COUNTRY()])}
            >
            + AJOUTER
            </button>
        )}
        <button style={BTN_SECONDARY} onClick={onBack}>
        {t('BACK', lang)}
        </button>
        </div>
        </div>

        <div style={{
            width:'100%', display:'flex', flexDirection:'column', gap:'0.6rem',
            maxHeight:'52vh', overflowY:'auto'
        }}>
        {countries.map((c, idx) => (
            <CountryConfig
            key={c.key}
            c={c}
            idx={idx}
            mode={mode}
            onChange={updated => setCountries(p =>
                p.map(x => x.key === c.key ? updated : x)
            )}
            onRemove={() => setCountries(p =>
                p.filter(x => x.key !== c.key)
            )}
            canRemove={countries.length > 1}
            />
        ))}
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', width:'100%' }}>
        <button
        style={{
            ...BTN_PRIMARY,
            opacity: canGen ? 1 : 0.40,
            cursor: canGen ? 'pointer' : 'not-allowed'
        }}
        disabled={!canGen}
        title={canGen ? '' : lang==='en'? `Check: ${unvalidated.map(c=>c.nom||'?').join(', ')}` : `Vérifiez : ${unvalidated.map(c=>c.nom||'?').join(', ')}`}
        onClick={handlePreLaunch}
        >
        {canGen
            ? (lang==='en' ? 'CONFIGURE GOVERNMENT →' : 'CONFIGURER LE GOUVERNEMENT →')
            : hasNotFound
            ? 'PAYS INTROUVABLES — CORRIGEZ'
    : `COMPLÉTER LES PAYS (${unvalidated.length})`
        }
        </button>
        </div>
        </div>
    );
}
