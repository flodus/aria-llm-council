// src/features/init/components/screens/GeneratingScreen.jsx

import { useLocale, t } from '../../../../ariaI18n';
import { FONT, wrap } from '../../../../shared/theme';
import ARIAHeader from '../ARIAHeader';

export default function GeneratingScreen({ progress, msg, background }) {
    const { lang } = useLocale();

    // Avec globe morphing en fond
    if (background) {
        return (
            <div style={{ position:'fixed', inset:0 }}>
                <div style={{ position:'absolute', inset:0, zIndex:0 }}>
                    {background}
                </div>
                <div style={{
                    position:'absolute', inset:0, zIndex:1,
                    display:'flex', alignItems:'flex-end', justifyContent:'center',
                    paddingBottom:'8vh', pointerEvents:'none',
                }}>
                    <div style={{
                        background:'rgba(14,20,36,0.45)',
                        border:'1px solid rgba(200,164,74,0.22)',
                        borderRadius:'2px', padding:'0.8rem 2.8rem',
                        backdropFilter:'blur(6px)',
                    }}>
                        <span style={{
                            fontFamily:"'JetBrains Mono',monospace",
                            fontSize:'0.52rem', letterSpacing:'0.25em',
                            color:'rgba(200,164,74,0.85)',
                        }}>
                            L'HISTOIRE SE RÉÉCRIT...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback : barre de progression originale
    return (
        <div style={wrap(false)}>
        <ARIAHeader showQuote={false} showSubtitle={false} />
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
