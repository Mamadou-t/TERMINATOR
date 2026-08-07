import type { ComponentType } from 'react';
import { DomaineAVenir } from '../components/DomaineAVenir';
import IntegrationDomaine from '../components/pages/Demarrage/IntegrationDomaine';
import PartiesPrenantes from '../components/pages/Demarrage/PartiePrenante';
import Perimetre from '../components/pages/planification/Perimetre';
import EcheancierDomaine from '../components/pages/planification/EcheancierDomaine';
import Budget from '../components/pages/planification/budget';
import Ressources from '../components/pages/planification/Ressources';
import RisquesPlanification from '../components/pages/planification/Risques';
import ApprovisionnementPage from '../components/pages/planification/Approvisionnement';

export interface PhaseDef {
  slug: string;
  label: string;
  /** Slugs des domaines de connaissance concernés par cette phase. */
  domaines: string[];
}

export interface DomaineDef {
  slug: string;
  label: string;
  component: ComponentType<{ processus?: string }>;
  /** Processus PMBOK du domaine, par slug de phase (groupe de processus). */
  processus: Record<string, string[]>;
  /** Si vrai, le composant est rendu pour chaque processus (il gère lui-même
   *  le processus reçu en prop) au lieu d'un placeholder « à venir ». */
  perProcessus?: boolean;
}

const Qualite = () => <DomaineAVenir titre="Gestion de la qualité" />;
const Communication = () => <DomaineAVenir titre="Gestion de la communication" />;

export const DOMAINES: DomaineDef[] = [
  {
    slug: 'integration', label: "Gestion de l'intégration", component: IntegrationDomaine,
    processus: {
      Demarrage: ["Élaborer la charte du projet"],
      Planification: ["Élaborer le plan de management du projet"],
      Execution: ["Diriger et gérer le travail du projet", "Gérer les connaissances du projet"],
      Surveillance: ["Surveiller et maîtriser le travail du projet", "Maîtriser les modifications"],
      Cloture: ["Clore le projet ou la phase"]
    }
  },
  {
    slug: 'perimetre', label: 'Gestion du périmètre', component: Perimetre,
    processus: {
      Planification: ["Planifier le management du périmètre", "Recueillir les exigences", "Définir le périmètre", "Créer la structure de découpage du projet (WBS)"],
      Surveillance: ["Valider le périmètre", "Maîtriser le périmètre"]
    }
  },
  {
    slug: 'echeancier', label: "Gestion de l'échéancier", component: EcheancierDomaine, perProcessus: true,
    processus: {
      Planification: ["Définir les WBS", "Définir les activités", "Séquencer les activités", "Estimer la durée des activités", "Élaborer l'échéancier"],
      Surveillance: ["Maîtriser l'échéancier"]
    }
  },
  {
    slug: 'cout', label: 'Gestion du coût', component: Budget,
    processus: {
      Planification: ["Planifier le management des coûts", "Estimer les coûts", "Déterminer le budget"],
      Surveillance: ["Maîtriser les coûts"]
    }
  },
  {
    slug: 'qualite', label: 'Gestion de la qualité', component: Qualite,
    processus: {
      Planification: ["Planifier le management de la qualité"],
      Execution: ["Mettre en œuvre l'assurance qualité"],
      Surveillance: ["Maîtriser la qualité"]
    }
  },
  {
    slug: 'ressources', label: 'Gestion des ressources', component: Ressources,
    processus: {
      Planification: ["Planifier le management des ressources", "Estimer les ressources des activités"],
      Execution: ["Acquérir les ressources", "Développer l'équipe", "Diriger l'équipe"],
      Surveillance: ["Maîtriser les ressources"]
    }
  },
  {
    slug: 'communication', label: 'Gestion de la communication', component: Communication,
    processus: {
      Planification: ["Planifier le management des communications"],
      Execution: ["Gérer les communications"],
      Surveillance: ["Maîtriser les communications"]
    }
  },
  {
    slug: 'risques', label: 'Gestion des risques', component: RisquesPlanification,
    processus: {
      Planification: ["Planifier le management des risques", "Identifier les risques", "Réaliser l'analyse qualitative des risques", "Réaliser l'analyse quantitative des risques", "Planifier les réponses aux risques"],
      Execution: ["Mettre en œuvre les réponses aux risques"],
      Surveillance: ["Maîtriser les risques"]
    }
  },
  {
    slug: 'approvisionnements', label: 'Gestion des approvisionnements', component: ApprovisionnementPage,
    processus: {
      Planification: ["Planifier le management des approvisionnements"],
      Execution: ["Procéder aux approvisionnements"],
      Surveillance: ["Maîtriser les approvisionnements"]
    }
  },
  {
    slug: 'parties-prenantes', label: 'Gestion des parties prenantes', component: PartiesPrenantes,
    processus: {
      Demarrage: ["Identifier les parties prenantes"],
      Planification: ["Planifier le management des parties prenantes"],
      Execution: ["Gérer l'engagement des parties prenantes"],
      Surveillance: ["Maîtriser l'engagement des parties prenantes"]
    }
  }
];

const TOUS_DOMAINES = DOMAINES.map((d) => d.slug);

// Domaines de connaissance concernés par chaque phase (Surveillance et
// maîtrise n'étant pas restreinte, elle couvre tous les domaines).
export const PHASES: PhaseDef[] = [
  { slug: 'Demarrage', label: 'Démarrage', domaines: ['integration', 'parties-prenantes'] },
  { slug: 'Planification', label: 'Planification', domaines: ['perimetre', 'echeancier', 'cout', 'ressources', 'risques', 'approvisionnements', 'parties-prenantes'] },
  { slug: 'Execution', label: 'Exécution', domaines: ['qualite', 'ressources', 'communication', 'risques', 'approvisionnements', 'parties-prenantes'] },
  { slug: 'Surveillance', label: 'Surveillance et maîtrise', domaines: TOUS_DOMAINES },
  { slug: 'Cloture', label: 'Clôture', domaines: ['integration'] }
];

export const DEFAULT_PHASE = PHASES[0].slug;

export const findPhase = (slug?: string): PhaseDef =>
  PHASES.find((p) => p.slug === slug) || PHASES[0];

export const findDomaine = (slug?: string): DomaineDef =>
  DOMAINES.find((d) => d.slug === slug) || DOMAINES[0];

/** Domaines de connaissance (ordre canonique) autorisés pour une phase. */
export const domainesForPhase = (phaseSlug?: string): DomaineDef[] => {
  const phase = findPhase(phaseSlug);
  return DOMAINES.filter((d) => phase.domaines.includes(d.slug));
};

/** Premier domaine autorisé d'une phase (domaine par défaut de la phase). */
export const defaultDomaineForPhase = (phaseSlug?: string): string =>
  findPhase(phaseSlug).domaines[0];

/** Processus d'un domaine pour une phase donnée. */
export const processusForDomaine = (domaineSlug?: string, phaseSlug?: string): string[] =>
  findDomaine(domaineSlug).processus[findPhase(phaseSlug).slug] || [];

export const DEFAULT_DOMAINE = defaultDomaineForPhase(DEFAULT_PHASE);
