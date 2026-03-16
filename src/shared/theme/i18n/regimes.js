export const REGIME_LABELS = {
    democratie_liberale:         { fr: 'Démocratie libérale 🗳️',          en: 'Liberal Democracy 🗳️'          },
    republique_federale:         { fr: 'République fédérale 🏛️',           en: 'Federal Republic 🏛️'           },
    monarchie_constitutionnelle: { fr: 'Monarchie constitutionnelle 👑',   en: 'Constitutional Monarchy 👑'    },
    monarchie_absolue:           { fr: 'Monarchie absolue 👑',             en: 'Absolute Monarchy 👑'          },
    technocratie_ia:             { fr: 'Technocratie IA 🤖',               en: 'ARIA Technocracy 🤖'           },
    oligarchie:                  { fr: 'Oligarchie 💼',                    en: 'Oligarchy 💼'                  },
    junte_militaire:             { fr: 'Junte militaire 🎖️',               en: 'Military Junta 🎖️'             },
    regime_autoritaire:          { fr: 'Régime autoritaire 🔒',            en: 'Authoritarian Regime 🔒'       },
    theocracie:                  { fr: 'Théocratie 🕌',                    en: 'Theocracy 🕌'                  },
    communisme:                  { fr: 'Parti communiste ☭',               en: 'Communist Party ☭'             },
    nationalisme_autoritaire:    { fr: 'Nationalisme autoritaire ⚡',      en: 'Authoritarian Nationalism ⚡'  },
    democratie_directe:          { fr: 'Démocratie directe 🗳️',            en: 'Direct Democracy 🗳️'           },
};

export const getRegimeLabel = (key, lang = 'fr') =>
REGIME_LABELS[key]?.[lang] ?? REGIME_LABELS[key]?.fr ?? key;
