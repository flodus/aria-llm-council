// src/features/settings/components/SectionSimulation.jsx
// SECTION SIMULATION — Régimes, seuils critiques, terrains, ressources

import { useState } from 'react';
import { useLocale } from '../../../ariaI18n';
import { getRegimeLabel, getTerrainLabel } from '../../../shared/data/worldLabels';
import {
    getStats, getOptions, saveOptions,
    REGIMES, TERRAINS, CYCLES_CFG,
} from '../../../Dashboard_p1';
import { SectionTitle, Field, NumberInput, Toggle, SaveBadge } from '../ui/SettingsUI';
import { useAccordion } from '../hooks/useAccordion';

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITAIRES LOCAUX
// ─────────────────────────────────────────────────────────────────────────────

function getSimOverrides() {
    try { return JSON.parse(localStorage.getItem('aria_sim') || '{}'); } catch { return {}; }
}

function saveSimOverrides(s) {
    try { localStorage.setItem('aria_sim', JSON.stringify(s)); } catch {}
}

export default function SectionSimulation() {
    const { lang } = useLocale();
    const isEn = lang === 'en';
    const [sim, setSim]   = useState(() => getSimOverrides());
    const [opts, setOpts] = useState(() => getOptions());
    const [saved, setSaved] = useState(false);
    const { ouvert: openAcc, basculer: toggleAcc } = useAccordion();

    // Terrains localisés (réactif à la langue)
    const dynTerrains = getStats().terrains;

    // Valeurs courantes avec fallback JSON
    const getReg = (regKey, field) => sim.regimes?.[regKey]?.[field] ?? REGIMES?.[regKey]?.[field] ?? 1.0;
    const getSeuil = (key) => sim.seuils?.[key] ?? CYCLES_CFG?.[key] ?? 20;
    const getTerrain = (terrainKey, subKey) => sim.terrains?.[terrainKey]?.[subKey] ?? TERRAINS?.[terrainKey]?.[subKey] ?? 1.0;

    const updateSim = (path, val) => {
        setSim(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const parts = path.split('.');
            let obj = next;
            parts.slice(0, -1).forEach(k => { if (!obj[k]) obj[k] = {}; obj = obj[k]; });
            obj[parts[parts.length - 1]] = val;
            return next;
        });
        setSaved(false);
    };

    const updateOpts = (key, val) => {
        setOpts(prev => ({ ...prev, gameplay: { ...prev.gameplay, [key]: val } }));
        setSaved(false);
    };

    const save = () => {
        saveSimOverrides(sim);
        saveOptions(opts);
        setSaved(true);
    };

    const HDR = (key, label, badge) => (
        <button className="aria-accordion__hdr" onClick={() => toggleAcc(key)}>
        <span className="aria-accordion__arrow">{openAcc===key?'▾':'▸'}</span>
        <span className="aria-accordion__label">{label}</span>
        {badge && <span className="aria-accordion__badge">{badge}</span>}
        </button>
    );

    return (
        <div className="settings-section-body">
        <SectionTitle icon="🎲" label={isEn?"SIMULATION":"SIMULATION"} sub={isEn?"Regimes, critical thresholds, cycle speed, resources":"Régimes, seuils critiques, vitesse des cycles, ressources"} />

        {/* ▸ SEUILS CRITIQUES */}
        <div className={`aria-accordion${openAcc==='seuils' ? ' open' : ''}`}>
        {HDR('seuils', isEn?'CRITICAL THRESHOLDS':'SEUILS CRITIQUES')}
        {openAcc==='seuils' && (
            <div className="aria-accordion__body">
            <Field label={isEn?"Revolt threshold (satisfaction %)":"Seuil de révolte (satisfaction %)"}
            hint={isEn?"Below this threshold, a revolt is triggered":"En dessous de ce seuil, une révolte est déclenchée"}>
            <NumberInput value={getSeuil('seuil_revolte')}
            onChange={v => updateSim('seuils.seuil_revolte', v)} min={5} max={40} />
            </Field>
            <Field label={isEn?"Demographic explosion threshold (×%)":"Seuil explosion démographique (×%)"}
            hint={isEn?"If population × factor / 100 in a cycle, crisis triggered":"Si la population × ce facteur / 100 en un cycle, crise déclenchée"}>
            <NumberInput value={getSeuil('seuil_crise_demo')}
            onChange={v => updateSim('seuils.seuil_crise_demo', v)} min={110} max={300} step={10} />
            </Field>
            <Field label={isEn?"Max random noise (satisfaction ±)":"Bruit aléatoire max (satisfaction ±)"}
            hint={isEn?"Random amplitude in each cycle":"Amplitude du hasard dans chaque cycle"}>
            <NumberInput value={getSeuil('bruit_max')}
            onChange={v => updateSim('seuils.bruit_max', v)} min={0} max={10} />
            </Field>
            <Field label={isEn?"AI narrative events":"Événements narratifs IA"}
            hint={isEn?"AI narrates each critical threshold breach":"L'IA génère un récit à chaque événement critique"}>
            <Toggle value={opts.gameplay.events_ia}
            onChange={v => updateOpts('events_ia', v)}
            label={opts.gameplay.events_ia ? (isEn?'Enabled':'Activés') : (isEn?'Disabled':'Désactivés')} />
            </Field>
            </div>
        )}
        </div>

        {/* ▸ COEFFICIENTS DES RÉGIMES */}
        <div className={`aria-accordion${openAcc==='regimes' ? ' open' : ''}`}>
        {HDR('regimes', isEn?'REGIME COEFFICIENTS':'COEFFICIENTS DES RÉGIMES', `${Object.keys(getStats().regimes || {}).length}`)}
        {openAcc==='regimes' && (
            <div className="aria-accordion__body">
            {Object.keys(getStats().regimes || {}).map(rk => {
                const coeff_sat  = getReg(rk, 'coeff_satisfaction');
                const coeff_cro  = getReg(rk, 'coeff_croissance');
                const natalite   = getReg(rk, 'taux_natalite');
                const mortalite  = getReg(rk, 'taux_mortalite');
                const fmt = (v) => Number(v).toFixed(2);
                const col = (v) => v > 1 ? 'rgba(100,200,120,0.85)' : v < 1 ? 'rgba(220,100,100,0.85)' : 'rgba(200,164,74,0.70)';
                return (
                    <div key={rk} style={{
                        marginBottom: '0.9rem',
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(200,164,74,0.10)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                    }}>
                    {/* Header régime */}
                    <div style={{
                        padding: '0.40rem 0.75rem',
                        background: 'rgba(200,164,74,0.05)',
                        borderBottom: '1px solid rgba(200,164,74,0.10)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.50rem', letterSpacing: '0.14em',
                        color: 'rgba(200,164,74,0.80)',
                    }}>
                    {getRegimeLabel(rk, lang)}
                    </div>
                    {/* Séparateur */}
                    <div style={{ padding: '0.55rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {[
                        { key: 'coeff_satisfaction', label: isEn?'SATISFACTION':'SATISFACTION', val: coeff_sat,
                            hint: isEn?'Satisfaction drift per cycle':'Dérive de satisfaction par cycle' },
                            { key: 'coeff_croissance',   label: isEn?'GROWTH':'CROISSANCE',   val: coeff_cro,
                                hint: isEn?'Demographic and economic yield':'Rendement démographique et économique' },
                                { key: 'taux_natalite',      label: isEn?'BIRTH RATE':'NATALITÉ',     val: natalite,
                                    hint: isEn?'Base birth rate (‰)':'Taux de natalité de base (‰)' },
                        { key: 'taux_mortalite',     label: isEn?'DEATH RATE':'MORTALITÉ',    val: mortalite,
                            hint: isEn?'Base death rate (‰)':'Taux de mortalité de base (‰)' },
                    ].map(({ key, label, val, hint }) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.44rem', letterSpacing: '0.10em',
                            color: 'rgba(140,160,200,0.55)', width: '90px', flexShrink: 0,
                        }}>◈ {label}</span>
                        <div style={{
                            flex: 1, height: '1px',
                            background: 'rgba(200,164,74,0.12)',
                        }} />
                        <input
                        type="number" step="0.01"
                        value={fmt(val)}
                        onChange={e => updateSim(`regimes.${rk}.${key}`, parseFloat(e.target.value))}
                        style={{
                            width: '58px', background: 'rgba(0,0,0,0.35)',
                                                          border: '1px solid rgba(200,164,74,0.18)', borderRadius: '2px',
                                                          color: col(val),
                                                          fontFamily: "'JetBrains Mono', monospace",
                                                          fontSize: '0.52rem', fontWeight: 600,
                                                          padding: '0.18rem 0.35rem', textAlign: 'right',
                                                          outline: 'none',
                        }}
                        />
                        </div>
                    ))}
                    </div>
                    </div>
                );
            })}
            </div>
        )}
        </div>

        {/* ▸ RESSOURCES PAR TERRAIN */}
        <div className={`aria-accordion${openAcc==='terrains' ? ' open' : ''}`}>
        {HDR('terrains', isEn?'RESOURCES BY TERRAIN':'RESSOURCES PAR TERRAIN',
            `${Object.keys(dynTerrains || TERRAINS || {}).length}`)}
            {openAcc==='terrains' && (
                <div className="aria-accordion__body">
                {Object.entries(dynTerrains || TERRAINS || {}).map(([tk, tv]) => (
                    <div key={tk} className="settings-terrain-block">
                    <div className="settings-terrain-name">{getTerrainLabel(tk, lang)}</div>
                    <Field label={isEn?"Population modifier":"Modificateur population"}>
                    <NumberInput step={0.05}
                    value={getTerrain(tk, 'modificateur_pop')}
                    onChange={v => updateSim(`terrains.${tk}.modificateur_pop`, v)}
                    min={0.5} max={2.0} />
                    </Field>
                    <Field label={isEn?"Economy modifier":"Modificateur économie"}>
                    <NumberInput step={0.05}
                    value={getTerrain(tk, 'modificateur_eco')}
                    onChange={v => updateSim(`terrains.${tk}.modificateur_eco`, v)}
                    min={0.5} max={2.0} />
                    </Field>
                    </div>
                ))}
                </div>
            )}
            </div>

            <div className="settings-footer">
            <button className="settings-save-btn" onClick={save}>{isEn?"Save":"Sauvegarder"}</button>
            <SaveBadge saved={saved} />
            <div style={{ flex:1 }} />
            <span style={{ fontFamily:"'JetBrains Mono',monospace", display:'flex', flexDirection:'column', alignItems:'center', gap:'0.05rem' }}>
            <span style={{ fontSize:'0.52rem', letterSpacing:'0.10em', color:'rgba(200,164,74,0.68)', textTransform:'uppercase' }}>DÉMO</span>
            <span style={{ fontSize:'0.46rem', color:'rgba(140,160,200,0.65)', fontWeight:'normal', letterSpacing:'0.04em' }}>
            {isEn ? "autonomous mode" : "mode autonome d'ARIA"}
            </span>
            </span>
            <Toggle value={opts.gameplay.cycles_auto}
            onChange={v => updateOpts('cycles_auto', v)} />
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.46rem',
                color:'rgba(160,180,220,0.55)', letterSpacing:'0.06em',
            minWidth:'5rem', display:'inline-block' }}>
            {opts.gameplay.cycles_auto ? (isEn?'Enabled':'Activé') : (isEn?'Disabled':'Désactivé')}
            </span>
            </div>
            {opts.gameplay.cycles_auto && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.5rem', padding:'0.3rem 0.65rem 0.5rem' }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.46rem',
                    color:'rgba(140,160,200,0.65)', letterSpacing:'0.06em' }}>
                    {isEn ? "Interval between cycles (s)" : "Intervalle entre les cycles (s)"}
                    </span>
                    <NumberInput value={opts.gameplay.cycles_interval}
                    onChange={v => updateOpts('cycles_interval', v)} min={5} max={300} step={5}
                    style={{ width:`${String(opts.gameplay.cycles_interval ?? 30).length + 5}ch`, padding:'0.2rem 0.3rem' }} />
                    </div>
            )}
            </div>
    );
}
