export const TERRAIN_LABELS = {
    coastal:     { fr: 'Côtier 🌊',      en: 'Coastal 🌊'      },
    inland:      { fr: 'Continental 🏔',  en: 'Landlocked 🏔'   },
    island:      { fr: 'Insulaire 🏝',    en: 'Island 🏝'       },
    archipelago: { fr: 'Archipel ⛵',     en: 'Archipelago ⛵'  },
    highland:    { fr: 'Montagneux ⛰',   en: 'Highland ⛰'     },
    desert:      { fr: 'Désert 🏜',       en: 'Desert 🏜'       },
    foret:       { fr: 'Forêt 🌲',        en: 'Forest 🌲'       },
        tropical:    { fr: 'Tropical 🌴',     en: 'Tropical 🌴'     },
        toundra:     { fr: 'Toundra ❄',       en: 'Tundra ❄'       },
};

export const getTerrainLabel = (key, lang = 'fr') =>
TERRAIN_LABELS[key]?.[lang] ?? TERRAIN_LABELS[key]?.fr ?? key;
