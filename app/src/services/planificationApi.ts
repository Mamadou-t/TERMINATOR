import { apiRequest } from '../lib/api';
import { isBackendId } from './demarrageApi';
import {
  mapApprovisionnement,
  mapCout,
  mapActivite,
  mapPerimetre,
  mapRessource,
  mapRisque,
  mapWbs
} from './mappers';
import { niveauRisqueToScore } from '../types/helpers';
import type {
  Activite,
  Approvisionnement,
  Cout,
  Perimetre,
  ProjetData,
  QuantiteDisponible,
  Risque,
  Wbs
} from '../types';

const asList = <T>(payload: { results?: T[] } | T[] | null | undefined): T[] => {
  if (Array.isArray(payload)) return payload;
  return payload?.results ?? [];
};

export { isBackendId };

// ===== PERIMETRE =====

const perimetrePayload = (perimetre: Perimetre) => ({
  enonce_perimetre: perimetre.enonce_perimetre || '',
  criteres_acceptation: perimetre.criteres_acceptation || '',
  inclusions_perimetre: perimetre.inclusions_perimetre || '',
  exclusions_perimetre: perimetre.exclusions_perimetre || '',
  contraintes: perimetre.contraintes || '',
  hypotheses: perimetre.hypotheses || ''
});

export const creerOuMajPerimetre = async (perimetre: Perimetre, projetId: string): Promise<Perimetre> => {
  const payload = perimetrePayload(perimetre);

  if (isBackendId(perimetre.id_perimetre)) {
    const result = await apiRequest<Record<string, unknown>>(`/perimetres/${perimetre.id_perimetre}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return mapPerimetre(result);
  }

  const created = await apiRequest<Record<string, unknown>>('/perimetres/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const perimetreResult = mapPerimetre(created);
  if (isBackendId(projetId)) {
    await apiRequest(`/projets/${projetId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ perimetre: perimetreResult.id_perimetre })
    });
  }
  return perimetreResult;
};

export const obtenirPerimetre = async (perimetreId: string | undefined | null): Promise<Perimetre | null> => {
  if (!isBackendId(perimetreId)) return null;
  try {
    const result = await apiRequest<Record<string, unknown>>(`/perimetres/${perimetreId}/`);
    return mapPerimetre(result);
  } catch {
    return null;
  }
};

// ===== WBS =====

const wbsPayload = (node: Wbs, projetId: string) => ({
  code_wbs: node.code_wbs,
  nom_travail: node.nom_travail,
  description_travail: node.description_travail || '',
  niveau_hierarchie: node.niveau_hierarchie,
  date_debut_prevue: node.date_debut_prevue || new Date().toISOString().slice(0, 10),
  date_fin_prevue: node.date_fin_prevue || new Date().toISOString().slice(0, 10),
  duree_estimee: node.duree_estimee ?? 1,
  wbs_parent: isBackendId(node.id_wbs_1) ? node.id_wbs_1 : null,
  projet: projetId
});

export const listerWbs = async (projetId: string): Promise<Wbs[]> => {
  const payload = await apiRequest<{ results?: unknown[] } | unknown[]>(`/wbs/?projet=${projetId}`);
  return asList(payload as { results?: unknown[] } | unknown[]).map((entry) => mapWbs(entry as Record<string, unknown>));
};

export const sauverWbs = async (node: Wbs, projetId: string): Promise<Wbs> => {
  const payload = wbsPayload(node, projetId);
  const result = isBackendId(node.id_wbs)
    ? await apiRequest<Record<string, unknown>>(`/wbs/${node.id_wbs}/`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await apiRequest<Record<string, unknown>>('/wbs/', { method: 'POST', body: JSON.stringify(payload) });
  return mapWbs(result);
};

export const supprimerWbs = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/wbs/${id}/`, { method: 'DELETE' });
};

// ===== ACTIVITES =====

const activitePayload = (activite: Activite, wbsId: string) => ({
  code_activite: activite.code_activite,
  nom_activite: activite.nom_activite,
  description_activite: activite.description_activite || '',
  date_debut_prevue: activite.date_debut_prevue || new Date().toISOString().slice(0, 10),
  date_fin_prevue: activite.date_fin_prevue || new Date().toISOString().slice(0, 10),
  duree_estimee: activite.duree_estimee ?? 1,
  progression: activite.progression ?? 0,
  statut_activite: activite.statut_activite || 'À faire',
  predecesseurs: activite.predecesseurs || '',
  type_dependance: activite.type_dependance || '',
  wbs: wbsId
});

export const listerActivites = async (projetId: string): Promise<Activite[]> => {
  const payload = await apiRequest<{ results?: unknown[] } | unknown[]>(`/activites/?wbs__projet=${projetId}`);
  return asList(payload as { results?: unknown[] } | unknown[]).map((entry) => mapActivite(entry as Record<string, unknown>));
};

export const sauverActivite = async (activite: Activite, wbsId: string): Promise<Activite> => {
  const payload = activitePayload(activite, wbsId);
  const result = isBackendId(activite.id_activites)
    ? await apiRequest<Record<string, unknown>>(`/activites/${activite.id_activites}/`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await apiRequest<Record<string, unknown>>('/activites/', { method: 'POST', body: JSON.stringify(payload) });
  return mapActivite(result);
};

export const supprimerActivite = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/activites/${id}/`, { method: 'DELETE' });
};

// ===== COUTS =====

const coutPayload = (cout: Cout, activiteId?: string) => ({
  poste_budgetaire: cout.poste_budgetaire,
  montant_estime: cout.montant_estime ?? 0,
  montant_reel: cout.montant_reel ?? null,
  devise: cout.devise || 'XOF',
  type_cout: cout.type_cout || 'Général',
  activite: activiteId && isBackendId(activiteId) ? activiteId : null
});

export const listerCouts = async (projetId: string): Promise<Cout[]> => {
  const payload = await apiRequest<{ results?: unknown[] } | unknown[]>(`/couts/?activite__wbs__projet=${projetId}`);
  return asList(payload as { results?: unknown[] } | unknown[]).map((entry) => mapCout(entry as Record<string, unknown>));
};

export const sauverCout = async (cout: Cout, activiteId?: string): Promise<Cout> => {
  const payload = coutPayload(cout, activiteId);
  const result = isBackendId(cout.id_cout)
    ? await apiRequest<Record<string, unknown>>(`/couts/${cout.id_cout}/`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await apiRequest<Record<string, unknown>>('/couts/', { method: 'POST', body: JSON.stringify(payload) });
  return mapCout(result);
};

export const supprimerCout = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/couts/${id}/`, { method: 'DELETE' });
};

// ===== RESSOURCES =====

const ressourcePayload = (ressource: QuantiteDisponible, activiteId: string) => ({
  nom_ressource: ressource.nom_ressource,
  role: ressource.role || '',
  type_ressource: ressource.type_ressource || 'Humaine',
  cout_unitaire: ressource.cout_unitaire ?? 0,
  unite_mesure: ressource.unite_mesure || 'jour',
  activite: activiteId
});

export const listerRessources = async (projetId: string): Promise<QuantiteDisponible[]> => {
  const payload = await apiRequest<{ results?: unknown[] } | unknown[]>(`/ressources/?activite__wbs__projet=${projetId}`);
  return asList(payload as { results?: unknown[] } | unknown[]).map((entry) => mapRessource(entry as Record<string, unknown>));
};

export const sauverRessource = async (ressource: QuantiteDisponible, activiteId: string): Promise<QuantiteDisponible> => {
  const payload = ressourcePayload(ressource, activiteId);
  const result = isBackendId(ressource.id_ressource)
    ? await apiRequest<Record<string, unknown>>(`/ressources/${ressource.id_ressource}/`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await apiRequest<Record<string, unknown>>('/ressources/', { method: 'POST', body: JSON.stringify(payload) });
  return mapRessource(result);
};

export const supprimerRessource = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/ressources/${id}/`, { method: 'DELETE' });
};

// ===== RISQUES =====

const risquePayload = (risque: Risque, wbsId: string) => ({
  description_risque: risque.description_risque,
  probabilite: niveauRisqueToScore(risque.probabilite),
  impact: niveauRisqueToScore(risque.impact),
  score_risque: risque.score_risque || niveauRisqueToScore(risque.probabilite) * niveauRisqueToScore(risque.impact),
  description_mitigation: risque.description_mitigation || '',
  responsable_mitigation: risque.responsable_mitigation || '',
  categorie_risque: risque.categorie_risque || 'Général',
  date_identification: risque.date_identification || new Date().toISOString().slice(0, 10),
  statut_risque: risque.statut_risque || 'Ouvert',
  wbs: wbsId
});

export const listerRisques = async (projetId: string): Promise<Risque[]> => {
  const payload = await apiRequest<{ results?: unknown[] } | unknown[]>(`/risques/?wbs__projet=${projetId}`);
  return asList(payload as { results?: unknown[] } | unknown[]).map((entry) => mapRisque(entry as Record<string, unknown>));
};

export const sauverRisque = async (risque: Risque, wbsId: string): Promise<Risque> => {
  const payload = risquePayload(risque, wbsId);
  const result = isBackendId(risque.id_risque)
    ? await apiRequest<Record<string, unknown>>(`/risques/${risque.id_risque}/`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await apiRequest<Record<string, unknown>>('/risques/', { method: 'POST', body: JSON.stringify(payload) });
  return mapRisque(result);
};

export const supprimerRisque = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/risques/${id}/`, { method: 'DELETE' });
};

// ===== APPROVISIONNEMENTS =====

const approvisionnementPayload = (item: Approvisionnement) => ({
  type_materiel: item.type_materiel,
  quantite: item.quantite ?? 0,
  unite_mesure: item.unite_mesure || '',
  fournisseur: item.fournisseur || '',
  date_commande: item.date_commande || new Date().toISOString().slice(0, 10),
  date_livraison_prevue: item.date_livraison_prevue || new Date().toISOString().slice(0, 10),
  date_livraison_reelle: item.date_livraison_relle || null,
  montant: item.montant ?? 0,
  statut_appro: item.statut_appro || 'Planifié'
});

export const listerApprovisionnements = async (projetId: string): Promise<Approvisionnement[]> => {
  const liens = await apiRequest<{ results?: Array<{ activite: string; approvisionnement: string }> } | Array<{ activite: string; approvisionnement: string }>>(
    `/approvisionnements/subir/?activite__wbs__projet=${projetId}`
  );
  const rows = asList(liens);
  const items = await Promise.all(
    rows.map(async (lien) => {
      const item = await apiRequest<Record<string, unknown>>(`/approvisionnements/${lien.approvisionnement}/`);
      return mapApprovisionnement({ ...item, activite: lien.activite });
    })
  );
  return items;
};

export const sauverApprovisionnement = async (item: Approvisionnement, activiteId?: string): Promise<Approvisionnement> => {
  const payload = approvisionnementPayload(item);

  if (isBackendId(item.id_approvisionnement)) {
    const result = await apiRequest<Record<string, unknown>>(`/approvisionnements/${item.id_approvisionnement}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return mapApprovisionnement({ ...result, activite: activiteId ?? item.id_activite });
  }

  const created = await apiRequest<Record<string, unknown>>('/approvisionnements/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const createdItem = mapApprovisionnement(created);
  if (activiteId && isBackendId(activiteId)) {
    await apiRequest('/approvisionnements/subir/', {
      method: 'POST',
      body: JSON.stringify({ activite: activiteId, approvisionnement: createdItem.id_approvisionnement })
    });
  }
  return { ...createdItem, id_activite: activiteId };
};

export const supprimerApprovisionnement = async (id: string): Promise<void> => {
  if (!isBackendId(id)) return;
  await apiRequest(`/approvisionnements/${id}/`, { method: 'DELETE' });
};

// ===== CHARGEMENT COMPLET (Planification) =====

export const chargerDonneesPlanification = async (projetId: string, fallback: ProjetData): Promise<ProjetData> => {
  const [perimetre, wbs, activites, couts, ressources, risques, approvisionnements] = await Promise.all([
    obtenirPerimetre(fallback.projet.id_perimetre).then((p) => p || fallback.perimetre).catch(() => fallback.perimetre),
    listerWbs(projetId).catch(() => fallback.wbs),
    listerActivites(projetId).catch(() => fallback.activites),
    listerCouts(projetId).catch(() => fallback.couts),
    listerRessources(projetId).catch(() => fallback.ressources),
    listerRisques(projetId).catch(() => fallback.risques),
    listerApprovisionnements(projetId).catch(() => fallback.approvisionnements)
  ]);

  return {
    ...fallback,
    perimetre,
    wbs,
    activites,
    couts,
    ressources,
    risques,
    approvisionnements
  };
};
