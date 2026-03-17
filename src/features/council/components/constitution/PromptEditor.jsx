/**
 * Éditeur de prompt pour un ministre ou un ministère
 * @param {Object} prompt - Données du prompt { id, title, content, type, color }
 * @param {function} onSave - Callback de sauvegarde (reçoit le nouveau contenu)
 * @param {function} onCancel - Callback d'annulation
 * @param {boolean} isOpen - Le panneau d'édition est-il ouvert ?
 * @param {function} onToggle - Callback pour ouvrir/fermer
 */


import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';

export default function PromptEditor({
    prompt,
    onSave,
    onCancel,
    isOpen,
    onToggle
}) {
    const { lang } = useLocale();
    const [editedContent, setEditedContent] = useState(prompt?.content || '');

    // Reset quand on change de prompt
    useEffect(() => {
        setEditedContent(prompt?.content || '');
    }, [prompt?.id]);

    const handleSave = () => {
        onSave(editedContent);
        onToggle(); // Ferme après sauvegarde
    };

    const handleCancel = () => {
        setEditedContent(prompt?.content || ''); // Restaure
        onCancel?.();
        onToggle();
    };

    if (!prompt) return null;

    return (
        <div style={{ ...CARD_STYLE, border: `1px solid ${prompt.color || '#8090C0'}40` }}>
        {/* En-tête cliquable pour ouvrir/fermer */}
        <div
        onClick={onToggle}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            marginBottom: isOpen ? '0.5rem' : 0
        }}
        >
        <span style={{
            fontSize: '0.65rem',
            color: prompt.color || 'rgba(200,164,74,0.50)',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(90deg)' : 'none'
        }}>
        ▶
        </span>
        <div style={{ flex: 1 }}>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.42rem',
            color: prompt.color || 'rgba(140,160,200,0.70)',
            letterSpacing: '0.06em'
        }}>
        {prompt.title || (lang === 'en' ? 'PROMPT' : 'PROMPT')}
        </div>
        {!isOpen && prompt.content && (
            <div style={{
                fontSize: '0.40rem',
                color: 'rgba(140,160,200,0.45)',
                                       marginTop: '0.2rem',
                                       overflow: 'hidden',
                                       textOverflow: 'ellipsis',
                                       whiteSpace: 'nowrap',
                                       maxWidth: '100%'
            }}>
            {prompt.content.substring(0, 80)}
            {prompt.content.length > 80 ? '...' : ''}
            </div>
        )}
        </div>
        <span style={{
            fontSize: '0.38rem',
            fontFamily: FONT.mono,
            color: 'rgba(140,160,200,0.35)'
        }}>
        {prompt.type === 'minister' ? '👤' : '🏛️'}
        </span>
        </div>

        {/* Panneau d'édition */}
        {isOpen && (
            <div style={{ marginTop: '0.5rem' }}>
            <textarea
            style={{
                ...INPUT_STYLE,
                width: '100%',
                minHeight: '100px',
                resize: 'vertical',
                fontSize: '0.41rem',
                fontFamily: FONT.mono,
                lineHeight: 1.6,
                border: `1px solid ${prompt.color || '#8090C0'}30`,
                background: `${prompt.color || '#8090C0'}08`
            }}
            value={editedContent}
            onChange={e => setEditedContent(e.target.value)}
            placeholder={lang === 'en' ? 'Write the prompt...' : 'Rédigez le prompt...'}
            />
            <div style={{
                display: 'flex',
                gap: '0.4rem',
                justifyContent: 'flex-end',
                marginTop: '0.4rem'
            }}>
            <button
            style={BTN_SECONDARY}
            onClick={handleCancel}
            >
            {lang === 'en' ? 'Cancel' : 'Annuler'}
            </button>
            <button
            style={{
                ...BTN_SECONDARY,
                border: `1px solid ${prompt.color || '#8090C0'}60`,
                color: prompt.color || '#8090C0'
            }}
            onClick={handleSave}
            >
            {lang === 'en' ? 'Save' : 'Sauvegarder'}
            </button>
            </div>
            </div>
        )}
        </div>
    );
}
