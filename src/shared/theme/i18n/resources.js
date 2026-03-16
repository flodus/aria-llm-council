export const RESOURCE_DEFS = [
    { key: 'agriculture', icon: '🌾', label: { fr: 'AGRICULTURE', en: 'AGRICULTURE' } },
{ key: 'bois',        icon: '🪵', label: { fr: 'BOIS',        en: 'TIMBER'       } },
{ key: 'eau',         icon: '💧', label: { fr: 'EAU DOUCE',   en: 'FRESH WATER'  } },
{ key: 'energie',     icon: '⚡', label: { fr: 'ÉNERGIE',     en: 'ENERGY'       } },
{ key: 'mineraux',    icon: '💎', label: { fr: 'MINÉRAUX',    en: 'MINERALS'     } },
{ key: 'peche',       icon: '🐟', label: { fr: 'PÊCHE',       en: 'FISHING'      } },
{ key: 'petrole',     icon: '🛢️', label: { fr: 'PÉTROLE',     en: 'OIL'          } },
];

export const getResourceLabel = (key, lang = 'fr') => {
    const def = RESOURCE_DEFS.find(r => r.key === key);
    if (!def) return key.toUpperCase();
    return typeof def.label === 'object' ? (def.label[lang] ?? def.label.fr) : def.label;
};

export const getResourceDefs = (lang = 'fr') =>
RESOURCE_DEFS.map(r => ({
    ...r,
    label: typeof r.label === 'object' ? (r.label[lang] ?? r.label.fr) : r.label,
}));
