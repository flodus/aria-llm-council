export const fmtPop = (n, lang = 'fr') =>
n >= 1e9 ? (n/1e9).toFixed(1) + (lang === 'en' ? ' Bn' : ' Md')
: n >= 1e6 ? (n/1e6).toFixed(1) + ' M'
: n >= 1e3 ? Math.round(n/1e3) + ' k'
: String(n);

export const MARITIME = new Set(['coastal', 'island', 'archipelago']);
