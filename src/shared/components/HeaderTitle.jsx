// src/shared/components/HeaderTitle.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  HeaderTitle.jsx — Titre de section au format "LABEL — NomDuMonde"
//
//  Dépendances : ariaI18n (useLocale), shared/theme (labelStyle)
// ═══════════════════════════════════════════════════════════════════════════

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
