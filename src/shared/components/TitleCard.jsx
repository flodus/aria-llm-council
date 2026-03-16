import { FONT } from '../../shared/theme';

export default function TitleCard({ text }) {
  return (
    <div style={{
      fontFamily: FONT.cinzel,
      fontSize: '0.54rem',
      letterSpacing: '0.14em',
      color: 'rgba(200,164,74,0.88)'
    }}>
      {text}
    </div>
  );
}
