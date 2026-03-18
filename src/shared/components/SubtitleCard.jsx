// ═══════════════════════════════════════════════════════════════════════════
//  SubtitleCard.jsx — Texte sous-titre gris (0.47rem, opacité réduite)
// ═══════════════════════════════════════════════════════════════════════════

export default function SubtitleCard({ text }) {
  return (
    <div style={{
      fontSize: '0.47rem',
      color: 'rgba(140,160,200,0.55)',
      lineHeight: 1.55
    }}>
      {text}
    </div>
  );
}
