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
}

const ProjetContext = createContext<ProjetContextValue | null>(null);

export function ProjetProvider({ children }: { children: ReactNode }) {
  const { projetId = '1' } = useParams();
  const [data, setDataState] = useState<ProjetData>(() => getProjetData(projetId));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isLoadingProjet, setIsLoadingProjet] = useState(true);

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
    persist({ ...data, lignesBudgetaires: data.lignesBudgetaires.filter(l => l.id_ligne !== id) });
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
    const saved = await sauverRisque(risque, risque.id_wbs || '');
    const exists = data.risques.some(r => r.id_risque === risque.id_risque);
    const risques = exists
      ? data.risques.map(r => r.id_risque === risque.id_risque ? saved : r)
      : [...data.risques, saved];
    persist({ ...data, risques });
    return saved;
  }, [data, persist]);

  const removeRisque = useCallback((id: EntityId) => {
    persist({ ...data, risques: data.risques.filter(r => r.id_risque !== id) });
    void supprimerRisque(id).catch(() => {});
  }, [data, persist]);

  const upsertWbs = useCallback(async (item: Wbs) => {
    const saved = await sauverWbs(item, data.projet.id_projet);
    const exists = data.wbs.some(w => w.id_wbs === item.id_wbs);
    const wbs = exists
      ? data.wbs.map(w => w.id_wbs === item.id_wbs ? saved : w)
      : [...data.wbs, saved];
    persist({ ...data, wbs });
    return saved;
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
    const saved = await sauverActivite(activite, activite.id_wbs);
    const exists = data.activites.some(a => a.id_activites === activite.id_activites);
    const activites = exists
      ? data.activites.map(a => a.id_activites === activite.id_activites ? saved : a)
      : [...data.activites, saved];
    persist({ ...data, activites });
    return saved;
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
    const saved = await sauverCout(cout, cout.id_activite);
    const exists = data.couts.some(c => c.id_cout === cout.id_cout);
    const couts = exists
      ? data.couts.map(c => c.id_cout === cout.id_cout ? saved : c)
      : [...data.couts, saved];
    persist({ ...data, couts });
    return saved;
  }, [data, persist]);

  const removeCout = useCallback((id: EntityId) => {
    persist({ ...data, couts: data.couts.filter(c => c.id_cout !== id) });
    void supprimerCout(id).catch(() => {});
  }, [data, persist]);

  const upsertRessource = useCallback(async (ressource: QuantiteDisponible) => {
    const saved = await sauverRessource(ressource, ressource.id_activites || '');
    const exists = data.ressources.some(r => r.id_ressource === ressource.id_ressource);
    const ressources = exists
      ? data.ressources.map(r => r.id_ressource === ressource.id_ressource ? saved : r)
      : [...data.ressources, saved];
    persist({ ...data, ressources });
    return saved;
  }, [data, persist]);

  const removeRessource = useCallback((id: EntityId) => {
    persist({ ...data, ressources: data.ressources.filter(r => r.id_ressource !== id) });
    void supprimerRessource(id).catch(() => {});
  }, [data, persist]);

  const upsertApprovisionnement = useCallback(async (item: Approvisionnement) => {
    const saved = await sauverApprovisionnement(item, item.id_activite);
    const exists = data.approvisionnements.some(a => a.id_approvisionnement === item.id_approvisionnement);
    const approvisionnements = exists
      ? data.approvisionnements.map(a => a.id_approvisionnement === item.id_approvisionnement ? saved : a)
      : [...data.approvisionnements, saved];
    persist({ ...data, approvisionnements });
    return saved;
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
      const savedLignesBudgetaires = await Promise.all(
        data.lignesBudgetaires.map((ligne) => sauverLigneBudgetaire(ligne, savedCharte.id_charte))
      );
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
    isLoadingProjet
  }), [
    projetId, data, updateProjet, updateCharte, updatePerimetre,
    upsertPartiePrenante, removePartiePrenante, getPartiesPrenantesProjet,
    upsertLigneBudgetaire, removeLigneBudgetaire,
    upsertLigneCalendrier, removeLigneCalendrier,
    upsertLivrable, removeLivrable, upsertRisque, removeRisque,
    upsertWbs, removeWbs, upsertActivite, removeActivite, upsertCout, removeCout,
    upsertRessource, removeRessource, upsertApprovisionnement, removeApprovisionnement,
    persist, saveToBackend, reloadFromBackend,
    isSaving, saveError, lastSavedAt, isLoadingProjet
  ]);

  return <ProjetContext.Provider value={value}>{children}</ProjetContext.Provider>;
}

export function useProjet() {
  const ctx = useContext(ProjetContext);
  if (!ctx) throw new Error('useProjet doit être utilisé dans ProjetProvider');
  return ctx;
}
