// ═══════════════════════════════════════════════════════════════════════════════
//  Dashboard_p3.jsx — Partie 3 / 3
//  Composant Dashboard() final : assemblage useARIA + MapSVG + modales
//
//  Ce fichier REMPLACE le stub export default de Dashboard_p1.jsx.
//  Dans App.jsx : import Dashboard from './Dashboard_p3'
//
//  Dépend de :
//    Dashboard_p1.jsx  → useARIA, getGovConfig, PAYS_LOCAUX, …
//    Dashboard_p2.jsx  → MapSVG
//    ConstitutionModal → modale gouvernance par pays
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    useARIA,
    PAYS_LOCAUX,
    REGIMES,
    getHumeur,
} from './Dashboard_p1';
import { MapSVG } from './Dashboard_p2';
import ConstitutionModal from './ConstitutionModal';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES UI
// ─────────────────────────────────────────────────────────────────────────────

const TAB_ICONS = { map: '🗺', council: '⚖', timeline: '📜' };

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : NOTIFICATION TOAST
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ notification }) {
    if (!notification) return null;
    const colors = {
        ok:   'rgba(58,191,122,0.85)',
        warn: 'rgba(200,120,48,0.85)',
        info: 'rgba(74,126,200,0.85)',
        err:  'rgba(200,58,58,0.85)',
    };
    return (
        <div style={{
            position: 'absolute', bottom: '1.2rem', left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(8,14,26,0.94)',
            border: `1px solid ${colors[notification.type] || colors.info}`,
            borderRadius: '2px',
            padding: '0.45rem 1rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.52rem', letterSpacing: '0.09em',
            color: colors[notification.type] || colors.info,
            zIndex: 800, pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: `0 0 20px ${colors[notification.type] || colors.info}33`,
        }}>
        {notification.message}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : VUE COUNCIL (onglet LLM COUNCIL)
// ─────────────────────────────────────────────────────────────────────────────

function CouncilView({ events, countries }) {
    if (events.length === 0) return (
        <div style={S.emptyView}>
        <div style={{ fontSize: '2rem', opacity: 0.15 }}>⚖️</div>
        <div style={S.emptyLabel}>AUCUNE DÉLIBÉRATION</div>
        <p style={S.emptyHint}>Les délibérations du Conseil apparaîtront ici après chaque cycle.</p>
        </div>
    );
    return (
        <div style={S.councilList}>
        {events.map(evt => (
            <div key={evt.id} style={S.councilCard}>
            <div style={S.councilCardHeader}>
            <span style={S.councilPays}>{evt.pays}</span>
            <span style={{
                ...S.councilSeverite,
                color: evt.severite === 'critical' ? '#FF3A3A' :
                evt.severite === 'warn'     ? '#C8A44A' : '#3ABF7A',
            }}>
            {evt.trigger?.toUpperCase() || 'ÉVÉNEMENT'}
            </span>
            </div>
            {evt.titre && <div style={S.councilTitre}>{evt.titre}</div>}
            {evt.narration && <p style={S.councilNarration}>{evt.narration}</p>}
            </div>
        ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : VUE CHRONOLOG (onglet CHRONOLOG)
// ─────────────────────────────────────────────────────────────────────────────

function ChronologView({ countries }) {
    if (countries.length === 0) return (
        <div style={S.emptyView}>
        <div style={{ fontSize: '2rem', opacity: 0.15 }}>📜</div>
        <div style={S.emptyLabel}>CHRONOLOG VIDE</div>
        <p style={S.emptyHint}>L'historique des cycles s'affiche ici.</p>
        </div>
    );

    // Fusionner tous les chronologs et trier par annee desc
    const allEntries = countries
    .flatMap(c => (c.chronolog || []).map(e => ({ ...e, pays: c.nom, emoji: c.emoji })))
    .sort((a, b) => (b.annee || 0) - (a.annee || 0));

    if (allEntries.length === 0) return (
        <div style={S.emptyView}>
        <div style={S.emptyLabel}>AUCUNE ENTRÉE</div>
        <p style={S.emptyHint}>Lancez un cycle pour commencer l'historique.</p>
        </div>
    );

    return (
        <div style={S.councilList}>
        {allEntries.map((e, i) => (
            <div key={i} style={S.chronoEntry}>
            <span style={S.chronoAnnee}>An {e.annee}</span>
            <span style={S.chronoPays}>{e.emoji} {e.pays}</span>
            <span style={S.chronoTexte}>{e.texte || JSON.stringify(e)}</span>
            </div>
        ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : MODALE SÉCESSION
// ─────────────────────────────────────────────────────────────────────────────

function SecessionModal({ parent, onConfirm, onClose }) {
    const [nom,      setNom]      = useState('');
    const [relation, setRelation] = useState('Tension');

    return (
        <div style={S.overlay} onClick={onClose}>
        <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
        <span style={S.modalTitle}>✂️ SÉCESSION — {parent?.nom}</span>
        <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <p style={S.modalHint}>
        Le nouveau pays hérite de 25% de la population et des ressources.
        {parent?.nom} perd 25% de sa population et 12% de sa taille.
        </p>
        <label style={S.fieldLabel}>NOM DU NOUVEAU PAYS</label>
        <input
        style={S.fieldInput}
        value={nom}
        onChange={e => setNom(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && nom.trim() && onConfirm(nom.trim(), relation)}
        placeholder="Ex : République du Levant…"
        autoFocus
        />
        <label style={S.fieldLabel}>RELATION INITIALE AVEC {parent?.nom?.toUpperCase()}</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['Alliance', 'Tension', 'Neutre'].map(r => (
            <button
            key={r}
            style={{
                ...S.relBtn,
                ...(relation === r ? S.relBtnActive : {}),
            }}
            onClick={() => setRelation(r)}
            >
            {r === 'Alliance' ? '🤝' : r === 'Tension' ? '⚡' : '○'} {r}
            </button>
        ))}
        </div>
        </div>
        <div style={S.modalFooter}>
        <button style={S.cancelBtn} onClick={onClose}>Annuler</button>
        <button
        style={{ ...S.saveBtn, opacity: nom.trim() ? 1 : 0.4 }}
        disabled={!nom.trim()}
        onClick={() => onConfirm(nom.trim(), relation)}
        >
        ✂ Déclarer la sécession
        </button>
        </div>
        </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : MODALE DIPLOMATIE
// ─────────────────────────────────────────────────────────────────────────────

function DiplomacyModal({ sourceCountry, allCountries, alliances, onSetRelation, onClose }) {
    const others = allCountries.filter(c => c.id !== sourceCountry.id);

    const getCurrentRelation = (otherId) => {
        const a = alliances.find(
            x => (x.a === sourceCountry.id && x.b === otherId) ||
            (x.b === sourceCountry.id && x.a === otherId)
        );
        return a?.type || 'Neutre';
    };

    return (
        <div style={S.overlay} onClick={onClose}>
        <div style={{ ...S.modal, width: '460px' }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
        <span style={S.modalTitle}>🤝 DIPLOMATIE — {sourceCountry?.nom}</span>
        <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '55vh', overflowY: 'auto' }}>
        {others.length === 0 && (
            <p style={S.modalHint}>Aucun autre pays dans le monde.</p>
        )}
        {others.map(other => {
            const current = getCurrentRelation(other.id);
            return (
                <div key={other.id} style={S.diploRow}>
                <span style={S.diploNom}>{other.emoji} {other.nom}</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                {['Alliance', 'Neutre', 'Tension'].map(type => (
                    <button
                    key={type}
                    style={{
                        ...S.relBtn,
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.48rem',
                        ...(current === type ? S.relBtnActive : {}),
                    }}
                    onClick={() => onSetRelation(sourceCountry.id, other.id, type)}
                    >
                    {type === 'Alliance' ? '🤝' : type === 'Tension' ? '⚡' : '○'}
                    </button>
                ))}
                </div>
                </div>
            );
        })}
        </div>
        <div style={S.modalFooter}>
        <button style={S.saveBtn} onClick={onClose}>Fermer</button>
        </div>
        </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL : Dashboard
//  Remplace le stub dans Dashboard_p1.jsx
//  Dans App.jsx : import Dashboard from './Dashboard_p3'
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ selectedCountry, setSelectedCountry, isCrisis, activeTab, onReady, onReset, onCountriesUpdate }) {
    const aria = useARIA({ setSelectedCountry, isCrisis, onReset });

    // ── Modales ──
    const [modalSecession,   setModalSecession]   = useState(false);
    const [modalDiplomacy,   setModalDiplomacy]   = useState(false);
    const [modalConstitution,setModalConstitution] = useState(false);

    // ── Handlers modales ──
    const openSecession    = () => setModalSecession(true);
    const openDiplomacy    = () => setModalDiplomacy(true);
    const openConstitution = () => setModalConstitution(true);

    const handleSecessionConfirm = useCallback(async (nom, relation) => {
        setModalSecession(false);
        if (selectedCountry) {
            await aria.doSecession(selectedCountry.id, nom, relation);
        }
    }, [selectedCountry, aria]);

    const handleConstitutionSave = useCallback((updatedCountry) => {
        aria.setCountries(prev =>
        prev.map(c => c.id === updatedCountry.id ? updatedCountry : c)
        );
        // Si le pays modifié est sélectionné, mettre à jour la sélection
        if (selectedCountry?.id === updatedCountry.id) {
            setSelectedCountry(updatedCountry);
        }
    }, [aria, selectedCountry, setSelectedCountry]);

    // Expose les fonctions du moteur au parent (App.jsx) dès que le hook est prêt
    useEffect(() => {
        onReady?.({
            startLocal:    aria.startLocal,
            startWithAI:   aria.startWithAI,
            advanceCycle:  aria.advanceCycle,
            doDeliberate:  aria.doDeliberate,
            doSecession:   aria.doSecession,
            openSecession: openSecession,
            resetWorld:    aria.resetWorld,
            getYear:       aria.getYear,
            getCountries:  aria.getCountries,
            getCycle:      aria.getCycle,
        });
    }, [aria.startLocal, aria.advanceCycle, onReady]);

    // Notifie App chaque fois que la liste de pays change (pour date/cycle dans topbar)
    useEffect(() => {
        if (aria.countries?.length) {
            onCountriesUpdate?.(aria.countries);
        }
    }, [aria.countries, onCountriesUpdate]);

    // ─────────────────────────────────────────────────────────────────────────
    //  Rendu selon onglet actif
    // ─────────────────────────────────────────────────────────────────────────

    const renderMainContent = () => {
        if (activeTab === 'council') {
            return <CouncilView events={aria.events} countries={aria.countries} />;
        }
        if (activeTab === 'timeline') {
            return <ChronologView countries={aria.countries} />;
        }

        // Onglet MAP (défaut)
        return (
            <MapSVG
            worldData={aria.worldData}
            countries={aria.countries}
            alliances={aria.alliances}
            selectedCountry={selectedCountry}
            onCountryClick={(c) => setSelectedCountry(prev => prev?.id === c.id ? null : c)}
            onCountryHover={() => {}}
            />
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>

        {/* ── Contenu principal (carte ou vues) ── */}
        {renderMainContent()}

        {/* ── Toast notifications ── */}
        <Toast notification={aria.notification} />

        {/* ── Indicateur chargement IA ── */}
        {aria.aiRunning && (
            <div style={S.aiLoader}>
            <span style={S.aiLoaderDot} />
            DÉLIBÉRATION EN COURS…
            </div>
        )}

        {/* ── Boutons d'action flottants (bas droit) ── */}
        <div style={S.fabGroup}>
        <button
        style={S.fabBtn}
        title="Avancer de 5 ans"
        onClick={aria.advanceCycle}
        disabled={aria.phase !== 'game' || aria.aiRunning}
        >
        ⏭
        </button>
        {selectedCountry && (
            <>
            <button style={S.fabBtn} title="Diplomatie" onClick={openDiplomacy}>🤝</button>
            <button style={S.fabBtn} title="Constitution" onClick={openConstitution}>⚖️</button>
            <button style={{ ...S.fabBtn, ...S.fabBtnDanger }} title="Sécession" onClick={openSecession}>✂️</button>
            </>
        )}
        </div>

        {/* ── Modales ── */}
        {modalSecession && (
            <SecessionModal
            parent={selectedCountry}
            onConfirm={handleSecessionConfirm}
            onClose={() => setModalSecession(false)}
            />
        )}
        {modalDiplomacy && selectedCountry && (
            <DiplomacyModal
            sourceCountry={selectedCountry}
            allCountries={aria.countries}
            alliances={aria.alliances}
            onSetRelation={aria.setRelation}
            onClose={() => setModalDiplomacy(false)}
            />
        )}
        {modalConstitution && selectedCountry && (
            <ConstitutionModal
            country={selectedCountry}
            onSave={handleConstitutionSave}
            onClose={() => setModalConstitution(false)}
            />
        )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  RE-EXPORT de useARIA pour App.jsx
//  App.jsx peut importer { useARIA } from './Dashboard_p3' si besoin
// ─────────────────────────────────────────────────────────────────────────────
export { useARIA };

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────────────────

const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(3px)',
    },
    modal: {
        width: '460px', maxWidth: '95vw',
        background: '#0D1117',
        border: '1px solid rgba(200,164,74,0.22)',
        borderRadius: '2px',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'JetBrains Mono', monospace",
        overflow: 'hidden',
    },
    modalHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.65rem 1rem',
        borderBottom: '1px solid rgba(200,164,74,0.12)',
        background: 'rgba(200,164,74,0.04)',
    },
    modalTitle: {
        fontSize: '0.58rem', letterSpacing: '0.16em',
        color: 'rgba(200,164,74,0.80)', textTransform: 'uppercase',
    },
    closeBtn: {
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(200,164,74,0.40)', fontSize: '0.75rem',
        padding: '0.1rem 0.3rem',
    },
    modalHint: {
        fontSize: '0.50rem', color: 'rgba(140,160,200,0.50)',
        margin: 0, lineHeight: 1.6,
    },
    modalFooter: {
        display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
        padding: '0.65rem 1rem',
        borderTop: '1px solid rgba(200,164,74,0.10)',
    },
    fieldLabel: {
        fontSize: '0.48rem', letterSpacing: '0.16em',
        color: 'rgba(200,164,74,0.50)', textTransform: 'uppercase',
    },
    fieldInput: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(200,164,74,0.20)',
        borderRadius: '2px',
        padding: '0.5rem 0.7rem',
        color: 'rgba(220,228,240,0.85)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.58rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    relBtn: {
        flex: 1,
        padding: '0.35rem 0.6rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '2px', cursor: 'pointer',
        fontSize: '0.52rem', letterSpacing: '0.08em',
        color: 'rgba(180,200,230,0.55)',
        fontFamily: "'JetBrains Mono', monospace",
        transition: 'all 0.15s',
    },
    relBtnActive: {
        background: 'rgba(200,164,74,0.10)',
        border: '1px solid rgba(200,164,74,0.40)',
        color: 'rgba(200,164,74,0.90)',
    },
    cancelBtn: {
        padding: '0.40rem 0.9rem',
        background: 'none',
        border: '1px solid rgba(255,255,255,0.09)',
        color: 'rgba(180,200,230,0.40)',
        fontSize: '0.50rem', letterSpacing: '0.10em',
        cursor: 'pointer', borderRadius: '2px',
        fontFamily: "'JetBrains Mono', monospace",
    },
    saveBtn: {
        padding: '0.40rem 1rem',
        background: 'rgba(200,164,74,0.10)',
        border: '1px solid rgba(200,164,74,0.40)',
        color: 'rgba(200,164,74,0.88)',
        fontSize: '0.50rem', letterSpacing: '0.10em',
        cursor: 'pointer', borderRadius: '2px',
        fontFamily: "'JetBrains Mono', monospace",
        transition: 'all 0.15s',
    },
    diploRow: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.35rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    diploNom: {
        fontSize: '0.54rem', color: 'rgba(200,215,240,0.75)',
        letterSpacing: '0.06em',
    },
    emptyView: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: '0.6rem',
        userSelect: 'none',
    },
    emptyLabel: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.52rem', letterSpacing: '0.24em',
        color: 'rgba(200,164,74,0.20)',
    },
    emptyHint: {
        fontSize: '0.50rem', color: 'rgba(90,110,150,0.50)',
        textAlign: 'center', maxWidth: 280, lineHeight: 1.6,
        margin: 0,
    },
    councilList: {
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
        padding: '0.75rem', overflowY: 'auto', height: '100%',
        boxSizing: 'border-box',
    },
    councilCard: {
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(200,164,74,0.12)',
        borderRadius: '2px', padding: '0.6rem 0.75rem',
        display: 'flex', flexDirection: 'column', gap: '0.3rem',
    },
    councilCardHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    councilPays: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.52rem', letterSpacing: '0.10em',
        color: 'rgba(200,164,74,0.65)',
    },
    councilSeverite: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.46rem', letterSpacing: '0.14em',
    },
    councilTitre: {
        fontFamily: "'Cinzel', serif",
        fontSize: '0.58rem', color: 'rgba(220,228,240,0.80)',
    },
    councilNarration: {
        fontSize: '0.50rem', color: 'rgba(140,160,200,0.55)',
        margin: 0, lineHeight: 1.6,
    },
    chronoEntry: {
        display: 'grid', gridTemplateColumns: '52px 140px 1fr',
        gap: '0.5rem', alignItems: 'baseline',
        padding: '0.3rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
    },
    chronoAnnee: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.48rem', color: 'rgba(200,164,74,0.50)',
    },
    chronoPays: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.50rem', color: 'rgba(200,215,240,0.55)',
    },
    chronoTexte: {
        fontSize: '0.50rem', color: 'rgba(140,160,200,0.55)', lineHeight: 1.5,
    },
    aiLoader: {
        position: 'absolute', top: '0.75rem', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(8,14,26,0.90)',
        border: '1px solid rgba(200,164,74,0.25)',
        borderRadius: '2px',
        padding: '0.35rem 0.9rem',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.48rem', letterSpacing: '0.14em',
        color: 'rgba(200,164,74,0.70)',
        zIndex: 700, pointerEvents: 'none',
    },
    aiLoaderDot: {
        display: 'inline-block', width: '6px', height: '6px',
        borderRadius: '50%', background: 'rgba(200,164,74,0.70)',
        animation: 'pulse 1s ease-in-out infinite',
    },
    fabGroup: {
        position: 'absolute', bottom: '1.2rem', right: '1rem',
        display: 'flex', flexDirection: 'column', gap: '0.4rem',
        zIndex: 600,
    },
    fabBtn: {
        width: '36px', height: '36px',
        background: 'rgba(8,14,26,0.88)',
        border: '1px solid rgba(200,164,74,0.22)',
        borderRadius: '2px',
        fontSize: '1rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(200,164,74,0.70)',
        transition: 'all 0.15s',
    },
    fabBtnDanger: {
        borderColor: 'rgba(200,58,58,0.30)',
        color: 'rgba(200,100,100,0.70)',
    },
};
