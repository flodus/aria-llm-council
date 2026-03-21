// src/shared/components/ButtonRow.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  ButtonRow.jsx — Conteneur flex pleine largeur pour rangée de boutons
// ═══════════════════════════════════════════════════════════════════════════

export default function ButtonRow({ children }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '8vh',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(700px, 90vw)',
      display: 'flex',
      gap: '0.6rem',
      justifyContent: 'space-between',
      zIndex: 20,
    }}>
      {children}
    </div>
  );
}
