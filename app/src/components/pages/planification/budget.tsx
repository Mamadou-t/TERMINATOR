import { useMemo } from 'react';
import { Card, CardContent, CardHeader, InputText, KpiCard } from '../../';
import { useProjet } from '../../../context/ProjetContext';
import { useNotification } from '../../../hooks/useNotification';
import { formatApiError } from '../../../lib/api';
import { creerOuMajProjet } from '../../../services/demarrageApi';
import { TYPES_RESSOURCE } from '../../../types';

const fmt = (v: number) => `${Math.round(v || 0).toLocaleString('fr-FR')} XOF`;

export default function Budget() {
  const { ressources, projet, updateProjet } = useProjet();
  const { notifySuccess, notifyError, NotificationToast } = useNotification();

  // Déboursé sec = somme (quantité × coût unitaire) des ressources, par type.
  const parType = useMemo(
    () => TYPES_RESSOURCE.map((type) => ({
      type,
      montant: ressources
        .filter((r) => r.type_ressource === type)
        .reduce((s, r) => s + (r.quantite ?? 1) * (r.cout_unitaire || 0), 0)
    })),
    [ressources]
  );
  const autres = useMemo(
    () => ressources
      .filter((r) => !(TYPES_RESSOURCE as readonly string[]).includes(r.type_ressource))
      .reduce((s, r) => s + (r.quantite ?? 1) * (r.cout_unitaire || 0), 0),
    [ressources]
  );

  const deboursesSec = parType.reduce((s, t) => s + t.montant, 0) + autres;

  const tf = projet.taux_frais ?? 0;
  const tm = projet.taux_majorations ?? 0;
  const tma = projet.taux_marge_aleas ?? 0;
  const frais = deboursesSec * tf / 100;
  const majorations = deboursesSec * tm / 100;
  const coutRevient = deboursesSec + frais + majorations;
  const margeAleas = coutRevient * tma / 100;
  const coutVente = coutRevient + margeAleas;

  const persistTaux = async () => {
    try {
      const saved = await creerOuMajProjet(projet);
      updateProjet({ ...saved });
      notifySuccess('Taux enregistrés.');
    } catch (err) {
      notifyError(formatApiError(err));
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 text-sm">
      {NotificationToast}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-5xl space-y-4">

          {/* Synthèse */}
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard value={fmt(deboursesSec)} label="Déboursé sec" />
            <KpiCard value={fmt(coutRevient)} label="Coût de revient" barColor="bg-blue-500" />
            <KpiCard value={fmt(coutVente)} label="Coût de vente" barColor="bg-green-600" valueClassName="text-green-700" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">

            {/* Déboursé sec par type */}
            <Card padding="lg">
              <CardHeader>
                <h4 className="text-base font-semibold text-slate-900">Déboursé sec</h4>
                <p className="mt-0.5 text-xs text-gray-500">Alimenté par la Gestion des ressources</p>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <tbody>
                    {parType.map((t) => (
                      <tr key={t.type} className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">{t.type}</td>
                        <td className="py-2 text-right font-medium text-gray-900">{fmt(t.montant)}</td>
                      </tr>
                    ))}
                    {autres > 0 && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-500">Autres</td>
                        <td className="py-2 text-right text-gray-600">{fmt(autres)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="pt-3 text-right text-sm font-semibold text-gray-700">Déboursé sec</td>
                      <td className="pt-3 text-right text-base font-bold text-[#1e3a5f]">{fmt(deboursesSec)}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {/* Cascade des coûts */}
            <Card padding="lg">
              <CardHeader>
                <h4 className="text-base font-semibold text-slate-900">Cascade des coûts</h4>
                <p className="mt-0.5 text-xs text-gray-500">Taux appliqués au niveau du projet</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <Ligne label="Déboursé sec" value={fmt(deboursesSec)} />

                  <TauxLigne
                    label="Frais"
                    taux={tf}
                    montant={frais}
                    onChange={(v) => updateProjet({ taux_frais: v })}
                    onBlur={persistTaux}
                  />
                  <TauxLigne
                    label="Majorations"
                    taux={tm}
                    montant={majorations}
                    onChange={(v) => updateProjet({ taux_majorations: v })}
                    onBlur={persistTaux}
                  />

                  <Ligne label="Coût de revient" value={fmt(coutRevient)} strong />

                  <TauxLigne
                    label="Marge & aléas"
                    taux={tma}
                    montant={margeAleas}
                    onChange={(v) => updateProjet({ taux_marge_aleas: v })}
                    onBlur={persistTaux}
                  />

                  <div className="mt-2 flex items-center justify-between rounded-md bg-green-50 px-3 py-2">
                    <span className="font-semibold text-green-800">Coût de vente</span>
                    <span className="text-base font-bold text-green-700">{fmt(coutVente)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Ligne({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between border-b border-gray-100 py-2 ${strong ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function TauxLigne({ label, taux, montant, onChange, onBlur }: {
  label: string; taux: number; montant: number;
  onChange: (v: number) => void; onBlur: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <InputText
            type="number"
            value={String(taux)}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            onBlur={onBlur}
            className="w-16 text-right"
            size="sm"
          />
          <span className="text-xs text-gray-500">%</span>
        </div>
        <span className="w-28 text-right font-medium text-gray-900">{fmt(montant)}</span>
      </div>
    </div>
  );
}
