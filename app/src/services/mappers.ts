import type {
  Activite,
  Approvisionnement,
  Charte,
  Cout,
  LigneBudgetaire,
  LigneCalendrier,
  Livrable,
  PartiePrenante,
  Perimetre,
  Projet,
  QuantiteDisponible,
  Risque,
  Wbs
} from '../types';
import { scoreToNiveauRisque } from '../types/helpers';

const toString = (value: unknown): string => {
  if (value == null) return '';
  return String(value);
};

const toNumber = (value: unknown): number | undefined => {
  if (value == null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toDate = (value: unknown): string | undefined => {
  if (value == null || value === '') return undefined;
  return String(value);
};

export const mapProjet = (payload: Record<string, unknown> | null | undefined): Projet => ({
  id_projet: toString(payload?.id ?? payload?.id_projet ?? payload?.code_projet ?? ''),
  id: toString(payload?.id ?? payload?.id_projet ?? ''),
  nom_projet: toString(payload?.nom_projet ?? payload?.nom ?? ''),
  code_projet: toString(payload?.code_projet ?? ''),
  description_projet: toString(payload?.description_projet ?? payload?.description ?? ''),
  date_creation: toDate(payload?.date_creation ?? payload?.cree_le ?? '') || '',
  date_debut_prevue: toDate(payload?.date_debut_prevue ?? payload?.date_debut_prevu ?? ''),
  date_fin_prevue: toDate(payload?.date_fin_prevue ?? payload?.date_fin_prevu ?? ''),
  statut_projet: toString(payload?.statut_projet ?? 'En cours'),
  budget_total: toNumber(payload?.budget_total),
  budget_previsionnel: toNumber(payload?.budget_previsionnel),
  reserve_imprevus_pourcentage: toNumber(payload?.reserve_imprevus_pourcentage),
  reserve_imprevus_montant: toNumber(payload?.reserve_imprevus_montant),
  reserve_imprevus_consommee: toNumber(payload?.reserve_imprevus_consommee),
  id_charte: toString(payload?.id_charte ?? payload?.charte ?? ''),
  id_wbs: toString(payload?.id_wbs ?? payload?.wbs ?? ''),
  id_perimetre: toString(payload?.id_perimetre ?? payload?.perimetre ?? ''),
  id_projet_1: toString(payload?.projet_parent ?? payload?.id_projet_1 ?? '') || undefined
});

export const mapCharte = (payload: Record<string, unknown> | null | undefined): Charte => ({
  id_charte: toString(payload?.id_charte ?? payload?.id ?? ''),
  nom_charte: toString(payload?.nom_charte ?? payload?.titre ?? ''),
  description_charte: toString(payload?.description_charte ?? payload?.description ?? ''),
  probleme_opportunite: toString(payload?.probleme_opportunite ?? ''),
  justification_projet: toString(payload?.justification_projet ?? ''),
  statut_charte: toString(payload?.statut_charte ?? ''),
  date_approbation: toDate(payload?.date_approbation),
  commentaires_approbation: toString(payload?.commentaires_approbation ?? ''),
  version_charte: toString(payload?.version_charte ?? '1.0'),
  alignement_strategique: toString(payload?.alignement_strategique ?? ''),
  localisation: toString(payload?.localisation ?? ''),
  type_projet: toString(payload?.type_projet ?? ''),
  sponsor_ouvrage: toString(payload?.sponsor_ouvrage ?? ''),
  chef_projet: toString(payload?.chef_projet ?? ''),
  objectif_general: toString(payload?.objectif_general ?? ''),
  objectifs_specifiques: toString(payload?.objectifs_specifiques ?? ''),
  signature_image: toString(payload?.signature_image ?? ''),
  signataire_nom: toString(payload?.signataire_nom ?? ''),
  signataire_role: toString(payload?.signataire_role ?? ''),
  budget_previsionnel_total: toNumber(payload?.budget_previsionnel_total)
});

export const mapLigneBudgetaire = (payload: Record<string, unknown> | null | undefined): LigneBudgetaire => ({
  id_ligne: toString(payload?.id_ligne ?? payload?.id ?? ''),
  designation: toString(payload?.designation ?? ''),
  prix_unitaire: toNumber(payload?.prix_unitaire) ?? 0,
  quantite: toNumber(payload?.quantite) ?? 0,
  total: toNumber(payload?.total),
  ordre: toNumber(payload?.ordre),
  id_charte: toString(payload?.charte ?? payload?.id_charte ?? '') || undefined
});

export const mapLigneCalendrier = (payload: Record<string, unknown> | null | undefined): LigneCalendrier => ({
  id_ligne: toString(payload?.id_ligne ?? payload?.id ?? ''),
  phase: toString(payload?.phase ?? ''),
  duree: toString(payload?.duree ?? ''),
  date_debut: toString(payload?.date_debut ?? '') || undefined,
  date_fin: toString(payload?.date_fin ?? '') || undefined,
  activites_cles: toString(payload?.activites_cles ?? ''),
  ordre: toNumber(payload?.ordre),
  id_charte: toString(payload?.charte ?? payload?.id_charte ?? '') || undefined
});

export const mapPerimetre = (payload: Record<string, unknown> | null | undefined): Perimetre => ({
  id_perimetre: toString(payload?.id_perimetre ?? payload?.id ?? ''),
  enonce_perimetre: toString(payload?.enonce_perimetre ?? ''),
  criteres_acceptation: toString(payload?.criteres_acceptation ?? ''),
  inclusions_perimetre: toString(payload?.inclusions_perimetre ?? payload?.inclusions ?? ''),
  exclusions_perimetre: toString(payload?.exclusions_perimetre ?? payload?.exclusions ?? ''),
  contraintes: toString(payload?.contraintes ?? ''),
  hypotheses: toString(payload?.hypotheses ?? '')
});

// Normalise la matrice RACI en { id_livrable: RaciValeur[] }, en tolérant
// l'ancien format où chaque cellule portait une seule valeur (string).
const normalizeRaci = (raw: unknown): PartiePrenante['raci'] => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(value)) out[key] = value.map((v) => String(v));
    else if (value) out[key] = [String(value)];
  }
  return out as PartiePrenante['raci'];
};

export const mapPartiePrenante = (payload: Record<string, unknown> | null | undefined): PartiePrenante => ({
  id_partie_prenante: toString(payload?.id_partie_prenante ?? payload?.id ?? ''),
  nom_entite: toString(payload?.nom_entite ?? payload?.nom ?? ''),
  role: toString(payload?.role ?? ''),
  attentes: toString(payload?.attentes ?? ''),
  exigences: toString(payload?.exigences ?? ''),
  pouvoir: (toString(payload?.pouvoir ?? 'Moyen') as PartiePrenante['pouvoir']) || 'Moyen',
  interet: (toString(payload?.interet ?? 'Moyen') as PartiePrenante['interet']) || 'Moyen',
  strategie_engagement: toString(payload?.strategie_engagement ?? ''),
  type: toString(payload?.type ?? payload?.type_partie_prenante ?? ''),
  type_partie_prenante: toString(payload?.type_partie_prenante ?? payload?.type ?? ''),
  telephone: toString(payload?.telephone ?? ''),
  email: toString(payload?.email ?? ''),
  droits_acces: Array.isArray(payload?.droits_acces) ? (payload.droits_acces as string[]) : [],
  raci: normalizeRaci(payload?.raci),
  signature_image: toString(payload?.signature_image ?? '')
});

export const mapWbs = (payload: Record<string, unknown> | null | undefined): Wbs => ({
  id_wbs: toString(payload?.id_wbs ?? payload?.id ?? ''),
  code_wbs: toString(payload?.code_wbs ?? ''),
  nom_travail: toString(payload?.nom_travail ?? payload?.nom ?? ''),
  description_travail: toString(payload?.description_travail ?? payload?.description ?? ''),
  niveau_hierarchie: toNumber(payload?.niveau_hierarchie) ?? 0,
  date_debut_prevue: toDate(payload?.date_debut_prevue ?? ''),
  date_fin_prevue: toDate(payload?.date_fin_prevue ?? ''),
  duree_estimee: toNumber(payload?.duree_estimee),
  id_wbs_1: toString(payload?.id_wbs_1 ?? payload?.wbs_parent ?? ''),
  id_projet: toString(payload?.id_projet ?? payload?.projet ?? '')
});

export const mapActivite = (payload: Record<string, unknown> | null | undefined): Activite => ({
  id_activites: toString(payload?.id_activites ?? payload?.id ?? ''),
  code_activite: toString(payload?.code_activite ?? ''),
  nom_activite: toString(payload?.nom_activite ?? payload?.nom ?? ''),
  description_activite: toString(payload?.description_activite ?? payload?.description ?? ''),
  date_debut_prevue: toDate(payload?.date_debut_prevue ?? ''),
  date_fin_prevue: toDate(payload?.date_fin_prevue ?? ''),
  duree_estimee: toNumber(payload?.duree_estimee),
  progression: toNumber(payload?.progression) ?? 0,
  statut_activite: toString(payload?.statut_activite ?? 'À faire') as Activite['statut_activite'],
  predecesseurs: toString(payload?.predecesseurs ?? ''),
  type_dependance: toString(payload?.type_dependance ?? ''),
  id_wbs: toString(payload?.id_wbs ?? payload?.wbs ?? '')
});

export const mapLivrable = (payload: Record<string, unknown> | null | undefined): Livrable => ({
  id_livrable: toString(payload?.id_livrable ?? payload?.id ?? ''),
  nom_livrable: toString(payload?.nom_livrable ?? payload?.nom ?? ''),
  description_livrable: toString(payload?.description_livrable ?? payload?.description ?? ''),
  type_livrable: toString(payload?.type_livrable ?? ''),
  date_livraison_prevue: toDate(payload?.date_livraison_prevue ?? '') || '',
  date_livraison_reelle: toDate(payload?.date_livraison_reelle),
  statut_livrable: toString(payload?.statut_livrable ?? ''),
  id_projet: toString(payload?.id_projet ?? payload?.projet ?? '')
});

export const mapRisque = (payload: Record<string, unknown> | null | undefined): Risque => ({
  id_risque: toString(payload?.id_risque ?? payload?.id ?? ''),
  description_risque: toString(payload?.description_risque ?? ''),
  probabilite: scoreToNiveauRisque(toNumber(payload?.probabilite) ?? 3),
  impact: scoreToNiveauRisque(toNumber(payload?.impact) ?? 3),
  score_risque: toNumber(payload?.score_risque) ?? 0,
  description_mitigation: toString(payload?.description_mitigation ?? ''),
  responsable_mitigation: toString(payload?.responsable_mitigation ?? ''),
  categorie_risque: toString(payload?.categorie_risque ?? ''),
  date_identification: toDate(payload?.date_identification) || '',
  statut_risque: toString(payload?.statut_risque ?? ''),
  id_wbs: toString(payload?.id_wbs ?? payload?.wbs ?? '')
});

export const mapCout = (payload: Record<string, unknown> | null | undefined): Cout => ({
  id_cout: toString(payload?.id_cout ?? payload?.id ?? ''),
  poste_budgetaire: toString(payload?.poste_budgetaire ?? ''),
  montant_estime: toNumber(payload?.montant_estime) ?? 0,
  montant_reel: toNumber(payload?.montant_reel ?? payload?.montant_engage),
  devise: toString(payload?.devise ?? 'XOF'),
  type_cout: toString(payload?.type_cout ?? payload?.categorie ?? 'Manuel'),
  id_activite: toString(payload?.id_activite ?? payload?.activite ?? '') || undefined
});

export const mapRessource = (payload: Record<string, unknown> | null | undefined): QuantiteDisponible => ({
  id_ressource: toString(payload?.id_ressource ?? payload?.id ?? ''),
  nom_ressource: toString(payload?.nom_ressource ?? payload?.nom ?? ''),
  role: toString(payload?.role ?? ''),
  type_ressource: toString(payload?.type_ressource ?? ''),
  cout_unitaire: toNumber(payload?.cout_unitaire) ?? 0,
  unite_mesure: toString(payload?.unite_mesure ?? ''),
  id_activites: toString(payload?.id_activites ?? payload?.activites ?? '')
});

export const mapApprovisionnement = (payload: Record<string, unknown> | null | undefined): Approvisionnement => ({
  id_approvisionnement: toString(payload?.id_approvisionnement ?? payload?.id ?? ''),
  type_materiel: toString(payload?.type_materiel ?? ''),
  quantite: toNumber(payload?.quantite) ?? 0,
  unite_mesure: toString(payload?.unite_mesure ?? ''),
  fournisseur: toString(payload?.fournisseur ?? ''),
  date_commande: toDate(payload?.date_commande),
  date_livraison_prevue: toDate(payload?.date_livraison_prevue),
  date_livraison_relle: toDate(payload?.date_livraison_reelle),
  montant: toNumber(payload?.montant) ?? 0,
  statut_appro: toString(payload?.statut_appro ?? ''),
  id_activite: toString(payload?.id_activite ?? payload?.activite ?? '') || undefined
});

export const parseList = <T>(payload: unknown, mapper: (entry: Record<string, unknown>) => T): T[] => {
  if (Array.isArray(payload)) {
    return payload.map(entry => mapper((entry || {}) as Record<string, unknown>));
  }
  return [];
};
