import { useState } from 'react';
import { useLocale } from '../../../../ariaI18n';
import FlowTypeChoice from './FlowTypeChoice';
import FlowRealCountry from './FlowRealCountry';
import FlowFictionalCountry from './FlowFictionalCountry';

export default function DefaultAIFlow({ worldName, onBack, onPreLaunch }) {
    const { lang } = useLocale();
    const [step, setStep] = useState('type'); // 'type' | 'reel' | 'fictif'

    const handleTypeSelect = (type) => {
        setStep(type);
    };

    const handleCountryConfirm = (countryData) => {
        onPreLaunch('defaut_ai', [countryData]);
    };

    if (step === 'type') {
        return (
            <FlowTypeChoice
            worldName={worldName}
            onSelect={handleTypeSelect}
            onBack={onBack}
            />
        );
    }

    if (step === 'reel') {
        return (
            <FlowRealCountry
            worldName={worldName}
            onConfirm={handleCountryConfirm}
            onBack={() => setStep('type')}
            />
        );
    }

    if (step === 'fictif') {
        return (
            <FlowFictionalCountry
            worldName={worldName}
            onConfirm={handleCountryConfirm}
            onBack={() => setStep('type')}
            />
        );
    }

    return null;
}
