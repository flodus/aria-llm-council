import { useLocale, t } from '../../../../ariaI18n';
import { wrap } from '../../../../shared/theme';
import {
    BackButton,
    HeaderTitle,
    Card,
    TitleCard,
    SubtitleCard
} from '../../../../shared/components';
import ARIAHeader from '../ARIAHeader';

export default function PresetChoiceScreen({ mode, onSelectPreset, onBack }) {
    const { lang } = useLocale();

    return (
        <div style={wrap(false)}>
        <ARIAHeader showQuote={false} />
        <HeaderTitle text={t('CONFIG', lang)} />
        <div style={{ display:'flex', gap:'0.8rem', width:'100%' }}>
        <Card onClick={() => onSelectPreset('defaut')}>
        <div style={{ fontSize:'1.3rem' }}>⚡</div>
        <TitleCard text={t('PRESET_DEFAULT', lang)} />
        <SubtitleCard text={mode === 'local'
            ? t('PRESET_DEFAULT_LOCAL', lang)
            : t('PRESET_DEFAULT_AI', lang)}
            />
            </Card>
            <Card onClick={() => onSelectPreset('custom')}>
            <div style={{ fontSize:'1.3rem' }}>🛠</div>
            <TitleCard text={t('PRESET_CUSTOM', lang)} />
            <SubtitleCard text={t('PRESET_CUSTOM_DESC', lang)} />
            </Card>
            </div>
            <BackButton onClick={onBack} />
            </div>
    );
}
