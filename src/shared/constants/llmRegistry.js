// ── Registry LLM — source de vérité partagée ─────────────────────────────
// Le Gist public est la source de vérité : éditer le Gist pour ajouter un
// modèle sans redéployer. Fallback local si offline ou Gist non configuré.
//
// Pour activer le registry distant :
//   1. Créer un Gist public sur github.com avec un fichier llm-registry.json
//      (même format que ARIA_FALLBACK_MODELS ci-dessous)
//   2. Remplacer REPLACE_WITH_YOUR_GIST_ID par l'ID du Gist dans l'URL

export const ARIA_REGISTRY_URL = 'https://gist.githubusercontent.com/flodus/REPLACE_WITH_YOUR_GIST_ID/raw/llm-registry.json';

export const ARIA_FALLBACK_MODELS = {
  openrouter: [
    { id:'anthropic/claude-sonnet-4-5',     label:'Claude Sonnet 4.5 ★' },
    { id:'anthropic/claude-haiku-4-5',      label:'Claude Haiku 4.5' },
    { id:'google/gemini-2.0-flash',         label:'Gemini 2.0 Flash ★' },
    { id:'google/gemini-2.5-pro-preview',   label:'Gemini 2.5 Pro' },
    { id:'x-ai/grok-3-mini',               label:'Grok 3 Mini ★' },
    { id:'openai/gpt-4.1-mini',             label:'GPT-4.1 Mini ★' },
    { id:'meta-llama/llama-4-scout',        label:'Llama 4 Scout' },
    { id:'mistralai/mistral-small-3.1',     label:'Mistral Small 3.1' },
  ],
  claude: [
    { id:'claude-sonnet-4-6',              label:'Sonnet 4.6 ★' },
    { id:'claude-haiku-4-5-20251001',      label:'Haiku 4.5' },
    { id:'claude-opus-4-6',               label:'Opus 4.6' },
  ],
  gemini: [
    { id:'gemini-2.0-flash',               label:'2.0 Flash ★' },
    { id:'gemini-2.5-pro-preview-05-06',   label:'2.5 Pro Preview' },
    { id:'gemini-1.5-pro',                 label:'1.5 Pro' },
  ],
  grok: [
    { id:'grok-3-mini', label:'Grok 3 Mini ★' },
    { id:'grok-3',      label:'Grok 3' },
  ],
  openai: [
    { id:'gpt-4.1-mini', label:'GPT-4.1 Mini ★' },
    { id:'gpt-4.1',      label:'GPT-4.1' },
    { id:'o4-mini',      label:'o4-mini' },
  ],
};
