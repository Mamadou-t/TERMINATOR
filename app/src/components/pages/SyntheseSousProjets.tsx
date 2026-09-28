import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, Badge } from '../';
import { listerProjets } from '../../services/demarrageApi';
import { loadProjetData } from '../../services/projetApi';
import type { Projet, ProjetData } from '../../types';

const fmt = (v: number) => `${Math.round(v || 0).toLocaleString('fr-FR')} XOF`;

interface Figures {
  budgetPrev: number;
  coutVente: number;
  nbActivites: number;
  progression: number;
  risquesOuverts: number;
}

// Agrège les indicateurs clés d'un projet à partir de ses données chargées.
function figuresFromData(data: ProjetData): Figures {
  const lignes = data.lignesBudgetaires;
  const parents = new Set(lignes.filter(l => l.id_tache_parent).map(l => l.id_tache_parent));
  const budgetPrev = lignes
    .filter(l => !parents.has(l.id_ligne))
    .reduce((s, l) => s + (l.prix_unitaire || 0) * (l.quantite || 0), 0);

  const deboursesSec = data.ressources.reduce((s, r) => s + (r.quantite ?? 1) * (r.cout_unitaire || 0), 0);
  const tf = data.projet.taux_frais ?? 0;
  const tm = data.projet.taux_majorations ?? 0;
  const tma = data.projet.taux_marge_aleas ?? 0;
  const coutRevient = deboursesSec + deboursesSec * tf / 100 + deboursesSec * tm / 100;
  const coutVente = coutRevient + coutRevient * tma / 100;

  const nbActivites = data.activites.length;
  const progression = nbActivites
    ? Math.round(data.activites.reduce((s, a) => s + (a.progression ?? 0), 0) / nbActivites)
    : 0;
  const risquesOuverts = data.risques.filter(r => r.statut_risque === 'Ouvert').length;

  return { budgetPrev, coutVente, nbActivites, progression, risquesOuverts };
}

interface Ligne {
  projet: Projet;
  figures: Figures;
  principal: boolean;
}

// #12 : synthèse d'un projet principal regroupant les informations par sous-projet.
// Se masque automatiquement si le projet courant n'a pas de sous-projet.
export function SyntheseSousProjets({ projetId }: { projetId: string }) {
  const [lignes, setLignes] = useState<Ligne[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const tous = await listerProjets();
        const enfantsDe = (pid: string) => tous.filter(p => (p.id_projet_1 || '') === pid);
        const descendants: Projet[] = [];
        const walk = (pid: string) => {
          for (const enfant of enfantsDe(pid)) {
            descendants.push(enfant);
            walk(enfant.id_projet);
          }
        };
        walk(projetId);

        if (descendants.length === 0) {
          if (!cancelled) { setLignes([]); setLoading(false); }
          return;
        }

        const principal = tous.find(p => p.id_projet === projetId);
        const aCharger = principal ? [principal, ...descendants] : descendants;
        const datas = await Promise.all(aCharger.map(p => loadProjetData(p.id_projet)));
        if (cancelled) return;
        setLignes(aCharger.map((p, i) => ({
          projet: p,
          figures: figuresFromData(datas[i]),
          principal: !!principal && i === 0
        })));
      } catch {
        if (!cancelled) setLignes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projetId]);

  // On ne montre rien tant qu'on ne sait pas s'il y a des sous-projets (évite un flash).
  if (loading || !lignes || lignes.length === 0) return null;

  const sousProjets = lignes.filter(l => !l.principal);
  const total = lignes.reduce((acc, l) => ({
    budgetPrev: acc.budgetPrev + l.figures.budgetPrev,
    coutVente: acc.coutVente + l.figures.coutVente,
    nbActivites: acc.nbActivites + l.figures.nbActivites,
    risquesOuverts: acc.risquesOuverts + l.figures.risquesOuverts
  }), { budgetPrev: 0, coutVente: 0, nbActivites: 0, risquesOuverts: 0 });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-lg font-semibold text-slate-900">Synthèse des sous-projets</h4>
          <Badge variant="secondary">{sousProjets.length} sous-projet{sousProjets.length > 1 ? 's' : ''}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Projet</th>
                <th className="px-3 py-2 text-right">Budget prév.</th>
                <th className="px-3 py-2 text-right">Coût de vente</th>
                <th className="px-3 py-2 text-right">Activités</th>
                <th className="px-3 py-2 text-right">Progression</th>
                <th className="px-3 py-2 text-right">Risques ouverts</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.projet.id_projet} className={`border-b border-slate-100 ${l.principal ? 'bg-blue-50/40' : ''}`}>
                  <td className="px-3 py-2">
                    <span className={l.principal ? 'font-semibold text-blue-900' : 'text-slate-800'}>{l.projet.nom_projet || 'Projet sans nom'}</span>
                    {l.principal && <span className="ml-2 text-xs font-normal text-slate-500">(principal)</span>}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-700">{fmt(l.figures.budgetPrev)}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{fmt(l.figures.coutVente)}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{l.figures.nbActivites}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{l.figures.progression}%</td>
                  <td className="px-3 py-2 text-right text-slate-700">{l.figures.risquesOuverts}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-amber-50 font-semibold text-slate-800">
                <td className="px-3 py-2">Total consolidé</td>
                <td className="px-3 py-2 text-right text-amber-700">{fmt(total.budgetPrev)}</td>
                <td className="px-3 py-2 text-right text-amber-700">{fmt(total.coutVente)}</td>
                <td className="px-3 py-2 text-right">{total.nbActivites}</td>
                <td className="px-3 py-2 text-right">—</td>
                <td className="px-3 py-2 text-right">{total.risquesOuverts}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">Le total consolidé additionne le projet principal et l'ensemble de ses sous-projets (à tous les niveaux).</p>
      </CardContent>
    </Card>
  );
}
