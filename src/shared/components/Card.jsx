import { mCard } from '../../shared/theme';

export default function Card({ onClick, style, children }) {
  return (
    <div style={{ ...mCard, ...style }} onClick={onClick}>
      {children}
    </div>
  );
}
