import { useLocale, t } from '../../../../ariaI18n';
import { FONT, wrap } from '../../../../shared/theme';
import ARIAHeader from '../ARIAHeader';

export default function GeneratingScreen({ progress, msg }) {
    const { lang } = useLocale();

    return (
        <div style={wrap(false)}>
        <ARIAHeader showQuote={false} />
        <div style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.85rem' }}>
        <div style={{
            fontFamily:FONT.mono, fontSize:'0.55rem', letterSpacing:'0.14em',
            color:'#C8A44A', animation:'pulse 1.2s ease-in-out infinite'
        }}>
        {msg}
        </div>
        <div className="worldgen-bar" style={{ width:'100%' }}>
        <div className="worldgen-fill" style={{ width:`${progress}%` }} />
        </div>
        <div style={{ fontFamily:FONT.mono, fontSize:'0.52rem', color:'#3A4A62', letterSpacing:'0.10em' }}>
        {progress} %
        </div>
        </div>
        </div>
    );
}
