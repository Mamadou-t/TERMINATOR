import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router';
import { getProjetData, saveProjetData } from '../data/mockProjet';
import { loadProjetData } from '../services/projetApi';
import {
  creerOuMajCharte,
  creerOuMajProjet,
  isBackendId,
  sauverLigneBudgetaire,
  sauverLigneCalendrier,
  sauverLivrable,
  sauverPartiePrenante,
  supprimerLigneBudgetaire,
  supprimerLigneCalendrier,
  supprimerLivrable,
  supprimerPartiePrenante
} from '../services/demarrageApi';
import {
  sauverWbs,
  supprimerWbs,
  sauverActivite,
  supprimerActivite,
  sauverCout,
  supprimerCout,
  sauverRessource,
  supprimerRessource,
  sauverRisque,
  supprimerRisque,
  sauverApprovisionnement,
  supprimerApprovisionnement
} from '../services/planificationApi';
import { formatApiError } from '../lib/api';
import type {
  Activite,
  Approvisionnement,
  Charte,
  Cout,
  EntityId,
  Impliquer,
  LigneBudgetaire,
  LigneCalendrier,
  Livrable,
  PartiePrenante,
  Perimetre,
  Projet,
  ProjetData,
  QuantiteDisponible,
  Risque,
  Wbs
} from '../types';

interface ProjetContextValue {
  projetId: string;
  data: ProjetData;
  projet: Projet;
  charte: Charte;
  perimetre: Perimetre;
  partiesPrenantes: PartiePrenante[];
  impliquer: Impliquer[];
  wbs: Wbs[];
  activites: Activite[];
  lignesBudgetaires: LigneBudgetaire[];
  lignesCalendrier: LigneCalendrier[];
  livrables: Livrable[];
  risques: Risque[];
  couts: Cout[];
  ressources: QuantiteDisponible[];
  approvisionnements: Approvisionnement[];
  updateProjet: (patch: Partial<Projet>) => void;
  updateCharte: (patch: Partial<Charte>) => void;
  updatePerimetre: (patch: Partial<Perimetre>) => void;
  upsertPartiePrenante: (pp: PartiePrenante) => Promise<PartiePrenante>;
  removePartiePrenante: (id: EntityId) => void;
  getPartiesPrenantesProjet: () => PartiePrenante[];
  upsertLigneBudgetaire: (ligne: LigneBudgetaire) => void;
  removeLigneBudgetaire: (id: EntityId) => void;
  upsertLigneCalendrier: (ligne: LigneCalendrier) => void;
  removeLigneCalendrier: (id: EntityId) => void;
  upsertLivrable: (livrable: Livrable) => void;
  removeLivrable: (id: EntityId) => void;
  upsertRisque: (risque: Risque) => Promise<Risque>;
  removeRisque: (id: EntityId) => void;
  upsertWbs: (item: Wbs) => Promise<Wbs>;
  removeWbs: (id: EntityId) => void;
  upsertActivite: (activite: Activite) => Promise<Activite>;
  removeActivite: (id: EntityId) => void;
  upsertCout: (cout: Cout) => Promise<Cout>;
  removeCout: (id: EntityId) => void;
  upsertRessource: (ressource: QuantiteDisponible) => Promise<QuantiteDisponible>;
  removeRessource: (id: EntityId) => void;
  upsertApprovisionnement: (item: Approvisionnement) => Promise<Approvisionnement>;
  removeApprovisionnement: (id: EntityId) => void;
  setData: (data: ProjetData) => void;
  saveToBackend: () => Promise<void>;
  reloadFromBackend: () => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: Date | null;
  isLoadingProjet: boolean;
  /** #24 : des modifications locales attendent d'être synchronisées (créées hors ligne). */
  offlinePending: boolean;
}

const ProjetContext = createContext<ProjetContextValue | null>(null);

export function ProjetProvider({ children }: { children: ReactNode }) {
  const { projetId = '1' } = useParams();
  const [data, setDataState] = useState<ProjetData>(() => getProjetData(projetId));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isLoadingProjet, setIsLoadingProjet] = useState(true);
  // #24 : modifications enregistrées en local mais pas encore synchronisées (hors ligne).
  const [offlinePending, setOfflinePending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDataState(getProjetData(projetId));
    setIsLoadingProjet(true);

    loadProjetData(projetId).then((loaded) => {
      if (!cancelled) {
        setDataState(loaded);
      }
    }).finally(() => {
      if (!cancelled) {
        setIsLoadingProjet(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [projetId]);

  const persist = useCallback((next: ProjetData) => {
    setDataState(next);
    saveProjetData(projetId, next);
  }, [projetId]);

  // #24 : hors ligne, on garde la modification en local (repoussée plus tard).
  // Renvoie true si l'échec est dû à l'absence de réseau (à traiter en local).
  const estHorsLigne = (err: unknown) => {
    void err;
    return typeof navigator !== 'undefined' && !navigator.onLine;
  };

  const updateProjet = useCallback((patch: Partial<Projet>) => {
    persist({ ...data, projet: { ...data.projet, ...patch } });
  }, [data, persist]);

  const updateCharte = useCallback((patch: Partial<Charte>) => {
    persist({ ...data, charte: { ...data.charte, ...patch } });
  }, [data, persist]);

  const updatePerimetre = useCallback((patch: Partial<Perimetre>) => {
    persist({ ...data, perimetre: { ...data.perimetre, ...patch } });
  }, [data, persist]);

  const upsertPartiePrenante = useCallback(async (pp: PartiePrenante) => {
    // Enregistrement immédiat au backend pour un projet serveur (sinon local).
    let saved = pp;
    if (isBackendId(data.projet.id_projet)) {
      try {
        saved = await sauverPartiePrenante(pp, data.projet.id_projet);
      } catch (err) {
        setSaveError(formatApiError(err));
      }
    }

    const exists = data.partiesPrenantes.some(p => p.id_partie_prenante === pp.id_partie_prenante);
    const partiesPrenantes = exists
      ? data.partiesPrenantes.map(p => p.id_partie_prenante === pp.id_partie_prenante ? saved : p)
      : [...data.partiesPrenantes, saved];

    const link: Impliquer = { id_projet: data.projet.id_projet, id_partie_prenante: saved.id_partie_prenante };
    const impliquer = data.impliquer.some(i => i.id_partie_prenante === saved.id_partie_prenante)
      ? data.impliquer
      : [...data.impliquer, link];

    persist({ ...data, partiesPrenantes, impliquer });
    return saved;
  }, [data, persist]);

  const removePartiePrenante = useCallback((id: EntityId) => {
    persist({
      ...data,
      partiesPrenantes: data.partiesPrenantes.filter(p => p.id_partie_prenante !== id),
      impliquer: data.impliquer.filter(i => i.id_partie_prenante !== id),
      particiter: data.particiter.filter(p => p.id_partie_prenante !== id)
    });
    void supprimerPartiePrenante(id).catch(() => {});
  }, [data, persist]);

  const getPartiesPrenantesProjet = useCallback(() => {
    const ids = new Set(data.impliquer.filter(i => i.id_projet === data.projet.id_projet).map(i => i.id_partie_prenante));
    return data.partiesPrenantes.filter(p => ids.has(p.id_partie_prenante));
  }, [data]);

  const upsertLigneBudgetaire = useCallback((ligne: LigneBudgetaire) => {
    const exists = data.lignesBudgetaires.some(l => l.id_ligne === ligne.id_ligne);
    const lignesBudgetaires = exists
      ? data.lignesBudgetaires.map(l => l.id_ligne === ligne.id_ligne ? ligne : l)
      : [...data.lignesBudgetaires, ligne];
    persist({ ...data, lignesBudgetaires });
  }, [data, persist]);

  const removeLigneBudgetaire = useCallback((id: EntityId) => {
    // Retrait de la ligne et de ses sous-taches (cote backend, la FK
    // tache_parent est en CASCADE : supprimer le parent suffit).
    const enfantIds = new Set(
      data.lignesBudgetaires.filter(l => l.id_tache_parent === id).map(l => l.id_ligne)
    );
    persist({ ...data, lignesBudgetaires: data.lignesBudgetaires.filter(l => l.id_ligne !== id && !enfantIds.has(l.id_ligne)) });
    void supprimerLigneBudgetaire(id).catch(() => {});
  }, [data, persist]);

  const upsertLigneCalendrier = useCallback((ligne: LigneCalendrier) => {
    const exists = data.lignesCalendrier.some(l => l.id_ligne === ligne.id_ligne);
    const lignesCalendrier = exists
      ? data.lignesCalendrier.map(l => l.id_ligne === ligne.id_ligne ? ligne : l)
      : [...data.lignesCalendrier, ligne];
    persist({ ...data, lignesCalendrier });
  }, [data, persist]);

  const removeLigneCalendrier = useCallback((id: EntityId) => {
    persist({ ...data, lignesCalendrier: data.lignesCalendrier.filter(l => l.id_ligne !== id) });
    void supprimerLigneCalendrier(id).catch(() => {});
  }, [data, persist]);

  const upsertLivrable = useCallback((livrable: Livrable) => {
    const exists = data.livrables.some(l => l.id_livrable === livrable.id_livrable);
    const livrables = exists
      ? data.livrables.map(l => l.id_livrable === livrable.id_livrable ? livrable : l)
      : [...data.livrables, livrable];
    persist({ ...data, livrables });
  }, [data, persist]);

  const removeLivrable = useCallback((id: EntityId) => {
    persist({ ...data, livrables: data.livrables.filter(l => l.id_livrable !== id) });
    void supprimerLivrable(id).catch(() => {});
  }, [data, persist]);

  const upsertRisque = useCallback(async (risque: Risque) => {
    const applique = (r: Risque): ProjetData => {
      const exists = data.risques.some(x => x.id_risque === risque.id_risque);
      return { ...data, risques: exists ? data.risques.map(x => x.id_risque === risque.id_risque ? r : x) : [...data.risques, r] };
    };
    try {
      const saved = await sauverRisque(risque, risque.id_wbs || '');
      persist(applique(saved));
      return saved;
    } catch (err) {
      if (estHorsLigne(err)) { persist(applique(risque)); setOfflinePending(true); return risque; }
      throw err;
    }
  }, [data, persist]);

  const removeRisque = useCallback((id: EntityId) => {
    persist({ ...data, risques: data.risques.filter(r => r.id_risque !== id) });
    void supprimerRisque(id).catch(() => {});
  }, [data, persist]);

  const upsertWbs = useCallback(async (item: Wbs) => {
    const applique = (w: Wbs): ProjetData => {
      const exists = data.wbs.some(x => x.id_wbs === item.id_wbs);
      return { ...data, wbs: exists ? data.wbs.map(x => x.id_wbs === item.id_wbs ? w : x) : [...data.wbs, w] };
    };
    try {
      const saved = await sauverWbs(item, data.projet.id_projet);
      persist(applique(saved));
      return saved;
    } catch (err) {
      if (estHorsLigne(err)) { persist(applique(item)); setOfflinePending(true); return item; }
      throw err;
    }
  }, [data, persist]);

  const removeWbs = useCallback((id: EntityId) => {
    const toRemove = new Set<EntityId>();
    const collect = (wbsId: EntityId) => {
      toRemove.add(wbsId);
      data.wbs.filter(w => w.id_wbs_1 === wbsId).forEach(w => collect(w.id_wbs));
    };
    collect(id);
    const removedActiviteIds = new Set(
      data.activites.filter(a => toRemove.has(a.id_wbs)).map(a => a.id_activites)
    );
    persist({
      ...data,
      wbs: data.wbs.filter(w => !toRemove.has(w.id_wbs)),
      activites: data.activites.filter(a => !toRemove.has(a.id_wbs)),
      risques: data.risques.filter(r => !toRemove.has(r.id_wbs || '')),
      couts: data.couts.filter(c => !removedActiviteIds.has(c.id_activite || '')),
      ressources: data.ressources.filter(r => !removedActiviteIds.has(r.id_activites || ''))
    });
    void supprimerWbs(id).catch(() => {});
  }, [data, persist]);

  const upsertActivite = useCallback(async (activite: Activite) => {
    const applique = (a: Activite): ProjetData => {
      const exists = data.activites.some(x => x.id_activites === activite.id_activites);
      return { ...data, activites: exists ? data.activites.map(x => x.id_activites === activite.id_activites ? a : x) : [...data.activites, a] };
    };
    try {
      const saved = await sauverActivite(activite, activite.id_wbs);
      persist(applique(saved));
      return saved;
    } catch (err) {
      if (estHorsLigne(err)) { persist(applique(activite)); setOfflinePending(true); return activite; }
      throw err;
    }
  }, [data, persist]);

  const removeActivite = useCallback((id: EntityId) => {
    persist({
      ...data,
      activites: data.activites.filter(a => a.id_activites !== id),
      couts: data.couts.filter(c => c.id_activite !== id),
      ressources: data.ressources.filter(r => r.id_activites !== id),
      approvisionnements: data.approvisionnements.filter(a => a.id_activite !== id)
    });
    void supprimerActivite(id).catch(() => {});
  }, [data, persist]);

  const upsertCout = useCallback(async (cout: Cout) => {
    const applique = (c: Cout): ProjetData => {
      const exists = data.couts.some(x => x.id_cout === cout.id_cout);
      return { ...data, couts: exists ? data.couts.map(x => x.id_cout === cout.id_cout ? c : x) : [...data.couts, c] };
    };
    try {
      const saved = await sauverCout(cout, cout.id_activite);
      persist(applique(saved));
      return saved;
    } catch (err) {
      if (estHorsLigne(err)) { persist(applique(cout)); setOfflinePending(true); return cout; }
      throw err;
    }
  }, [data, persist]);

  const removeCout = useCallback((id: EntityId) => {
    persist({ ...data, couts: data.couts.filter(c => c.id_cout !== id) });
    void supprimerCout(id).catch(() => {});
  }, [data, persist]);

  const upsertRessource = useCallback(async (ressource: QuantiteDisponible) => {
    const applique = (r: QuantiteDisponible): ProjetData => {
      const exists = data.ressources.some(x => x.id_ressource === ressource.id_ressource);
      return { ...data, ressources: exists ? data.ressources.map(x => x.id_ressource === ressource.id_ressource ? r : x) : [...data.ressources, r] };
    };
    try {
      const saved = await sauverRessource(ressource, ressource.id_activites || '');
      persist(applique(saved));
      return saved;
    } catch (err) {
      if (estHorsLigne(err)) { persist(applique(ressource)); setOfflinePending(true); return ressource; }
      throw err;
    }
  }, [data, persist]);

  const removeRessource = useCallback((id: EntityId) => {
    persist({ ...data, ressources: data.ressources.filter(r => r.id_ressource !== id) });
    void supprimerRessource(id).catch(() => {});
  }, [data, persist]);

  const upsertApprovisionnement = useCallback(async (item: Approvisionnement) => {
    const applique = (a: Approvisionnement): ProjetData => {
      const exists = data.approvisionnements.some(x => x.id_approvisionnement === item.id_approvisionnement);
      return { ...data, approvisionnements: exists ? data.approvisionnements.map(x => x.id_approvisionnement === item.id_approvisionnement ? a : x) : [...data.approvisionnements, a] };
    };
    try {
      const saved = await sauverApprovisionnement(item, item.id_activite);
      persist(applique(saved));
      return saved;
    } catch (err) {
      if (estHorsLigne(err)) { persist(applique(item)); setOfflinePending(true); return item; }
      throw err;
    }
  }, [data, persist]);

  const removeApprovisionnement = useCallback((id: EntityId) => {
    persist({ ...data, approvisionnements: data.approvisionnements.filter(a => a.id_approvisionnement !== id) });
    void supprimerApprovisionnement(id).catch(() => {});
  }, [data, persist]);

  const saveToBackend = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const savedProjet = await creerOuMajProjet(data.projet);
      const savedCharte = await creerOuMajCharte(data.charte, savedProjet.id_projet);
      // Budget : les taches parentes sont sauvegardees d'abord pour obtenir
      // leur id backend, puis les sous-taches avec leur id_tache_parent remappe
      // (une ligne ne peut referencer son parent qu'une fois celui-ci enregistre).
      const budgetIdMap = new Map<string, string>();
      const lignesParents = data.lignesBudgetaires.filter((l) => !l.id_tache_parent);
      const lignesEnfants = data.lignesBudgetaires.filter((l) => l.id_tache_parent);
      const savedParents = await Promise.all(
        lignesParents.map((ligne) => sauverLigneBudgetaire(ligne, savedCharte.id_charte))
      );
      lignesParents.forEach((ligne, index) => {
        const saved = savedParents[index];
        if (saved) budgetIdMap.set(ligne.id_ligne, saved.id_ligne);
      });
      const savedEnfants = await Promise.all(
        lignesEnfants.map((ligne) => sauverLigneBudgetaire(
          { ...ligne, id_tache_parent: budgetIdMap.get(ligne.id_tache_parent!) ?? ligne.id_tache_parent },
          savedCharte.id_charte
        ))
      );
      const savedLignesBudgetaires = [...savedParents, ...savedEnfants];
      const savedLignesCalendrier = await Promise.all(
        data.lignesCalendrier.map((ligne) => sauverLigneCalendrier(ligne, savedCharte.id_charte))
      );
      const savedLivrables = await Promise.all(
        data.livrables.map((livrable) => sauverLivrable(livrable, savedProjet.id_projet))
      );

      // Les livrables reçoivent leur id backend à la sauvegarde : on remappe
      // les clés RACI (qui référencent les livrables) de l'ancien vers le
      // nouvel id avant d'enregistrer les parties prenantes.
      const livrableIdMap = new Map<string, string>();
      data.livrables.forEach((livrable, index) => {
        const saved = savedLivrables[index];
        if (saved) livrableIdMap.set(livrable.id_livrable, saved.id_livrable);
      });
      const remapRaci = (raci?: Record<string, string[]>) => {
        if (!raci) return {};
        const next: Record<string, string[]> = {};
        for (const [livrableId, valeurs] of Object.entries(raci)) {
          next[livrableIdMap.get(livrableId) ?? livrableId] = valeurs;
        }
        return next;
      };

      const savedPartiesPrenantes = await Promise.all(
        data.partiesPrenantes.map((pp) => sauverPartiePrenante(
          { ...pp, raci: remapRaci(pp.raci) as PartiePrenante['raci'] },
          savedProjet.id_projet
        ))
      );
      const savedImpliquer = savedPartiesPrenantes.map((pp) => ({
        id_projet: savedProjet.id_projet,
        id_partie_prenante: pp.id_partie_prenante
      }));

      persist({
        ...data,
        projet: savedProjet,
        charte: savedCharte,
        lignesBudgetaires: savedLignesBudgetaires,
        lignesCalendrier: savedLignesCalendrier,
        livrables: savedLivrables,
        partiesPrenantes: savedPartiesPrenantes,
        impliquer: savedImpliquer
      });
      setLastSavedAt(new Date());
      setOfflinePending(false);
    } catch (err) {
      setSaveError(formatApiError(err));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [data, persist]);

  const reloadFromBackend = useCallback(async () => {
    const loaded = await loadProjetData(projetId);
    setDataState(loaded);
    saveProjetData(projetId, loaded);
    setSaveError(null);
  }, [projetId]);

  const value = useMemo<ProjetContextValue>(() => ({
    projetId,
    data,
    projet: data.projet,
    charte: data.charte,
    perimetre: data.perimetre,
    partiesPrenantes: data.partiesPrenantes,
    impliquer: data.impliquer,
    wbs: data.wbs,
    activites: data.activites,
    lignesBudgetaires: data.lignesBudgetaires,
    lignesCalendrier: data.lignesCalendrier,
    livrables: data.livrables,
    risques: data.risques,
    couts: data.couts,
    ressources: data.ressources,
    approvisionnements: data.approvisionnements,
    updateProjet,
    updateCharte,
    updatePerimetre,
    upsertPartiePrenante,
    removePartiePrenante,
    getPartiesPrenantesProjet,
    upsertLigneBudgetaire,
    removeLigneBudgetaire,
    upsertLigneCalendrier,
    removeLigneCalendrier,
    upsertLivrable,
    removeLivrable,
    upsertRisque,
    removeRisque,
    upsertWbs,
    removeWbs,
    upsertActivite,
    removeActivite,
    upsertCout,
    removeCout,
    upsertRessource,
    removeRessource,
    upsertApprovisionnement,
    removeApprovisionnement,
    setData: persist,
    saveToBackend,
    reloadFromBackend,
    isSaving,
    saveError,
    lastSavedAt,
    isLoadingProjet,
    offlinePending
  }), [
    projetId, data, updateProjet, updateCharte, updatePerimetre,
    upsertPartiePrenante, removePartiePrenante, getPartiesPrenantesProjet,
    upsertLigneBudgetaire, removeLigneBudgetaire,
    upsertLigneCalendrier, removeLigneCalendrier,
    upsertLivrable, removeLivrable, upsertRisque, removeRisque,
    upsertWbs, removeWbs, upsertActivite, removeActivite, upsertCout, removeCout,
    upsertRessource, removeRessource, upsertApprovisionnement, removeApprovisionnement,
    persist, saveToBackend, reloadFromBackend,
    isSaving, saveError, lastSavedAt, isLoadingProjet, offlinePending
  ]);

  return <ProjetContext.Provider value={value}>{children}</ProjetContext.Provider>;
}

export function useProjet() {
  const ctx = useContext(ProjetContext);
  if (!ctx) throw new Error('useProjet doit être utilisé dans ProjetProvider');
  return ctx;
}
