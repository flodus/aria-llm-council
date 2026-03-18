import useCountryPanel from '../../hooks/useCountryPanel';
import CountryPanelHeader from './CountryPanelHeader';
import CountryPanelTabs from './CountryPanelTabs';
import CountryPanelMap from './CountryPanelMap';
import CountryPanelCouncil from './CountryPanelCouncil';
import CountryPanelTimeline from './CountryPanelTimeline';
import CountryPanelEmpty from './CountryPanelEmpty';

export default function CountryPanel({
  country,
  isCrisis,
  activeTab,
  onClose,
  onSecession,
  onNextCycle,
  onCrisisToggle,
  onGoToCouncil,
  onGoToMap,
  onGoToTimeline,
  onConstitution,
  onSubmitQuestion,
  onAddFictionalCountry,
  countryIndex,
  countryTotal,
  onPrevCountry,
  onNextCountry
}) {
  const {
    lang,
    openMinistry, setOpenMinistry,
    customQ, setCustomQ,
    freeQ, setFreeQ,
    submitting,
    handleSubmit
  } = useCountryPanel({ onSubmitQuestion });

  if (!country) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CountryPanelHeader
        country={country}
        onClose={onClose}
        countryIndex={countryIndex}
        countryTotal={countryTotal}
        onPrevCountry={onPrevCountry}
        onNextCountry={onNextCountry}
      />

      <CountryPanelTabs
        activeTab={activeTab}
        onGoToMap={onGoToMap}
        onGoToCouncil={onGoToCouncil}
        onGoToTimeline={onGoToTimeline}
      />

      {activeTab === 'map' && (
        <CountryPanelMap
          country={country}
          lang={lang}
          isCrisis={isCrisis}
          onGoToCouncil={onGoToCouncil}
          onConstitution={onConstitution}
          onSecession={onSecession}
          onNextCycle={onNextCycle}
          onCrisisToggle={onCrisisToggle}
        />
      )}

      {activeTab === 'council' && (
        <CountryPanelCouncil
          country={country}
          lang={lang}
          openMinistry={openMinistry}
          setOpenMinistry={setOpenMinistry}
          customQ={customQ}
          setCustomQ={setCustomQ}
          freeQ={freeQ}
          setFreeQ={setFreeQ}
          submitting={submitting}
          handleSubmit={handleSubmit}
          onNextCycle={onNextCycle}
          onConstitution={onConstitution}
          onSecession={onSecession}
        />
      )}

      {activeTab === 'timeline' && (
        <CountryPanelTimeline
          country={country}
          lang={lang}
        />
      )}
    </div>
  );
}
