import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const WORLD_DIR = path.join(__dirname, 'world');
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// ── Helpers ──────────────────────────────────────────────────
const readJSON = (fp) => { try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; } };
const writeJSON = (fp, data) => { fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, JSON.stringify(data, null, 2)); };

// ── Slug ─────────────────────────────────────────────────────
function toSlug(name) {
    return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}
function uniqueSlug(name) {
    let slug = toSlug(name);
    let candidate = slug;
    let i = 1;
    while (fs.existsSync(path.join(WORLD_DIR, candidate))) {
        candidate = `${slug}_${i++}`;
    }
    return candidate;
}

// ── Static data ───────────────────────────────────────────────
const BASE_AGENTS = {
    presidency: {
        phare: { name: "Le Phare", symbol: "☉", subtitle: "Soleil · Volonté", essence: "Tu es Le Phare, Président de la Volonté. Tu incarnes la raison, la vision à long terme, la cohérence systémique. Tu décides depuis la tête.", weight: 1.0 },
        boussole: { name: "La Boussole", symbol: "☽", subtitle: "Lune · Âme", essence: "Tu es La Boussole, Présidente de l'Âme. Tu incarnes l'intuition collective, la mémoire du peuple, l'instinct de protection. Tu décides depuis le cœur.", weight: 1.0 }
    },
    ministers: {
        initiateur: { name: "L'Initiateur", sign: "Bélier", emoji: "♈", color: "#E05252", weight: 1.0, comm: "Brièveté, urgence, impulsion.", essence: "Tu es l'étincelle initiale. Tu inities, tu conquiers.", annotation: "Analyse l'urgence. Où faut-il agir maintenant ?" },
        gardien: { name: "Le Gardien", sign: "Taureau", emoji: "♉", color: "#C8A44A", weight: 1.0, comm: "Calme, réalisme, profondeur.", essence: "Tu es la racine et le fruit. Tu bâtis du solide.", annotation: "Analyse la durabilité. Avons-nous les réserves ?" },
        communicant: { name: "Le Communicant", sign: "Gémeaux", emoji: "♊", color: "#5BA3C9", weight: 1.0, comm: "Curiosité, légèreté, multiplicité.", essence: "Tu es le courant d'air. Tu lies les idées.", annotation: "Analyse la circulation." },
        protecteur: { name: "Le Protecteur", sign: "Cancer", emoji: "♋", color: "#4AA87A", weight: 1.0, comm: "Douceur, profondeur, mémoire.", essence: "Tu es la marée — tu reviens toujours.", annotation: "Analyse la sécurité intime." },
        ambassadeur: { name: "L'Ambassadeur", sign: "Lion", emoji: "♌", color: "#D4A017", weight: 1.0, comm: "Éclat, générosité, autorité.", essence: "Tu es le centre de gravité.", annotation: "Analyse le prestige." },
        analyste: { name: "L'Analyste", sign: "Vierge", emoji: "♍", color: "#7AB04A", weight: 1.0, comm: "Exactitude, modestie, logique.", essence: "Tu es le mécanisme de précision.", annotation: "Analyse la technique." },
        arbitre: { name: "L'Arbitre", sign: "Balance", emoji: "♎", color: "#9B7EC8", weight: 1.0, comm: "Nuance, élégance, diplomatie.", essence: "Tu es le miroir. Tu cherches l'harmonie.", annotation: "Analyse l'équité." },
        enqueteur: { name: "L'Enquêteur", sign: "Scorpion", emoji: "♏", color: "#C05050", weight: 1.0, comm: "Intensité, précision, mystère.", essence: "Tu es le volcan sous l'océan.", annotation: "Analyse le risque caché." },
        guide: { name: "Le Guide", sign: "Sagittaire", emoji: "♐", color: "#4A7EC8", weight: 1.0, comm: "Enthousiasme, hauteur, foi.", essence: "Tu es la flèche qui cherche l'horizon.", annotation: "Analyse la vision à 20 ans." },
        stratege: { name: "Le Stratège", sign: "Capricorne", emoji: "♑", color: "#8A8A8A", weight: 1.0, comm: "Sérieux, sobriété, ambition froide.", essence: "Tu es le sommet de la montagne.", annotation: "Analyse la structure à 50 ans." },
        inventeur: { name: "L'Inventeur", sign: "Verseau", emoji: "♒", color: "#4A9EC8", weight: 1.0, comm: "Originalité, détachement, décalage.", essence: "Tu es l'éclair de génie.", annotation: "Analyse l'innovation." },
        guerisseur: { name: "Le Guérisseur", sign: "Poissons", emoji: "♓", color: "#7A5EC8", weight: 1.0, comm: "Fluidité, compassion, profondeur.", essence: "Tu es l'océan infini.", annotation: "Analyse l'invisible." }
    },
    ministries: [
        { id: "justice", name: "Justice et Vérité", emoji: "⚖️", signs: "Balance – Scorpion", color: "#9B7EC8", mission: "Garantir l'équilibre des droits et la révélation des faits.", weight: 1.0, ministers: ["arbitre","enqueteur"] },
        { id: "economie", name: "Économie et Ressources", emoji: "💰", signs: "Taureau – Vierge", color: "#C8A44A", mission: "Assurer la pérennité matérielle.", weight: 1.0, ministers: ["gardien","analyste"] },
        { id: "defense", name: "Défense et Souveraineté", emoji: "⚔️", signs: "Bélier – Capricorne", color: "#C05050", mission: "Protéger l'intégrité du territoire.", weight: 1.0, ministers: ["initiateur","stratege"] },
        { id: "sante", name: "Santé et Protection Sociale", emoji: "🏥", signs: "Cancer – Poissons", color: "#4AA87A", mission: "Prendre soin du corps et de l'esprit.", weight: 1.0, ministers: ["protecteur","guerisseur"] },
        { id: "education", name: "Éducation et Élévation", emoji: "🎓", signs: "Gémeaux – Sagittaire", color: "#5BA3C9", mission: "Transmettre le savoir.", weight: 1.0, ministers: ["communicant","guide"] },
        { id: "ecologie", name: "Transition Écologique", emoji: "🌿", signs: "Verseau – Lion", color: "#5BAA5B", mission: "Gérer la survie de la biosphère.", weight: 1.0, ministers: ["inventeur","ambassadeur"] }
    ]
};

const DEFAULT_WORLD_STATES = [
    { id: "republique_ouest", nom: "République de l'Ouest", emoji: "🏛️", color: "#4A7EC8", regime: "Démocratie Parlementaire", inspiration: "France", annee: 2026, population: 68000000, popularite: 58, humeur: "Contestataire", humeur_score: 35, description: "Une démocratie traversant une crise de confiance profonde. Institutions solides, contestation sociale vive.", weights: { presidency_phare:1.0, presidency_boussole:1.0, ministry_justice:1.1, ministry_economie:1.2, ministry_defense:0.9, ministry_sante:1.1, ministry_education:1.0, ministry_ecologie:1.0 }, svgPath: "M 85,95 C 105,72 165,68 215,80 L 268,75 C 295,68 325,85 338,108 L 350,145 C 360,172 354,205 338,225 L 315,252 C 292,278 262,288 235,282 L 202,278 C 168,282 135,273 112,254 L 85,228 C 58,206 46,172 52,145 Z", x: 200, y: 175 },
{ id: "empire_est", nom: "Empire de l'Est", emoji: "🏯", color: "#C05050", regime: "Technocratie Autoritaire", inspiration: "Corée / Singapour", annee: 2026, population: 52000000, popularite: 74, humeur: "Discipliné", humeur_score: 68, description: "Structure hiérarchique stricte, efficacité maximale. Poids fort sur technologie et défense.", weights: { presidency_phare:1.4, presidency_boussole:0.7, ministry_justice:0.8, ministry_economie:1.5, ministry_defense:1.5, ministry_sante:1.0, ministry_education:1.3, ministry_ecologie:0.9 }, svgPath: "M 595,72 C 628,55 688,58 725,76 L 768,80 C 806,90 832,118 840,150 L 844,185 C 848,220 830,250 806,265 L 772,278 C 738,290 702,285 674,268 L 638,248 C 604,228 585,198 580,168 L 577,132 C 572,102 578,78 595,72 Z", x: 710, y: 172 },
{ id: "terra_nova", nom: "Terra Nova", emoji: "🌱", color: "#4AA87A", regime: "En construction", inspiration: "Pays neuf", annee: 2026, population: 2400000, popularite: 100, humeur: "Pionnier", humeur_score: 82, description: "Territoire vierge, tout reste à construire. Popularité maximale.", weights: { presidency_phare:1.0, presidency_boussole:1.0, ministry_justice:1.0, ministry_economie:1.0, ministry_defense:1.0, ministry_sante:1.0, ministry_education:1.0, ministry_ecologie:1.2 }, svgPath: "M 368,318 C 395,295 442,288 482,300 L 518,310 C 550,324 568,352 564,383 L 556,416 C 546,445 522,463 494,466 L 458,467 C 426,465 398,449 380,424 L 364,396 C 348,368 342,340 368,318 Z", x: 464, y: 378 }
];

const DEFAULT_ALLIANCES = [
    { pays_A: "republique_ouest", pays_B: "empire_est", type: "Tension" },
{ pays_A: "republique_ouest", pays_B: "terra_nova", type: "Alliance" },
{ pays_A: "empire_est", pays_B: "terra_nova", type: "Neutre" }
];

// ── Init ──────────────────────────────────────────────────────
function initData() {
    [DATA_DIR, WORLD_DIR, TEMPLATES_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));
    writeJSON(path.join(TEMPLATES_DIR, 'base_agents.json'), BASE_AGENTS);
    const wsPath = path.join(DATA_DIR, 'world_states.json');
    const existing = readJSON(wsPath);
    if (!existing || existing.length === 0) {
        writeJSON(wsPath, DEFAULT_WORLD_STATES);
        writeJSON(path.join(DATA_DIR, 'alliances.json'), DEFAULT_ALLIANCES);
        for (const w of DEFAULT_WORLD_STATES) {
            writeJSON(path.join(WORLD_DIR, w.id, 'config_agents.json'), BASE_AGENTS);
            writeJSON(path.join(WORLD_DIR, w.id, 'chronolog.json'), []);
        }
        console.log('✓ Données par défaut initialisées');
    }
}
initData();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// ── Claude proxy ──────────────────────────────────────────────
app.post('/api/claude', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify(req.body)
        });
        res.json(await r.json());
    } catch (e) { res.status(500).json({ error: { message: e.message } }); }
});

// ── RESET ─────────────────────────────────────────────────────
app.post('/api/reset', (req, res) => {
    try {
        if (fs.existsSync(WORLD_DIR)) {
            for (const entry of fs.readdirSync(WORLD_DIR)) {
                fs.rmSync(path.join(WORLD_DIR, entry), { recursive: true, force: true });
            }
        }
        writeJSON(path.join(DATA_DIR, 'world_states.json'), DEFAULT_WORLD_STATES);
        writeJSON(path.join(DATA_DIR, 'alliances.json'), DEFAULT_ALLIANCES);
        for (const w of DEFAULT_WORLD_STATES) {
            writeJSON(path.join(WORLD_DIR, w.id, 'config_agents.json'), BASE_AGENTS);
            writeJSON(path.join(WORLD_DIR, w.id, 'chronolog.json'), []);
        }
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── world_states ──────────────────────────────────────────────
app.get('/api/data/world_states', (req, res) => res.json(readJSON(path.join(DATA_DIR, 'world_states.json')) || []));
app.post('/api/data/world_states', (req, res) => { writeJSON(path.join(DATA_DIR, 'world_states.json'), req.body); res.json({ ok: true }); });

// ── alliances ─────────────────────────────────────────────────
app.get('/api/data/alliances', (req, res) => res.json(readJSON(path.join(DATA_DIR, 'alliances.json')) || []));
app.post('/api/data/alliances', (req, res) => { writeJSON(path.join(DATA_DIR, 'alliances.json'), req.body); res.json({ ok: true }); });

// ── world/:id ─────────────────────────────────────────────────
app.get('/api/world/:id/config', (req, res) => {
    const data = readJSON(path.join(WORLD_DIR, req.params.id, 'config_agents.json'));
    if (!data) return res.status(404).json({ error: 'not found' });
    res.json(data);
});
app.post('/api/world/:id/config', (req, res) => {
    writeJSON(path.join(WORLD_DIR, req.params.id, 'config_agents.json'), req.body);
    res.json({ ok: true });
});
app.get('/api/world/:id/chronolog', (req, res) => res.json(readJSON(path.join(WORLD_DIR, req.params.id, 'chronolog.json')) || []));
app.post('/api/world/:id/chronolog', (req, res) => {
    const fp = path.join(WORLD_DIR, req.params.id, 'chronolog.json');
    const existing = readJSON(fp) || [];
    existing.push(req.body);
    writeJSON(fp, existing);
    res.json({ ok: true });
});
app.delete('/api/world/:id/chronolog', (req, res) => {
    writeJSON(path.join(WORLD_DIR, req.params.id, 'chronolog.json'), []);
    res.json({ ok: true });
});

// ── create world ──────────────────────────────────────────────
app.post('/api/world/create', (req, res) => {
    const { nom, ...rest } = req.body;
    const id = uniqueSlug(nom);
    const worldDir = path.join(WORLD_DIR, id);
    fs.mkdirSync(worldDir, { recursive: true });
    writeJSON(path.join(worldDir, 'config_agents.json'), BASE_AGENTS);
    writeJSON(path.join(worldDir, 'chronolog.json'), []);
    res.json({ ok: true, id });
});

// ── templates ─────────────────────────────────────────────────
app.get('/api/templates/:name', (req, res) => res.json(readJSON(path.join(TEMPLATES_DIR, req.params.name + '.json')) || null));

app.listen(3001, '0.0.0.0', () => console.log('✓ ARIA v4 sur http://localhost:3001'));
