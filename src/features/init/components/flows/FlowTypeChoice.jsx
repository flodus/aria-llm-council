// src/features/init/components/flows/FlowTypeChoice.jsx

import { useLocale, t } from '../../../../ariaI18n';
import { mCard } from '../../../../shared/theme';
import ARIAHeader from '../ARIAHeader';

export default function FlowTypeChoice({ worldName, onSelect, onBack }) {
    const { lang } = useLocale();

    const McTitle = ({ t }) => <div style={{ fontFamily: FONT.cinzel, fontSize: '0.54rem', letterSpacing: '0.14em', color: 'rgba(200,164,74,0.88)' }}>{t}</div>;
    const McSub = ({ t }) => <div style={{ fontSize: '0.47rem', color: 'rgba(140,160,200,0.55)', lineHeight: 1.55 }}>{t}</div>;
    const MC = (props) => <div style={{ ...mCard, ...props.style }} onClick={props.onClick}>{props.children}</div>;
    const H = (txt) => <div style={{ ...labelStyle(), alignSelf: 'flex-start' }}>{txt} — {worldName}</div>;
    const BtnRow = ({ children }) => <div style={{ display: 'flex', gap: '0.6rem', width: '100%', justifyContent: 'space-between' }}>{children}</div>;

    return (
        <div style={wrapNarrow}>
        <ARIAHeader showQuote={false} />
        {H('NATION DE DÉPART')}
        <div style={{ display: 'flex', gap: '0.8rem', width: '100%' }}>
        <MC onClick={() => onSelect('fictif')}>
        <div style={{ fontSize: '1.3rem' }}>🌐</div>
        <McTitle t={t('FICTIONAL_NATION', lang)} />
        <McSub t={lang==='en' ? "1 of 3 preset nations or 1 new one — AI enriches it." : "1 des 3 nations prédéfinies ou 1 nouvelle — l'IA l'enrichit."} />
        </MC>
        <MC onClick={() => onSelect('reel')}>
        <div style={{ fontSize: '1.3rem' }}>🗺</div>
        <McTitle t={t('REAL_COUNTRY', lang)} />
        <McSub t={lang==='en' ? "AI generates the portrait from its current situation." : "L'IA génère le portrait depuis sa situation actuelle."} />
        </MC>
        </div>
        <BtnRow>
        <button style={BTN_SECONDARY} onClick={onBack}>{t('BACK', lang)}</button>
        </BtnRow>
        </div>
    );
}
