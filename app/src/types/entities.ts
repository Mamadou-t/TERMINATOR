/** Types alignés sur le MCD / MLD du projet Terminator */

export type EntityId = string;

export type StatutProjet = 'En attente' | 'En cours' | 'Terminé' | 'Suspendu';
export type NiveauPouvoirInteret = 'Faible' | 'Moyen' | 'Élevé';
export type StatutActivite = 'À faire' | 'En cours' | 'Terminé';

/** Table projet */
export interface Projet {
  id_projet: EntityId;
  id?: EntityId;
  nom_projet: string;
  code_projet: string;
  description_projet: string;
  date_creation: string;
  date_debut_prevue?: string;
  date_fin_prevue?: string;
  statut_projet: StatutProjet | string;
  budget_total?: number;
  budget_previsionnel?: number;
  reserve_imprevus_pourcentage?: number;
  reserve_imprevus_montant?: number;
  reserve_imprevus_consommee?: number;
  id_projet_1?: EntityId;
  id_charte?: EntityId;
  id_wbs?: EntityId;
  id_perimetre?: EntityId;
}

/** Table charte */
export interface Charte {
  id_charte: EntityId;
  nom_charte: string;
  description_charte: string;
  probleme_opportunite: string;
  justification_projet: string;
  statut_charte: string;
  date_approbation?: string;
  commentaires_approbation?: string;
  version_charte: string;
  alignement_strategique: string;
  localisation?: string;
  type_projet?: string;
  sponsor_ouvrage?: string;
  chef_projet?: string;
  objectif_general?: string;
  objectifs_specifiques?: string;
  signature_image?: string;
  signataire_nom?: string;
  signataire_role?: string;
  budget_previsionnel_total?: number;
}

/** Ligne du budget prévisionnel rattachée à la charte */
export interface LigneBudgetaire {
  id_ligne: EntityId;
  designation: string;
  prix_unitaire: number;
  quantite: number;
  total?: number;
  ordre?: number;
  id_charte?: EntityId;
}

/** Ligne du calendrier prévisionnel (phase du projet), rattachée à la charte */
export interface LigneCalendrier {
  id_ligne: EntityId;
  phase: string;
  duree: string;
  date_debut?: string;
  date_fin?: string;
  activites_cles: string;
  ordre?: number;
  id_charte?: EntityId;
}

/** Table perimetre */
export interface Perimetre {
  id_perimetre: EntityId;
  enonce_perimetre: string;
  criteres_acceptation: string;
  inclusions_perimetre: string;
  exclusions_perimetre: string;
  contraintes: string;
  hypotheses: string;
}

/** Table partie_prenante */
export interface PartiePrenante {
  id_partie_prenante: EntityId;
  nom_entite: string;
  role: string;
  type?: string;
  type_partie_prenante?: string;
  attentes: string;
  exigences: string;
  pouvoir: NiveauPouvoirInteret;
  interet: NiveauPouvoirInteret;
  strategie_engagement: string;
  telephone?: string;
  email?: string;
  droits_acces?: string[];
  /** Matrice RACI : id_livrable -> liste de rôles (une cellule peut en cumuler plusieurs). */
  raci?: Record<string, RaciValeur[]>;
  /** Signature importée de la partie prenante (data URL base64). */
  signature_image?: string;
}

export type RaciValeur = 'R' | 'A' | 'C' | 'I';

export const DROITS_ACCES: { slug: string; label: string }[] = [
  { slug: 'consulter', label: 'Consulter le projet' },
  { slug: 'creer', label: 'Créer des éléments' },
  { slug: 'modifier', label: 'Modifier des éléments' },
  { slug: 'supprimer', label: 'Supprimer des éléments' },
  { slug: 'approuver', label: 'Approuver / valider' }
];

export const RACI_OPTIONS: { valeur: RaciValeur; label: string; color: string }[] = [
  { valeur: 'R', label: 'Responsable', color: '#c026d3' },
  { valeur: 'A', label: 'Approbateur (Autorité)', color: '#dc2626' },
  { valeur: 'C', label: 'Consulté', color: '#14b8a6' },
  { valeur: 'I', label: 'Informé', color: '#f59e0b' }
];


/** Association impliquer (projet ↔ partie_prenante) */
export interface Impliquer {
  id_projet: EntityId;
  id_partie_prenante: EntityId;
}

/** Table wbs */
export interface Wbs {
  id_wbs: EntityId;
  code_wbs: string;
  nom_travail: string;
  description_travail: string;
  niveau_hierarchie: number;
  date_debut_prevue?: string;
  date_fin_prevue?: string;
  duree_estimee?: number;
  id_wbs_1?: EntityId;
  id_projet: EntityId;
}

/** Table activites */
export interface Activite {
  id_activites: EntityId;
  code_activite: string;
  nom_activite: string;
  description_activite: string;
  date_debut_prevue?: string;
  date_fin_prevue?: string;
  duree_estimee?: number;
  progression: number;
  statut_activite: StatutActivite;
  predecesseurs?: string;
  type_dependance?: string;
  id_wbs: EntityId;
}

/** Association particiter (partie_prenante ↔ activites) */
export interface Particiter {
  id_partie_prenante: EntityId;
  id_activites: EntityId;
}

/** Table livrables */
export interface Livrable {
  id_livrable: EntityId;
  nom_livrable: string;
  description_livrable: string;
  type_livrable: string;
  date_livraison_prevue: string;
  date_livraison_reelle?: string;
  statut_livrable: string;
  id_projet: EntityId;
}

/** Table risque */
export interface Risque {
  id_risque: EntityId;
  description_risque: string;
  probabilite: string;
  impact: string;
  score_risque: number;
  description_mitigation: string;
  responsable_mitigation: string;
  categorie_risque?: string;
  date_identification: string;
  statut_risque: string;
  id_wbs?: EntityId;
}

/** Table couts */
export interface Cout {
  id_cout: EntityId;
  poste_budgetaire: string;
  montant_estime: number;
  montant_reel?: number;
  devise: string;
  type_cout: string;
  id_activite?: EntityId;
}

/** Table quantite_disponible (ressources) */
export interface QuantiteDisponible {
  id_ressource: EntityId;
  nom_ressource: string;
  role: string;
  type_ressource: string;
  cout_unitaire: number;
  unite_mesure: string;
  id_activites?: EntityId;
}

/** Table approvisionnement */
export interface Approvisionnement {
  id_approvisionnement: EntityId;
  type_materiel: string;
  quantite: number;
  unite_mesure: string;
  fournisseur: string;
  date_commande?: string;
  date_livraison_prevue?: string;
  date_livraison_relle?: string;
  montant: number;
  statut_appro: string;
  id_activite?: EntityId;
}

/** Agrégat applicatif — toutes les entités liées à un projet */
export interface ProjetData {
  projet: Projet;
  charte: Charte;
  perimetre: Perimetre;
  partiesPrenantes: PartiePrenante[];
  impliquer: Impliquer[];
  wbs: Wbs[];
  activites: Activite[];
  particiter: Particiter[];
  lignesBudgetaires: LigneBudgetaire[];
  lignesCalendrier: LigneCalendrier[];
  livrables: Livrable[];
  risques: Risque[];
  couts: Cout[];
  ressources: QuantiteDisponible[];
  approvisionnements: Approvisionnement[];
}
