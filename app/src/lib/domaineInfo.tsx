import { useProjet } from '../context/ProjetContext';

export interface DomaineKpi {
  value: React.ReactNode;
  label: string;
  barColor?: string;
  valueClassName?: string;
}

export interface DomaineInfo {
  title: string;
  subtitle?: string;
  kpis: DomaineKpi[];
}

const xof = (n: number) => `${(n || 0).toLocaleString('fr-FR')} XOF`;

// Compte les grands points d'un périmètre stocké en JSON (repli texte libre).
const countPoints = (raw: string): { points: number; sousPoints: number } => {
  if (!raw) return { points: 0, sousPoints: 0 };
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return {
        points: parsed.length,
        sousPoints: parsed.reduce((s: number, p) => s + (Array.isArray(p?.sousPoints) ? p.sousPoints.length : 0), 0)
      };
    }
  } catch {
    const lignes = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    return { points: lignes.length ? 1 : 0, sousPoints: lignes.length };
  }
  return { points: 0, sousPoints: 0 };
};

/**
 * Titre, sous-titre et KPI d'un domaine de connaissance (résumé du domaine,
 * indépendant du processus sélectionné). Calculés depuis les données projet.
 */
export function useDomaineInfo(slug: string): DomaineInfo {
  const {
    projet, charte, perimetre, livrables, lignesBudgetaires, lignesCalendrier,
    wbs, activites, couts, ressources, risques, approvisionnements,
    partiesPrenantes, impliquer
  } = useProjet();

  switch (slug) {
    case 'integration': {
      const budget = lignesBudgetaires.reduce((s, l) => s + (l.prix_unitaire || 0) * (l.quantite || 0), 0);
      const approuvee = charte.statut_charte === 'Approuvé';
      return {
        title: "Gestion de l'intégration",
        subtitle: "Charte du projet : cadrage, budget prévisionnel, objectifs et approbation.",
        kpis: [
          { value: livrables.length, label: 'Livrables', barColor: 'bg-blue-600' },
          { value: xof(budget), label: 'Budget prévisionnel', barColor: 'bg-amber-500' },
          { value: lignesCalendrier.length, label: 'Phases planifiées', barColor: 'bg-slate-400' },
          { value: approuvee ? 'Approuvée' : 'En attente', label: 'Statut de la charte', barColor: approuvee ? 'bg-green-600' : 'bg-amber-500' }
        ]
      };
    }
    case 'perimetre': {
      const inc = countPoints(perimetre.inclusions_perimetre);
      const exc = countPoints(perimetre.exclusions_perimetre);
      return {
        title: 'Gestion du périmètre',
        subtitle: 'Contenu inclus et exclus, contraintes, hypothèses et critères de réussite.',
        kpis: [
          { value: inc.points, label: 'Grands points inclus', barColor: 'bg-green-600' },
          { value: exc.points, label: 'Grands points exclus', barColor: 'bg-red-500' },
          { value: inc.sousPoints + exc.sousPoints, label: 'Sous-points définis', barColor: 'bg-blue-600' }
        ]
      };
    }
    case 'echeancier':
      return {
        title: "Gestion de l'échéancier",
        subtitle: 'Structure de découpage (WBS) et activités du projet.',
        kpis: [
          { value: wbs.length, label: 'Lots WBS', barColor: 'bg-blue-600' },
          { value: activites.length, label: 'Activités', barColor: 'bg-green-600' },
          { value: `${activites.reduce((s, a) => s + (a.duree_estimee || 0), 0)} j`, label: 'Durée estimée cumulée', barColor: 'bg-slate-400' }
        ]
      };
    case 'cout': {
      const totalEstime = couts.reduce((s, c) => s + (c.montant_estime || 0), 0);
      const ecart = (projet.budget_total || 0) - totalEstime;
      return {
        title: 'Gestion du coût',
        subtitle: 'Budget et coûts par activité du projet.',
        kpis: [
          { value: xof(projet.budget_total || 0), label: 'Budget prévisionnel du projet', barColor: 'bg-blue-600' },
          { value: xof(totalEstime), label: 'Total estimé (lignes de coûts)', barColor: 'bg-slate-400' },
          { value: xof(ecart), label: 'Écart budget / estimé', barColor: ecart < 0 ? 'bg-red-500' : 'bg-green-600', valueClassName: ecart < 0 ? 'text-red-600' : 'text-emerald-600' }
        ]
      };
    }
    case 'ressources':
      return {
        title: 'Gestion des ressources',
        subtitle: 'Ressources affectées aux activités de chaque lot du WBS.',
        kpis: [
          { value: ressources.length, label: 'Ressources', barColor: 'bg-blue-600' },
          { value: ressources.filter(r => r.type_ressource === 'Humaine').length, label: 'Humaines', barColor: 'bg-green-600' },
          { value: ressources.filter(r => r.type_ressource !== 'Humaine').length, label: 'Matérielles / équipements', barColor: 'bg-amber-500' }
        ]
      };
    case 'risques':
      return {
        title: 'Gestion des risques',
        subtitle: 'Risques identifiés et suivis par lot du WBS.',
        kpis: [
          { value: risques.length, label: 'Risques identifiés', barColor: 'bg-blue-600' },
          { value: risques.filter(r => r.statut_risque === 'Ouvert').length, label: 'Ouverts', barColor: 'bg-amber-500' },
          { value: risques.filter(r => (r.score_risque || 0) >= 12).length, label: 'Critiques (score ≥ 12)', barColor: 'bg-red-500', valueClassName: 'text-red-700' }
        ]
      };
    case 'approvisionnements':
      return {
        title: 'Gestion des approvisionnements',
        subtitle: 'Approvisionnements par activité de chaque lot du WBS.',
        kpis: [
          { value: approvisionnements.length, label: 'Approvisionnements', barColor: 'bg-blue-600' },
          { value: approvisionnements.filter(a => a.statut_appro === 'Livré').length, label: 'Livrés', barColor: 'bg-green-600' },
          { value: xof(approvisionnements.reduce((s, a) => s + (a.montant || 0), 0)), label: 'Montant total', barColor: 'bg-amber-500' }
        ]
      };
    case 'parties-prenantes': {
      const ids = new Set(impliquer.filter(i => i.id_projet === projet.id_projet).map(i => i.id_partie_prenante));
      const pps = partiesPrenantes.filter(p => ids.has(p.id_partie_prenante));
      const statut = (pp: typeof pps[number]) => pp.exigences.toLowerCase();
      return {
        title: 'Gestion des parties prenantes',
        subtitle: "Identifiez et gérez l'ensemble des acteurs du projet.",
        kpis: [
          { value: pps.length, label: 'Total parties prenantes', barColor: 'bg-blue-600' },
          { value: pps.filter(p => p.pouvoir === 'Élevé').length, label: 'Influence élevée', barColor: 'bg-red-500', valueClassName: 'text-red-700' },
          { value: pps.filter(p => p.strategie_engagement.toLowerCase().includes('près')).length, label: 'Engagées activement', barColor: 'bg-green-600', valueClassName: 'text-green-700' },
          { value: pps.filter(p => statut(p).includes('résistant')).length, label: 'À risque / résistantes', barColor: 'bg-amber-500', valueClassName: 'text-amber-800' }
        ]
      };
    }
    case 'qualite':
      return { title: 'Gestion de la qualité', subtitle: 'Planification et maîtrise de la qualité du projet.', kpis: [] };
    case 'communication':
      return { title: 'Gestion de la communication', subtitle: 'Planification et gestion des communications du projet.', kpis: [] };
    default:
      return { title: '', kpis: [] };
  }
}
