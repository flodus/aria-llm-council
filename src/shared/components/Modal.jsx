// src/shared/components/Modal.jsx
// Cadre unique de toutes les modales de l'application.
// Fond, boîte, en-tête et bouton fermer viennent de App.css (classes .aria-modal-*).
// Aucun style en ligne ici : les variantes sont des classes, les couleurs viennent de colors.js (variables CSS).
//
//   taille          'sm' 440px · 'md' 460px (défaut) · 'lg' 480px · 'xl' 500px
//   hauteurLimitee  true → hauteur max 85vh avec défilement
//   couleur         'or' · 'violet' · 'vert' · 'rouge' · 'bleu' → couleur du titre

export default function Modal({ titre, onClose, taille = 'md', hauteurLimitee = false, couleur, children }) {
  const classeBoite = ['aria-modal', `aria-modal--${taille}`, hauteurLimitee && 'aria-modal--haute']
    .filter(Boolean).join(' ');
  const classeTitre = ['aria-modal-titre', couleur && `aria-modal-titre--${couleur}`]
    .filter(Boolean).join(' ');

  return (
    <div className="aria-modal-overlay" onClick={onClose}>
      <div className={classeBoite} onClick={e => e.stopPropagation()}>
        <div className="aria-modal-header">
          <span className={classeTitre}>{titre}</span>
          <button className="aria-modal-fermer" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
