import type { ProjetData } from '../types';

const PROJET_ID = '1';
const CHARTE_ID = 'ch-1';
const PERIMETRE_ID = 'pe-1';
const WBS_ROOT_ID = 'wbs-1';
const STORAGE_KEY = 'terminator.projets';

export const createMockProjetData = (projetId = PROJET_ID): ProjetData => ({
  projet: {
    id_projet: projetId,
    nom_projet: 'Refonte SI Ressources Humaines',
    code_projet: 'SIRH-2024-001',
    description_projet: 'Déploiement d\'une solution SIRH cloud-native unifiée pour 450 collaborateurs',
    date_creation: '2024-01-15',
    date_debut_prevue: '2024-03-01',
    date_fin_prevue: '2024-12-31',
    statut_projet: 'En cours',
    budget_total: 414000,
    id_charte: CHARTE_ID,
    id_wbs: WBS_ROOT_ID,
    id_perimetre: PERIMETRE_ID
  },

  charte: {
    id_charte: CHARTE_ID,
    nom_charte: 'Charte du projet SIRH',
    description_charte: 'Document officiel de cadrage du projet de refonte SIRH',
    probleme_opportunite: 'Système RH legacy obsolète, décentralisé, sans intégration paie, mauvaise UX utilisateurs',
    alignement_strategique: 'Transformation digitale 2025 - Objectif: réduire TCO IT de 30% et améliorer expérience collaborateurs',
    justification_projet: 'ROI estimé 20% en 2 ans via réduction charges opérationnelles et gains productivité',
    statut_charte: 'En attente d\'approbation',
    version_charte: '1.0',
    commentaires_approbation: ''
  },

  perimetre: {
    id_perimetre: PERIMETRE_ID,
    enonce_perimetre: '',
    criteres_acceptation: '',
    inclusions_perimetre: '',
    exclusions_perimetre: '',
    contraintes: '',
    hypotheses: ''
  },

  partiesPrenantes: [
    {
      id_partie_prenante: 'pp-1',
      nom_entite: 'Marc Bédié — DRH',
      role: 'Sponsor',
      attentes: 'Réduction coûts paie, Reporting RH amélioré, Conformité réglementaire',
      exigences: 'email: m.bedie@organisation.ci\ntel: +225 07 00 00 01\nstatut: Favorable',
      pouvoir: 'Élevé',
      interet: 'Élevé',
      strategie_engagement: 'Gérer de près'
    },
    {
      id_partie_prenante: 'pp-2',
      nom_entite: 'Aya Koné — DSI',
      role: 'Chef projet',
      attentes: 'Maîtrise du planning, Qualité de livrable, Respect du budget',
      exigences: 'email: a.kone@organisation.ci\ntel: +225 07 00 00 02\nstatut: Favorable',
      pouvoir: 'Élevé',
      interet: 'Élevé',
      strategie_engagement: 'Gérer de près'
    },
    {
      id_partie_prenante: 'pp-3',
      nom_entite: 'Kofi Diabaté — Direction Générale',
      role: 'Décideur',
      attentes: 'ROI positif, Réduction des délais, Conformité',
      exigences: 'email: k.diabate@organisation.ci\ntel: +225 07 00 00 03\nstatut: Neutre',
      pouvoir: 'Élevé',
      interet: 'Moyen',
      strategie_engagement: 'Maintenir satisfait'
    },
    {
      id_partie_prenante: 'pp-4',
      nom_entite: 'Fatou Touré — Responsable Paie',
      role: 'Utilisatrice clé',
      attentes: 'Facilité d\'utilisation, Réduction charge travail, Formation',
      exigences: 'email: f.toure@organisation.ci\ntel: +225 07 00 00 04\nstatut: Résistante',
      pouvoir: 'Faible',
      interet: 'Élevé',
      strategie_engagement: 'Informer'
    },
    {
      id_partie_prenante: 'pp-5',
      nom_entite: 'Oumar Sanogo — DSI',
      role: 'Technique',
      attentes: 'Architecture solide, Performance, Sécurité',
      exigences: 'email: o.sanogo@organisation.ci\ntel: +225 07 00 00 05\nstatut: Favorable',
      pouvoir: 'Moyen',
      interet: 'Élevé',
      strategie_engagement: 'Gérer de près'
    },
    {
      id_partie_prenante: 'pp-6',
      nom_entite: 'Nadia Coulibaly — Prestataire SIRH',
      role: 'Fournisseur',
      attentes: 'Paiement régulier, Clarté des specs, Support technique',
      exigences: 'email: n.coulibaly@sirh.ci\ntel: +225 07 00 00 06\nstatut: Favorable',
      pouvoir: 'Faible',
      interet: 'Élevé',
      strategie_engagement: 'Informer'
    }
  ],

  impliquer: [
    { id_projet: projetId, id_partie_prenante: 'pp-1' },
    { id_projet: projetId, id_partie_prenante: 'pp-2' },
    { id_projet: projetId, id_partie_prenante: 'pp-3' },
    { id_projet: projetId, id_partie_prenante: 'pp-4' },
    { id_projet: projetId, id_partie_prenante: 'pp-5' },
    { id_projet: projetId, id_partie_prenante: 'pp-6' }
  ],

  wbs: [
    { id_wbs: WBS_ROOT_ID, code_wbs: '1', nom_travail: 'Refonte SI Ressources Humaines', description_travail: 'Projet global', niveau_hierarchie: 0, id_projet: projetId },
    { id_wbs: 'wbs-1.1', code_wbs: '1.1', nom_travail: 'Initialisation & cadrage', description_travail: '', niveau_hierarchie: 1, id_wbs_1: WBS_ROOT_ID, duree_estimee: 18, id_projet: projetId },
    { id_wbs: 'wbs-1.1.1', code_wbs: '1.1.1', nom_travail: 'Charte du projet', description_travail: 'Formalisation des objectifs et contraintes', niveau_hierarchie: 2, id_wbs_1: 'wbs-1.1', duree_estimee: 5, id_projet: projetId },
    { id_wbs: 'wbs-1.1.2', code_wbs: '1.1.2', nom_travail: 'Registre parties prenantes', description_travail: 'Identification et analyse des parties prenantes', niveau_hierarchie: 2, id_wbs_1: 'wbs-1.1', duree_estimee: 3, id_projet: projetId },
    { id_wbs: 'wbs-1.2', code_wbs: '1.2', nom_travail: 'Conception & architecture SIRH', description_travail: '', niveau_hierarchie: 1, id_wbs_1: WBS_ROOT_ID, duree_estimee: 47, id_projet: projetId },
    { id_wbs: 'wbs-1.2.1', code_wbs: '1.2.1', nom_travail: 'Architecture technique cible', description_travail: 'Définir l\'architecture technique du SIRH', niveau_hierarchie: 2, id_wbs_1: 'wbs-1.2', duree_estimee: 15, id_projet: projetId },
    { id_wbs: 'wbs-1.3', code_wbs: '1.3', nom_travail: 'Développement & intégration', description_travail: '', niveau_hierarchie: 1, id_wbs_1: WBS_ROOT_ID, id_projet: projetId },
    { id_wbs: 'wbs-1.4', code_wbs: '1.4', nom_travail: 'Formation & déploiement', description_travail: '', niveau_hierarchie: 1, id_wbs_1: WBS_ROOT_ID, id_projet: projetId },
    { id_wbs: 'wbs-1.5', code_wbs: '1.5', nom_travail: 'Clôture & bilan', description_travail: '', niveau_hierarchie: 1, id_wbs_1: WBS_ROOT_ID, id_projet: projetId }
  ],

  activites: [
    {
      id_activites: 'act-1',
      code_activite: '1.2.1.1',
      nom_activite: 'Validation architecture DSI',
      description_activite: 'Revue et validation du document d\'architecture',
      duree_estimee: 3,
      progression: 50,
      statut_activite: 'En cours',
      id_wbs: 'wbs-1.2.1'
    }
  ],

  particiter: [
    { id_partie_prenante: 'pp-2', id_activites: 'act-1' },
    { id_partie_prenante: 'pp-5', id_activites: 'act-1' }
  ],

  lignesBudgetaires: [],
  lignesCalendrier: [],

  livrables: [
    {
      id_livrable: 'liv-1',
      nom_livrable: 'Module Gestion Collaborateurs',
      description_livrable: 'Gestion SIRH complète avec authentification SSO',
      type_livrable: 'Produit',
      date_livraison_prevue: '2024-09-30',
      statut_livrable: 'Planifié',
      id_projet: projetId
    }
  ],

  risques: [
    {
      id_risque: 'ris-1',
      description_risque: 'Retard livraison fournisseur',
      probabilite: 'Moyen',
      impact: 'Élevé',
      score_risque: 12,
      description_mitigation: 'SLA contractuel avec pénalités',
      responsable_mitigation: 'Aya Koné',
      categorie_risque: 'Fournisseur',
      date_identification: '2024-01-20',
      statut_risque: 'Ouvert'
    }
  ],

  couts: [
    { id_cout: 'cout-1', poste_budgetaire: 'Licence logiciel (450 users)', montant_estime: 180000, devise: 'XOF', type_cout: 'Logiciel' },
    { id_cout: 'cout-2', poste_budgetaire: 'Intégration & Paramétrage', montant_estime: 120000, devise: 'XOF', type_cout: 'Service' },
    { id_cout: 'cout-3', poste_budgetaire: 'Infrastructure cloud', montant_estime: 60000, devise: 'XOF', type_cout: 'Infrastructure' }
  ],

  ressources: [
    {
      id_ressource: 'res-1',
      nom_ressource: 'Aya Koné',
      role: 'Chef de Projet',
      type_ressource: 'Humaine',
      cout_unitaire: 50000,
      unite_mesure: 'jour',
      id_activites: 'act-1'
    }
  ],

  approvisionnements: [
    {
      id_approvisionnement: 'app-1',
      type_materiel: 'Licences SIRH',
      quantite: 450,
      unite_mesure: 'utilisateur',
      fournisseur: 'Prestataire SIRH',
      date_livraison_prevue: '2024-06-30',
      montant: 180000,
      statut_appro: 'Planifié',
      id_activite: 'act-1'
    }
  ]
});

const store = new Map<string, ProjetData>();

const readStoredProjects = (): Record<string, ProjetData> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Record<string, ProjetData> : {};
  } catch {
    return {};
  }
};

const writeStoredProjects = (entries: Iterable<[string, ProjetData]>): void => {
  if (typeof window === 'undefined') return;
  try {
    const payload = Object.fromEntries(entries);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore persistence errors
  }
};

export const createProjetData = (
  projetId: string,
  input: {
    nom_projet: string;
    code_projet?: string;
    description_projet?: string;
    statut_projet?: string;
    budget_total?: number;
  } = { nom_projet: 'Nouveau projet' }
): ProjetData => {
  const base = createMockProjetData(projetId);
  const date = new Date().toISOString().slice(0, 10);

  return {
    ...base,
    projet: {
      ...base.projet,
      id_projet: projetId,
      id: projetId,
      nom_projet: input.nom_projet || base.projet.nom_projet,
      code_projet: input.code_projet || `PRJ-${projetId}`,
      description_projet: input.description_projet || '',
      statut_projet: input.statut_projet || 'En attente',
      budget_total: input.budget_total,
      date_creation: date,
      date_debut_prevue: '',
      date_fin_prevue: ''
    },
    charte: {
      ...base.charte,
      id_charte: `charte-${projetId}`,
      nom_charte: `Charte - ${input.nom_projet || base.projet.nom_projet}`,
      description_charte: '',
      probleme_opportunite: '',
      justification_projet: '',
      statut_charte: 'Brouillon',
      commentaires_approbation: '',
      alignement_strategique: ''
    },
    perimetre: {
      ...base.perimetre,
      id_perimetre: `perimetre-${projetId}`,
      enonce_perimetre: '',
      criteres_acceptation: '',
      inclusions_perimetre: '',
      exclusions_perimetre: '',
      contraintes: '',
      hypotheses: ''
    },
    partiesPrenantes: [],
    impliquer: [],
    wbs: [],
    activites: [],
    particiter: [],
    lignesBudgetaires: [],
  lignesCalendrier: [],
    livrables: [],
    risques: [],
    couts: [],
    ressources: [],
    approvisionnements: []
  };
};

export const hasProjetData = (projetId: string): boolean => {
  if (store.has(projetId)) return true;
  const persisted = readStoredProjects();
  return Object.prototype.hasOwnProperty.call(persisted, projetId);
};

export const getProjetData = (projetId: string): ProjetData => {
  const persisted = readStoredProjects();
  if (persisted[projetId]) {
    store.set(projetId, persisted[projetId]);
    return structuredClone(persisted[projetId]);
  }

  if (!store.has(projetId)) {
    store.set(projetId, createMockProjetData(projetId));
  }
  return structuredClone(store.get(projetId)!);
};

export const saveProjetData = (projetId: string, data: ProjetData): void => {
  store.set(projetId, structuredClone(data));
  const entries = Array.from(store.entries());
  writeStoredProjects(entries);
};
