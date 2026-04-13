// src/features/map/views/ExplorateurMonde.jsx
// Globe GeoJSON → Mercator → WarRoom — intégré à ARIA
// Props ARIA : countries, selectedCountry, onSelectCountry

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import Etoiles from '../components/Etoiles.jsx'
import { CURSEUR_POINTER } from '../../../shared/utils/curseurs.js'
import { RAYON } from '../../../shared/shaders/globe.js'
import { couleurNeon, couleurScan, mainlandDuPays, appliquerFusions } from '../../../shared/utils/geo.js'
import SceneGlobeMercator, { ResetCameraPlan } from '../components/scene/SceneGlobeMercator.jsx'
import SceneWarRoom from '../components/scene/SceneWarRoom.jsx'
import LigneScan from '../components/LigneScan.jsx'
import PAYS from '../../../shared/data/pays.json'

// Mapping id ARIA → NAME GeoJSON (ex: 'allemagne' → 'Germany')
const ID_VERS_GEONAME = Object.fromEntries(
  Object.entries(PAYS).map(([id, p]) => [id, p.NAME])
)
// Mapping inverse NAME GeoJSON → id ARIA
const GEONAME_VERS_ID = Object.fromEntries(
  Object.entries(PAYS).map(([id, p]) => [p.NAME, id])
)

const ui = {
  c:   { position:'absolute', inset:0, pointerEvents:'none', zIndex:100 },
  btn: { position:'absolute', top:'20px', left:'20px', pointerEvents:'all',
    padding:'8px 16px', background:'rgba(0,15,35,0.75)',
    border:'1px solid rgba(0,200,255,0.3)', borderRadius:'4px',
    color:'rgba(0,210,255,0.85)', cursor:CURSEUR_POINTER, fontSize:'0.88rem', fontFamily:'monospace', letterSpacing:'0.06em' },
  badge: { position:'absolute', top:'22px', left:'50%', transform:'translateX(-50%)',
    padding:'6px 18px', background:'rgba(0,10,25,0.8)', border:'1px solid', borderRadius:'3px',
    fontSize:'0.78rem', fontFamily:'monospace', letterSpacing:'0.2em', textTransform:'uppercase', whiteSpace:'nowrap' },
  ind: { position:'absolute', bottom:'28px', left:'50%', transform:'translateX(-50%)',
    color:'rgba(0,200,255,0.35)', fontSize:'0.78rem', fontFamily:'monospace',
    letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap', pointerEvents:'none' },
}

export function ExplorateurMonde({
  countries = [],
  selectedCountry = null,
  onSelectCountry = null,
  initialVue = 'globe',
  sansTransition = false,
}) {
  const [vue, setVue] = useState(initialVue)
  const [paysSurvolé, setPaysSurvolé] = useState(null)
  // Pays en focus local — set immédiatement au double-clic, sans attendre la prop parent
  const [paysFocusLocal, setPaysFocusLocal] = useState(null)
  const [geo110, setGeo110] = useState(null)
  const [geo50,  setGeo50]  = useState(null)
  const [geo10,  setGeo10]  = useState(null)

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    fetch(`${base}countries-110m.geo.json`).then(r => r.json()).then(setGeo110).catch(console.error)
    fetch(`${base}countries-50m.geo.json`).then(r => r.json()).then(setGeo50).catch(console.error)
    // geo10 (warroom haute résolution) — optionnel, peut être absent
    fetch(`${base}countries-10m.geo.json`).then(r => r.json()).then(setGeo10).catch(() => setGeo10(null))
  }, [])

  // Pays en focus : local (double-clic direct) en priorité, sinon selectedCountry prop
  const paysFocus = useMemo(() => {
    if (paysFocusLocal) return paysFocusLocal
    if (!selectedCountry?.realData?.id) return null
    return ID_VERS_GEONAME[selectedCountry.realData.id] ?? null
  }, [paysFocusLocal, selectedCountry])

  // Sync : si selectedCountry change depuis CountryPanel, on met à jour paysFocusLocal
  useEffect(() => {
    if (!selectedCountry?.realData?.id) return
    const geoName = ID_VERS_GEONAME[selectedCountry.realData.id]
    if (geoName) setPaysFocusLocal(geoName)
  }, [selectedCountry])

  const changerVue = useCallback((v) => {
    if (v === vue) return
    setVue(v)
    setPaysSurvolé(null)
  }, [vue])

  // Clic sur un pays en vue globe → surveiller
  const handleClickGlobe = useCallback((nomGeo) => {
    setPaysSurvolé(nomGeo)
  }, [])

  // Double-clic / entrée mercator → set local immédiat + sélection ARIA async
  const handleEntrerMercator = useCallback((nomGeo) => {
    if (!nomGeo) return
    setPaysFocusLocal(nomGeo)
    const ariaId = GEONAME_VERS_ID[nomGeo]
    const ariaCountry = ariaId
      ? countries.find(c => c.realData?.id === ariaId)
      : countries.find(c => c.nom === nomGeo)
    if (ariaCountry && onSelectCountry) onSelectCountry(ariaCountry)
    setVue('warroom')
    setPaysSurvolé(null)
  }, [countries, onSelectCountry])

  const estGlobe    = vue === 'globe'
  const estMercator = vue === 'mercator'
  const estWarRoom  = vue === 'warroom'

  const geoActuel = estMercator ? geo50 : geo110
  const cfg = paysFocus ? { NAME: paysFocus, mainland: mainlandDuPays(paysFocus) } : null
  const hexScan = paysFocus ? `#${couleurScan(paysFocus).getHexString()}` : '#00e5ff'

  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', backgroundColor:'#000' }}>
      {!estWarRoom && (
        <div style={{ width:'100%', height:'100%' }}
          onDoubleClick={estGlobe ? () => changerVue('mercator') : undefined}>
          <Canvas camera={{ position:[0, 0, RAYON*3], fov:45 }}>
            <color attach="background" args={['#020208']} />
            <ambientLight intensity={0.15} />
            <Etoiles />
            <ResetCameraPlan actif={estMercator} />
            <SceneGlobeMercator
              geoData={geoActuel}
              isPlanar={estMercator}
              paysSurvolé={paysSurvolé}
              onClickGlobe={handleClickGlobe}
              onSurvolMercator={setPaysSurvolé}
              onEntrerMercator={handleEntrerMercator}
              mercatorInstantane={sansTransition && initialVue === 'mercator'}
              fusionsActives={[]}
            />
          </Canvas>
        </div>
      )}

      {estWarRoom && cfg && (
        <>
          <Canvas camera={{ position:[0, 0, RAYON*3], fov:45 }}>
            <color attach="background" args={['#020208']} />
            <ambientLight intensity={0.1} />
            <Etoiles opacite={0.4} />
            <SceneWarRoom geoData={geo10 ?? geo50} cfg={cfg} />
          </Canvas>
          <LigneScan couleur={hexScan} />
        </>
      )}

      {/* UI overlay */}
      <div style={ui.c}>
        {estGlobe && (
          <>
            {paysSurvolé && (() => {
              const c = couleurNeon(paysSurvolé)
              const hex = `#${c.getHexString()}`
              const rgba = `rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},0.3)`
              return <div style={{ ...ui.badge, color:hex, borderColor:rgba }}>{paysSurvolé}</div>
            })()}
            <div style={ui.ind}>double-clic → planisphère · clic sur un pays pour le voir</div>
          </>
        )}

        {estMercator && (
          <>
            <button style={ui.btn} onClick={() => changerVue('globe')}>← Globe</button>
            <div style={ui.ind}>
              {paysSurvolé
                ? <><span style={{ color:'#00e5ff' }}>{paysSurvolé}</span>{' — double-clic pour entrer'}</>
                : 'clic → pays · double-clic → entrer'
              }
            </div>
          </>
        )}

        {estWarRoom && cfg && (
          <>
            <button style={ui.btn} onClick={() => changerVue('mercator')}>← Planisphère</button>
            <div style={{ ...ui.badge, color:'rgba(0,210,255,0.85)', borderColor:'rgba(0,200,255,0.3)' }}>
              ▶ {cfg.NAME} — WAR ROOM
            </div>
            <div style={ui.ind}>drag + molette</div>
          </>
        )}
      </div>
    </div>
  )
}
