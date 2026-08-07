import { apiRequest } from '../lib/api';
import { mapCharte, mapLigneBudgetaire, mapLigneCalendrier, mapLivrable, mapPartiePrenante, mapProjet } from './mappers';
import type { Charte, LigneBudgetaire, LigneCalendrier, Livrable, PartiePrenante, Projet, ProjetData } from '../types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isBackendId = (id: string | undefined | null): boolean => !!id && UUID_RE.test(id);

const asList = <T>(payload: { results?: T[] } | T[] | null | undefined): T[] => {
  if (Array.isArray(payload)) return payload;
  return payload?.results ?? [];
};

// ===== PROJET =====

const projetPayload = (projet: Projet) => ({
  nom_projet: projet.nom_projet,
  code_projet: projet.code_projet,
  description_projet: projet.description_projet || '',
  date_creation: projet.date_creation,
  date_debut_prevue: projet.date_debut_prevue || projet.date_creation,
  date_fin_prevue: projet.date_fin_prevue || projet.date_creation,
  statut_projet: projet.statut_projet,
  budget_total: projet.budget_total ?? 0,
  projet_parent: projet.id_projet_1 || null
});

export const listerProjets = async (): Promise<Projet[]> => {
  const payload = await apiRequest<{ results?: unknown[] } | unknown[]>('/projets/');
  return asList(payload as { results?: unknown[] } | unknown[]).map((entry) => mapProjet(entry as Record<string, unknown>));
};

export const creerOuMajProjet = async (projet: Projet): Promise<Projet> => {
  const payload = projetPayload(projet);
  const result = isBackendId(projet.id_projet)
    ? await apiRequest<Record<string, unknown>>(`/projets/${projet.id_projet}/`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await apiRequest<Record<string, unknown>>('/projets/', { method: 'POST', body: JSON.stringify(payload) });
  return mapProjet(result);
};

export const lierCharteAuProjet = async (projetId: string, charteId: string): Promise<void> => {
  await apiRequest(`/projets/${projetId}/`, { method: 'PATCH', body: JSON.stringify({ charte: charteId }) });
};

export const obtenirProjet = async (projetId: string): Promise<Projet | null> => {
  if (!isBackendId(projetId)) return null;
  try {
    const result = await apiRequest<Record<string, unknown>>(`/projets/${projetId}/`);
    return mapProjet(result);
  } catch {
    return null;
  }
};

export const supprimerProjet = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/projets/${id}/`, { method: 'DELETE' });
};

// ===== CHARTE =====

const chartePayload = (charte: Charte) => ({
  nom_charte: charte.nom_charte || 'Charte du projet',
  description_charte: charte.description_charte || '',
  probleme_opportunite: charte.probleme_opportunite || '',
  justification_projet: charte.justification_projet || '',
  statut_charte: charte.statut_charte || 'Brouillon',
  date_approbation: charte.date_approbation || null,
  commentaires_approbation: charte.commentaires_approbation || '',
  version_charte: charte.version_charte || '1.0',
  alignement_strategique: charte.alignement_strategique || '',
  localisation: charte.localisation || '',
  type_projet: charte.type_projet || '',
  sponsor_ouvrage: charte.sponsor_ouvrage || '',
  chef_projet: charte.chef_projet || '',
  objectif_general: charte.objectif_general || '',
  objectifs_specifiques: charte.objectifs_specifiques || '',
  signature_image: charte.signature_image || '',
  signataire_nom: charte.signataire_nom || '',
  signataire_role: charte.signataire_role || ''
});

export const creerOuMajCharte = async (charte: Charte, projetId: string): Promise<Charte> => {
  const payload = chartePayload(charte);

  if (isBackendId(charte.id_charte)) {
    const result = await apiRequest<Record<string, unknown>>(`/chartes/${charte.id_charte}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return mapCharte(result);
  }

  const created = await apiRequest<Record<string, unknown>>('/chartes/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const charteResult = mapCharte(created);
  if (isBackendId(projetId)) {
    await lierCharteAuProjet(projetId, charteResult.id_charte);
  }
  return charteResult;
};

export const obtenirCharte = async (charteId: string | undefined | null): Promise<Charte | null> => {
  if (!isBackendId(charteId)) return null;
  try {
    const result = await apiRequest<Record<string, unknown>>(`/chartes/${charteId}/`);
    return mapCharte(result);
  } catch {
    return null;
  }
};

// ===== LIGNES BUDGETAIRES PREVISIONNELLES =====

const lignePayload = (ligne: LigneBudgetaire, charteId: string) => ({
  designation: ligne.designation || '',
  prix_unitaire: ligne.prix_unitaire ?? 0,
  quantite: ligne.quantite ?? 0,
  ordre: ligne.ordre ?? 0,
  charte: charteId
});

export const listerLignesBudgetaires = async (charteId: string): Promise<LigneBudgetaire[]> => {
  if (!isBackendId(charteId)) return [];
  const payload = await apiRequest<{ results?: unknown[] } | unknown[]>(`/chartes/lignes-budgetaires/?charte=${charteId}`);
  return asList(payload as { results?: unknown[] } | unknown[]).map((entry) => mapLigneBudgetaire(entry as Record<string, unknown>));
};

export const sauverLigneBudgetaire = async (ligne: LigneBudgetaire, charteId: string): Promise<LigneBudgetaire> => {
  const payload = lignePayload(ligne, charteId);
  const result = isBackendId(ligne.id_ligne)
    ? await apiRequest<Record<string, unknown>>(`/chartes/lignes-budgetaires/${ligne.id_ligne}/`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await apiRequest<Record<string, unknown>>('/chartes/lignes-budgetaires/', { method: 'POST', body: JSON.stringify(payload) });
  return mapLigneBudgetaire(result);
};

export const supprimerLigneBudgetaire = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/chartes/lignes-budgetaires/${id}/`, { method: 'DELETE' });
};

// ===== LIGNES CALENDRIER PREVISIONNEL =====

const calendrierPayload = (ligne: LigneCalendrier, charteId: string) => ({
  phase: ligne.phase || '',
  duree: ligne.duree || '',
  date_debut: ligne.date_debut || null,
  date_fin: ligne.date_fin || null,
  activites_cles: ligne.activites_cles || '',
  ordre: ligne.ordre ?? 0,
  charte: charteId
});

export const listerLignesCalendrier = async (charteId: string): Promise<LigneCalendrier[]> => {
  if (!isBackendId(charteId)) return [];
  const payload = await apiRequest<{ results?: unknown[] } | unknown[]>(`/chartes/lignes-calendrier/?charte=${charteId}`);
  return asList(payload as { results?: unknown[] } | unknown[]).map((entry) => mapLigneCalendrier(entry as Record<string, unknown>));
};

export const sauverLigneCalendrier = async (ligne: LigneCalendrier, charteId: string): Promise<LigneCalendrier> => {
  const payload = calendrierPayload(ligne, charteId);
  const result = isBackendId(ligne.id_ligne)
    ? await apiRequest<Record<string, unknown>>(`/chartes/lignes-calendrier/${ligne.id_ligne}/`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await apiRequest<Record<string, unknown>>('/chartes/lignes-calendrier/', { method: 'POST', body: JSON.stringify(payload) });
  return mapLigneCalendrier(result);
};

export const supprimerLigneCalendrier = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/chartes/lignes-calendrier/${id}/`, { method: 'DELETE' });
};

// ===== LIVRABLES =====

const livrablePayload = (livrable: Livrable, projetId: string) => ({
  nom_livrable: livrable.nom_livrable,
  description_livrable: livrable.description_livrable || '',
  type_livrable: livrable.type_livrable || 'Autre',
  date_livraison_prevue: livrable.date_livraison_prevue || new Date().toISOString().slice(0, 10),
  date_livraison_reelle: livrable.date_livraison_reelle || null,
  statut_livrable: livrable.statut_livrable || 'Planifié',
  projet: projetId
});

export const listerLivrables = async (projetId: string): Promise<Livrable[]> => {
  const payload = await apiRequest<{ results?: unknown[] } | unknown[]>(`/livrables/?projet=${projetId}`);
  return asList(payload as { results?: unknown[] } | unknown[]).map((entry) => mapLivrable(entry as Record<string, unknown>));
};

export const sauverLivrable = async (livrable: Livrable, projetId: string): Promise<Livrable> => {
  const payload = livrablePayload(livrable, projetId);
  const result = isBackendId(livrable.id_livrable)
    ? await apiRequest<Record<string, unknown>>(`/livrables/${livrable.id_livrable}/`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await apiRequest<Record<string, unknown>>('/livrables/', { method: 'POST', body: JSON.stringify(payload) });
  return mapLivrable(result);
};

export const supprimerLivrable = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/livrables/${id}/`, { method: 'DELETE' });
};

// ===== PARTIES PRENANTES =====

const partiePrenantePayload = (pp: PartiePrenante) => ({
  nom_entite: pp.nom_entite,
  role: pp.role || '',
  attentes: pp.attentes || '',
  exigences: pp.exigences || '',
  pouvoir: pp.pouvoir,
  interet: pp.interet,
  strategie_engagement: pp.strategie_engagement || '',
  droits_acces: pp.droits_acces || [],
  raci: pp.raci || {},
  signature_image: pp.signature_image || ''
});

export const listerPartiesPrenantes = async (projetId: string): Promise<PartiePrenante[]> => {
  const liens = await apiRequest<{ results?: Array<{ partie_prenante: string }> } | Array<{ partie_prenante: string }>>(
    `/parties-prenantes/impliquer/?projet=${projetId}`
  );
  const rows = asList(liens);
  const parties = await Promise.all(
    rows.map((lien) => apiRequest<Record<string, unknown>>(`/parties-prenantes/${lien.partie_prenante}/`))
  );
  return parties.map(mapPartiePrenante);
};

export const sauverPartiePrenante = async (pp: PartiePrenante, projetId: string): Promise<PartiePrenante> => {
  const payload = partiePrenantePayload(pp);

  if (isBackendId(pp.id_partie_prenante)) {
    const result = await apiRequest<Record<string, unknown>>(`/parties-prenantes/${pp.id_partie_prenante}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return mapPartiePrenante(result);
  }

  const created = await apiRequest<Record<string, unknown>>('/parties-prenantes/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const createdPp = mapPartiePrenante(created);
  if (isBackendId(projetId)) {
    await apiRequest('/parties-prenantes/impliquer/', {
      method: 'POST',
      body: JSON.stringify({ projet: projetId, partie_prenante: createdPp.id_partie_prenante })
    });
  }
  return createdPp;
};

export const supprimerPartiePrenante = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/parties-prenantes/${id}/`, { method: 'DELETE' });
};

// ===== CHARGEMENT COMPLET (Démarrage) =====

/**
 * Charge projet + charte + livrables + parties prenantes depuis le vrai backend.
 * Le reste de ProjetData (wbs, activites, risques, couts, ressources,
 * approvisionnements — hors périmètre Démarrage) provient du fallback fourni.
 */
export const chargerDonneesDemarrage = async (projetId: string, fallback: ProjetData): Promise<ProjetData> => {
  const projet = await obtenirProjet(projetId);
  if (!projet) return fallback;

  const [charte, livrables, partiesPrenantes] = await Promise.all([
    obtenirCharte(projet.id_charte),
    listerLivrables(projetId).catch(() => fallback.livrables),
    listerPartiesPrenantes(projetId).catch(() => fallback.partiesPrenantes)
  ]);

  const [lignesBudgetaires, lignesCalendrier] = charte
    ? await Promise.all([
        listerLignesBudgetaires(charte.id_charte).catch(() => fallback.lignesBudgetaires),
        listerLignesCalendrier(charte.id_charte).catch(() => fallback.lignesCalendrier)
      ])
    : [fallback.lignesBudgetaires, fallback.lignesCalendrier];

  return {
    ...fallback,
    projet,
    charte: charte || fallback.charte,
    lignesBudgetaires,
    lignesCalendrier,
    livrables,
    partiesPrenantes,
    impliquer: partiesPrenantes.map((pp) => ({ id_projet: projetId, id_partie_prenante: pp.id_partie_prenante }))
  };
};
