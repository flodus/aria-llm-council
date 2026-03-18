// ═══════════════════════════════════════════════════════════════════════════
//  ButtonRow.jsx — Conteneur flex pleine largeur pour rangée de boutons
// ═══════════════════════════════════════════════════════════════════════════

export default function ButtonRow({ children }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.6rem',
      width: '100%',
      justifyContent: 'space-between'
    }}>
      {children}
    </div>
  );
}
