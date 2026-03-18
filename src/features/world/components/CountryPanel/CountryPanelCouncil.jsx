// src/features/world/components/CountryPanel/components/council/CouncilView.jsx

import { getMinistriesList } from '../../../../llmCouncilEngine';
import { FONT } from '../../../../shared/theme';
import MinistryList from './council/CouncilMinistryList';
import FreeQuestion from './council/CouncilFreeQuestion';
import CouncilFooter from './council/CouncilFooter';

export default function CouncilView({
    country,
    lang,
    openMinistry,
    setOpenMinistry,
    customQ,
    setCustomQ,
    freeQ,
    setFreeQ,
    submitting,
    handleSubmit,
    onNextCycle,
    onConstitution,
    onSecession
}) {
    const isEn = lang === 'en';
    const ministries = getMinistriesList();

    return (
        <>
        <div className="side-panel-scroll">
        <div style={{ padding: '0.6rem 0.8rem' }}>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.40rem',
            letterSpacing: '0.16em',
            color: 'rgba(200,164,74,0.45)',
            marginBottom: '0.55rem'
        }}>
        {isEn ? 'MINISTRIES' : 'MINISTÈRES'}
        </div>

        <MinistryList
        ministries={ministries}
        openMinistry={openMinistry}
        setOpenMinistry={setOpenMinistry}
        customQ={customQ}
        setCustomQ={setCustomQ}
        submitting={submitting}
        handleSubmit={handleSubmit}
        lang={lang}
        />

        <div style={{ height: '1px', background: 'rgba(90,110,160,0.10)', margin: '0.7rem 0' }} />

        <FreeQuestion
        freeQ={freeQ}
        setFreeQ={setFreeQ}
        submitting={submitting}
        handleSubmit={handleSubmit}
        lang={lang}
        />
        </div>
        </div>

        <CouncilFooter
        isEn={isEn}
        onNextCycle={onNextCycle}
        onConstitution={onConstitution}
        onSecession={onSecession}
        />
        </>
    );
}
