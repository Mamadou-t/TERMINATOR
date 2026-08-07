import { createMockProjetData, getProjetData, hasProjetData, saveProjetData as persistLocalProjetData } from '../data/mockProjet';
import { chargerDonneesDemarrage, isBackendId } from './demarrageApi';
import { chargerDonneesPlanification } from './planificationApi';
import type { ProjetData } from '../types';

export {
  mapActivite,
  mapApprovisionnement,
  mapCharte,
  mapCout,
  mapLivrable,
  mapPartiePrenante,
  mapPerimetre,
  mapProjet,
  mapRessource,
  mapRisque,
  mapWbs
} from './mappers';

/**
 * Charge les données d'un projet depuis le backend réel (Démarrage puis
 * Planification, cette dernière ayant besoin du projet à jour — notamment
 * projet.id_perimetre — pour résoudre le Perimetre) si projetId est un id
 * serveur, avec repli sur le cache local/mock (hors ligne ou id local non
 * encore synchronisé).
 */
export const fetchProjetData = async (projetId: string): Promise<ProjetData> => {
  const fallback = hasProjetData(projetId) ? getProjetData(projetId) : createMockProjetData(projetId);

  if (!isBackendId(projetId)) {
    return fallback;
  }

  try {
    const apresDemarrage = await chargerDonneesDemarrage(projetId, fallback);
    return await chargerDonneesPlanification(projetId, apresDemarrage);
  } catch {
    return fallback;
  }
};

export const loadProjetData = async (projetId: string): Promise<ProjetData> => {
  try {
    return await fetchProjetData(projetId);
  } catch {
    return createMockProjetData(projetId);
  }
};

export const saveProjetData = (projetId: string, data: ProjetData): void => {
  persistLocalProjetData(projetId, data);
};
