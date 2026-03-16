#!/bin/bash

# Créer le dossier
mkdir -p src/shared/components

# Liste des fichiers avec leur contenu
declare -A files
files=(
  ["BackButton.jsx"]='import { useLocale, t } from '"'"'../../ariaI18n'"'"';
import { BTN_SECONDARY } from '"'"'../../shared/theme'"'"';

export default function BackButton({ onClick }) {
  const { lang } = useLocale();
  return (
    <button style={BTN_SECONDARY} onClick={onClick}>
      {t('"'"'BACK'"'"', lang)}
    </button>
  );
}'

  ["HeaderTitle.jsx"]='import { useLocale } from '"'"'../../ariaI18n'"'"';
import { labelStyle } from '"'"'../../shared/theme'"'"';

export default function HeaderTitle({ text, worldName }) {
  const { lang } = useLocale();
  return (
    <div style={{ ...labelStyle(), alignSelf:'"'"'flex-start'"'"' }}>
      {text} — {worldName}
    </div>
  );
}'

  ["Card.jsx"]='import { mCard } from '"'"'../../shared/theme'"'"';

export default function Card({ onClick, style, children }) {
  return (
    <div style={{ ...mCard, ...style }} onClick={onClick}>
      {children}
    </div>
  );
}'

  ["TitleCard.jsx"]='import { FONT } from '"'"'../../shared/theme'"'"';

export default function TitleCard({ text }) {
  return (
    <div style={{
      fontFamily: FONT.cinzel,
      fontSize: '"'"'0.54rem'"'"',
      letterSpacing: '"'"'0.14em'"'"',
      color: '"'"'rgba(200,164,74,0.88)'"'"'
    }}>
      {text}
    </div>
  );
}'

  ["SubtitleCard.jsx"]='export default function SubtitleCard({ text }) {
  return (
    <div style={{
      fontSize: '"'"'0.47rem'"'"',
      color: '"'"'rgba(140,160,200,0.55)'"'"',
      lineHeight: 1.55
    }}>
      {text}
    </div>
  );
}'

  ["ButtonRow.jsx"]='export default function ButtonRow({ children }) {
  return (
    <div style={{
      display: '"'"'flex'"'"',
      gap: '"'"'0.6rem'"'"',
      width: '"'"'100%'"'"',
      justifyContent: '"'"'space-between'"'"'
    }}>
      {children}
    </div>
  );
}'

  ["index.js"]='export { default as BackButton } from '"'"'./BackButton'"'"';
export { default as HeaderTitle } from '"'"'./HeaderTitle'"'"';
export { default as Card } from '"'"'./Card'"'"';
export { default as TitleCard } from '"'"'./TitleCard'"'"';
export { default as SubtitleCard } from '"'"'./SubtitleCard'"'"';
export { default as ButtonRow } from '"'"'./ButtonRow'"'"';'
)

# Boucle pour créer les fichiers
for file in "${!files[@]}"; do
  echo "${files[$file]}" > "src/shared/components/$file"
  echo "✅ Créé: $file"
done

echo "🎉 Tous les fichiers ont été créés dans src/shared/components/"
