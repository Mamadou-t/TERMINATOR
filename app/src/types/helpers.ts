import type { NiveauPouvoirInteret, PartiePrenante, Projet, Wbs } from './entities';

export const scoreToNiveau = (score: number): NiveauPouvoirInteret => {
  if (score <= 2) return 'Faible';
  if (score <= 3) return 'Moyen';
  return 'Élevé';
};

export const niveauToScore = (niveau: NiveauPouvoirInteret): number => {
  if (niveau === 'Faible') return 2;
  if (niveau === 'Moyen') return 3;
  return 5;
};

/** Sépare "Nom — Organisation" stocké dans nom_entite */
export const splitNomEntite = (nom_entite: string): { nom: string; organisation: string } => {
  const parts = nom_entite.split(' — ');
  if (parts.length >= 2) {
    return { nom: parts[0].trim(), organisation: parts.slice(1).join(' — ').trim() };
  }
  return { nom: nom_entite.trim(), organisation: '' };
};

export const joinNomEntite = (nom: string, organisation: string): string => {
  const n = nom.trim();
  const o = organisation.trim();
  return o ? `${n} — ${o}` : n;
};

/** Parse exigences stockées en texte structuré */
export const parseExigences = (exigences: string) => {
  const lines = exigences.split('\n').map(l => l.trim()).filter(Boolean);
  const email = lines.find(l => l.startsWith('email:'))?.replace('email:', '').trim() || '';
  const telephone = lines.find(l => l.startsWith('tel:'))?.replace('tel:', '').trim() || '';
  const attentesList = lines
    .filter(l => l.startsWith('- '))
    .map(l => l.replace('- ', '').trim());
  return { email, telephone, attentesList };
};

export const formatExigences = (email: string, telephone: string, statut?: string, attentesList: string[] = []): string => {
  const parts: string[] = [];
  if (email) parts.push(`email: ${email}`);
  if (telephone) parts.push(`tel: ${telephone}`);
  if (statut) parts.push(`statut: ${statut}`);
  attentesList.forEach(a => parts.push(`- ${a}`));
  return parts.join('\n');
};

export const parseStatut = (exigences: string): string => {
  return exigences.split('\n').find(l => l.startsWith('statut:'))?.replace('statut:', '').trim() || 'Neutre';
};

export const generateStakeholderColor = (pp: Pick<PartiePrenante, 'nom_entite' | 'role' | 'attentes' | 'exigences' | 'pouvoir' | 'interet' | 'strategie_engagement'>): string => {
  const seed = [
    pp.nom_entite,
    pp.role,
    pp.attentes,
    pp.exigences,
    pp.pouvoir,
    pp.interet,
    pp.strategie_engagement
  ].join('|').toLowerCase();

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const hue = hash % 360;
  const saturation = 48 + (hash % 22);
  const lightness = 34 + ((hash >> 8) % 16);

  const sNorm = saturation / 100;
  const lNorm = lightness / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0, g = 0, b = 0;
  if (hue < 60) { r = c; g = x; }
  else if (hue < 120) { r = x; g = c; }
  else if (hue < 180) { g = c; b = x; }
  else if (hue < 240) { g = x; b = c; }
  else if (hue < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export const getNextWbsCode = (parent: Wbs, siblings: Wbs[]): string => {
  const children = siblings.filter(w => w.id_wbs_1 === parent.id_wbs);
  let maxSuffix = 0;
  for (const child of children) {
    const parts = child.code_wbs.split('.');
    const last = parseInt(parts[parts.length - 1], 10);
    if (Number.isFinite(last)) maxSuffix = Math.max(maxSuffix, last);
  }
  return `${parent.code_wbs}.${maxSuffix + 1}`;
};

export const buildWbsTree = (items: Wbs[], parentId?: string): Wbs[] =>
  items
    .filter(w => (parentId ? w.id_wbs_1 === parentId : !w.id_wbs_1))
    .sort((a, b) => a.code_wbs.localeCompare(b.code_wbs, undefined, { numeric: true }));

export const buildProjetTree = (items: Projet[], parentId?: string): Projet[] =>
  items
    .filter(p => (parentId ? p.id_projet_1 === parentId : !p.id_projet_1))
    .sort((a, b) => a.nom_projet.localeCompare(b.nom_projet, undefined, { numeric: true }));

const NIVEAU_RISQUE_SCORE: Record<string, number> = {
  'Très Faible': 1, Faible: 2, Moyen: 3, Élevé: 4, 'Très Élevé': 5
};
const SCORE_NIVEAU_RISQUE: Record<number, string> = {
  1: 'Très Faible', 2: 'Faible', 3: 'Moyen', 4: 'Élevé', 5: 'Très Élevé'
};

/** Convertit un niveau texte (probabilité ou impact) vers l'échelle 1-5 attendue par le backend. */
export const niveauRisqueToScore = (niveau: string): number => NIVEAU_RISQUE_SCORE[niveau] || 3;

/** Convertit l'échelle 1-5 renvoyée par le backend vers le libellé texte affiché. */
export const scoreToNiveauRisque = (score: number): string => SCORE_NIVEAU_RISQUE[score] || 'Moyen';

export const riskScoreFromLabels = (prob: string, impact: string): number =>
  niveauRisqueToScore(prob) * niveauRisqueToScore(impact);
