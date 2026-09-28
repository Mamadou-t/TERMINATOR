import { useEffect, useState } from 'react';
import { listerProjets } from '../services/demarrageApi';
import type { Projet } from '../types';

/**
 * Reconstruit la chaîne des projets d'un projet donné, du projet de base
 * (racine) jusqu'au projet courant : [racine, ..., parent, courant].
 * Utile pour le fil d'Ariane du titre en cas de sous-projets.
 */
export function useProjetChain(projetId?: string): Projet[] {
  const [chain, setChain] = useState<Projet[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!projetId) {
      setChain([]);
      return;
    }
    listerProjets()
      .then((all) => {
        if (cancelled) return;
        const byId = new Map(all.map((p) => [p.id_projet, p]));
        const out: Projet[] = [];
        const seen = new Set<string>();
        let cur = byId.get(projetId);
        while (cur && !seen.has(cur.id_projet)) {
          out.unshift(cur);
          seen.add(cur.id_projet);
          cur = cur.id_projet_1 ? byId.get(cur.id_projet_1) : undefined;
        }
        setChain(out);
      })
      .catch(() => {
        if (!cancelled) setChain([]);
      });
    return () => {
      cancelled = true;
    };
  }, [projetId]);

  return chain;
}
