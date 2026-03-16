import { useLocale } from '../../ariaI18n';
import { labelStyle } from '../../shared/theme';

export default function HeaderTitle({ text, worldName }) {
  const { lang } = useLocale();
  return (
    <div style={{ ...labelStyle(), alignSelf:'flex-start' }}>
      {text} — {worldName}
    </div>
  );
}
