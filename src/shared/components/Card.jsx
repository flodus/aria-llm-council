// src/shared/components/Card.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  Card.jsx — Wrapper générique basé sur mCard avec style extensible
//
//  Dépendances : shared/theme (mCard)
// ═══════════════════════════════════════════════════════════════════════════

import { mCard } from '../../shared/theme';

export default function Card({ onClick, style, children }) {
  return (
    <div style={{ ...mCard, ...style }} onClick={onClick}>
      {children}
    </div>
  );
}
