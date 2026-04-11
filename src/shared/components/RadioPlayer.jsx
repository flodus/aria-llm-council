// src/shared/components/RadioPlayer.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  RadioPlayer — lecteur radio intégré dans la topbar ARIA
//  Adapté de ma-planete/src/components/RadioPlayer.jsx
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import defaultStationsData from '../data/defaultStations.json';
import { STORAGE_KEYS } from '../services/storageKeys';

const STORAGE_KEY = STORAGE_KEYS.RADIO_STATIONS;
const CURRENT_KEY = STORAGE_KEYS.RADIO_CURRENT;
const VOLUME_KEY  = STORAGE_KEYS.RADIO_VOLUME;

function RadioPlayer() {
    // Chargement des stations : localStorage en priorité, sinon le fichier JSON
    const [stations, setStations] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
        return defaultStationsData;
    });

    const [currentStation, setCurrentStation] = useState(() => {
        const savedId = localStorage.getItem(CURRENT_KEY);
        if (savedId) {
            const savedStations = localStorage.getItem(STORAGE_KEY);
            const liste = savedStations ? JSON.parse(savedStations) : defaultStationsData;
            const found = liste.find(s => s.id === parseInt(savedId));
            if (found) return found;
        }
        return defaultStationsData[0];
    });

    const [isPlaying,      setIsPlaying]      = useState(false);
    const [isOpen,         setIsOpen]         = useState(false);
    const [showVolume,     setShowVolume]      = useState(false);
    const [showAddPopup,   setShowAddPopup]    = useState(false);
    const [showLocalPopup, setShowLocalPopup]  = useState(false);
    const [newStationName, setNewStationName]  = useState('');
    const [newStationUrl,  setNewStationUrl]   = useState('');
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem(VOLUME_KEY);
        return saved ? parseFloat(saved) : 0.5;
    });

    const audioRef     = useRef(null);
    const fileInputRef = useRef(null);

    // ── Persistance ────────────────────────────────────────────────────────
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(stations)); }, [stations]);
    useEffect(() => { localStorage.setItem(CURRENT_KEY, currentStation.id.toString()); }, [currentStation]);
    useEffect(() => { localStorage.setItem(VOLUME_KEY, volume.toString()); }, [volume]);
    useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

    // ── Contrôles ──────────────────────────────────────────────────────────
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.log('Lecture impossible:', e));
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));

    const changeStation = (station) => {
        const wasPlaying = isPlaying;
        setCurrentStation(station);
        setIsOpen(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = station.src;
            audioRef.current.load();
            if (wasPlaying) {
                audioRef.current.play().catch(e => console.log('Auto-play bloqué:', e));
            }
        }
    };

    // ── Upload fichiers locaux ──────────────────────────────────────────────
    const handleFileUpload = (e) => {
        const files    = Array.from(e.target.files);
        const maxId    = Math.max(...stations.map(s => s.id), 0);
        const newItems = files.map((file, idx) => ({
            id:   maxId + idx + 1,
            name: file.name.replace(/\.(mp3|m4a|ogg)$/i, ''),
            src:  URL.createObjectURL(file),
            type: 'local',
            file,
        }));
        setStations([...stations, ...newItems]);
        setShowLocalPopup(false);
        if (newItems.length === 1) changeStation(newItems[0]);
    };

    const addCustomStation = () => {
        if (!newStationName.trim() || !newStationUrl.trim()) return;
        const newId      = Math.max(...stations.map(s => s.id), 0) + 1;
        const newStation = { id: newId, name: newStationName.trim(), src: newStationUrl.trim(), type: 'custom' };
        setStations([...stations, newStation]);
        changeStation(newStation);
        setNewStationName('');
        setNewStationUrl('');
        setShowAddPopup(false);
    };

    const removeStation = (stationId, e) => {
        e.stopPropagation();
        if (stations.length <= 1) return;
        const toRemove = stations.find(s => s.id === stationId);
        if (toRemove?.type === 'local' && toRemove.src?.startsWith('blob:')) URL.revokeObjectURL(toRemove.src);
        const next = stations.filter(s => s.id !== stationId);
        setStations(next);
        if (currentStation.id === stationId) changeStation(next[0]);
    };

    const resetToDefault = () => {
        setStations(defaultStationsData);
        setCurrentStation(defaultStationsData[0]);
        if (isPlaying && audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
        setIsOpen(false);
    };

    const getDisplayName = (name) => name.length > 20 ? name.substring(0, 18) + '…' : name;

    // ── Rendu ──────────────────────────────────────────────────────────────
    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Barre principale */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)',
                borderRadius: '16px', padding: '3px 8px',
                border: '0.5px solid rgba(198,162,76,0.25)',
            }}>
                {/* Play/Pause */}
                <button onClick={togglePlay} style={{
                    background: 'transparent', border: 'none', color: '#c6a24c',
                    cursor: 'pointer', fontSize: '10px', width: '16px', padding: 0,
                }}>
                    {isPlaying ? '⏸' : '▶'}
                </button>

                {/* Nom station */}
                <div style={{
                    color: 'rgba(255,255,255,0.6)', fontSize: '9px',
                    maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {isPlaying ? '🎧 ' : '⚫ '}{getDisplayName(currentStation.name)}
                </div>

                {/* Menu déroulant */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => { setIsOpen(!isOpen); setShowVolume(false); }} style={{
                        background: 'transparent', border: 'none',
                        color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '8px', padding: 0,
                    }}>
                        {isOpen ? '▲' : '▼'}
                    </button>

                    {isOpen && (
                        <div style={{
                            position: 'absolute', top: '100%', right: '0', marginTop: '6px',
                            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
                            borderRadius: '8px', border: '0.5px solid rgba(198,162,76,0.4)',
                            overflow: 'hidden', minWidth: '200px', maxHeight: '350px', overflowY: 'auto',
                            zIndex: 9000,
                        }}>
                            <div style={{
                                padding: '6px 10px', borderBottom: '0.5px solid rgba(198,162,76,0.3)',
                                fontSize: '8px', color: '#c6a24c',
                                display: 'flex', justifyContent: 'space-between',
                            }}>
                                <span>📻 RADIOS</span>
                                <button onClick={resetToDefault} style={{
                                    background: 'transparent', border: 'none',
                                    color: '#c6a24c', cursor: 'pointer', fontSize: '8px',
                                }}>↺ Réinitialiser</button>
                            </div>

                            {stations.map(station => (
                                <div key={station.id} onClick={() => changeStation(station)} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '6px 10px', cursor: 'pointer', fontSize: '10px',
                                    color: currentStation.id === station.id ? '#c6a24c' : 'rgba(255,255,255,0.7)',
                                    background: currentStation.id === station.id ? 'rgba(198,162,76,0.15)' : 'transparent',
                                    borderBottom: '0.5px solid rgba(198,162,76,0.1)',
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>{station.type === 'local' ? '📁' : station.type === 'custom' ? '🔗' : '📡'}</span>
                                        <span>{station.name}</span>
                                        {station.description && (
                                            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)' }}>{station.description}</span>
                                        )}
                                    </span>
                                    {!defaultStationsData.some(s => s.id === station.id) && (
                                        <button onClick={(e) => removeStation(station.id, e)} style={{
                                            background: 'transparent', border: 'none',
                                            color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '10px', padding: '0 4px',
                                        }}>✕</button>
                                    )}
                                </div>
                            ))}

                            <div style={{ borderTop: '0.5px solid rgba(198,162,76,0.3)' }} />
                            <div onClick={() => { setIsOpen(false); setShowLocalPopup(true); }} style={{
                                padding: '6px 10px', cursor: 'pointer', fontSize: '9px', color: '#c6a24c',
                                background: 'rgba(198,162,76,0.05)',
                            }}>📁 + AJOUTER FICHIER MP3</div>
                            <div onClick={() => { setIsOpen(false); setShowAddPopup(true); }} style={{
                                padding: '6px 10px', cursor: 'pointer', fontSize: '9px', color: '#c6a24c',
                                background: 'rgba(198,162,76,0.05)', borderTop: '0.5px solid rgba(198,162,76,0.2)',
                            }}>🔗 + AJOUTER FLUX URL</div>
                        </div>
                    )}
                </div>

                {/* Volume */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => { setShowVolume(!showVolume); setIsOpen(false); }} style={{
                        background: 'transparent', border: 'none',
                        color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '10px', width: '16px', padding: 0,
                    }}>
                        {volume === 0 ? '🔇' : '🔊'}
                    </button>
                    {showVolume && (
                        <div style={{
                            position: 'absolute', top: '100%', right: '0', marginTop: '6px',
                            background: 'rgba(0,0,0,0.8)', borderRadius: '12px', padding: '8px',
                            border: '0.5px solid rgba(198,162,76,0.3)', zIndex: 9000,
                        }}>
                            <input type="range" min="0" max="1" step="0.01" value={volume}
                                onChange={handleVolumeChange} style={{
                                    width: '80px', height: '2px', WebkitAppearance: 'none',
                                    background: 'rgba(255,255,255,0.2)', borderRadius: '2px', outline: 'none',
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Popup — ajout fichier local */}
            {showLocalPopup && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)', borderRadius: '12px',
                    padding: '20px', border: '1px solid rgba(198,162,76,0.5)', zIndex: 10000, minWidth: '280px',
                }}>
                    <div style={{ color: '#c6a24c', fontSize: '12px', marginBottom: '16px', fontWeight: 'bold' }}>
                        📁 Ajouter un fichier audio
                    </div>
                    <input type="file" accept="audio/mp3,audio/mpeg,audio/m4a,audio/ogg"
                        multiple ref={fileInputRef} onChange={handleFileUpload}
                        style={{
                            width: '100%', background: 'rgba(255,255,255,0.1)',
                            border: '0.5px solid rgba(198,162,76,0.3)', borderRadius: '6px',
                            padding: '8px', color: 'white', fontSize: '11px', marginBottom: '16px',
                        }}
                    />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowLocalPopup(false)} style={{
                            background: 'transparent', border: '0.5px solid rgba(255,255,255,0.3)',
                            borderRadius: '6px', padding: '5px 14px', color: 'rgba(255,255,255,0.6)',
                            fontSize: '10px', cursor: 'pointer',
                        }}>Annuler</button>
                    </div>
                </div>
            )}

            {/* Popup — ajout flux URL */}
            {showAddPopup && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)', borderRadius: '12px',
                    padding: '20px', border: '1px solid rgba(198,162,76,0.5)', zIndex: 10000, minWidth: '280px',
                }}>
                    <div style={{ color: '#c6a24c', fontSize: '12px', marginBottom: '16px', fontWeight: 'bold' }}>
                        🔗 Ajouter un flux
                    </div>
                    <input type="text" placeholder="Nom de la radio" value={newStationName}
                        onChange={(e) => setNewStationName(e.target.value)} autoFocus style={{
                            width: '100%', background: 'rgba(255,255,255,0.1)',
                            border: '0.5px solid rgba(198,162,76,0.3)', borderRadius: '6px',
                            padding: '8px 10px', color: 'white', fontSize: '11px', marginBottom: '10px', outline: 'none',
                        }}
                    />
                    <input type="text" placeholder="URL du flux (mp3, aac, ogg)" value={newStationUrl}
                        onChange={(e) => setNewStationUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomStation()} style={{
                            width: '100%', background: 'rgba(255,255,255,0.1)',
                            border: '0.5px solid rgba(198,162,76,0.3)', borderRadius: '6px',
                            padding: '8px 10px', color: 'white', fontSize: '11px', marginBottom: '16px', outline: 'none',
                        }}
                    />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowAddPopup(false)} style={{
                            background: 'transparent', border: '0.5px solid rgba(255,255,255,0.3)',
                            borderRadius: '6px', padding: '5px 14px', color: 'rgba(255,255,255,0.6)',
                            fontSize: '10px', cursor: 'pointer',
                        }}>Annuler</button>
                        <button onClick={addCustomStation} style={{
                            background: 'rgba(198,162,76,0.2)', border: '0.5px solid #c6a24c',
                            borderRadius: '6px', padding: '5px 14px', color: '#c6a24c',
                            fontSize: '10px', cursor: 'pointer',
                        }}>Ajouter</button>
                    </div>
                </div>
            )}

            {/* Élément audio */}
            <audio ref={audioRef} src={currentStation.src}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            <style>{`
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none; width: 8px; height: 8px;
                    border-radius: 50%; background: #c6a24c; cursor: pointer;
                }
            `}</style>
        </div>
    );
}

export default RadioPlayer;
