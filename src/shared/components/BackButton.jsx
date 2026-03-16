import { useLocale, t } from '../../ariaI18n';
import { BTN_SECONDARY } from '../../shared/theme';

export default function BackButton({ onClick }) {
  const { lang } = useLocale();
  return (
    <button style={BTN_SECONDARY} onClick={onClick}>
      {t('BACK', lang)}
    </button>
  );
}
