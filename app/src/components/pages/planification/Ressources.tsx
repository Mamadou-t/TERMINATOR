import { useMemo, useState } from 'react';
import { useProjet } from '../../../context/ProjetContext';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../hooks/useNotification';
import { formatApiError } from '../../../lib/api';
import { Badge, Button, Icon, IconButton, InputText, Modal, ModalFooter } from '../../';
import { InputSelect } from '../../InputSelect';
import { WbsTreeNav } from './WbsTreeNav';
import { TYPES_RESSOURCE, type QuantiteDisponible } from '../../../types';

const emptyDraft = { nom_ressource: '', role: '', type_ressource: TYPES_RESSOURCE[0] as string, quantite: '1', cout_unitaire: '', unite_mesure: 'jour' };

const montantRessource = (r: QuantiteDisponible) => (r.quantite ?? 1) * (r.cout_unitaire || 0);

export default function Ressources() {
  const { ressources, activites, wbs, upsertRessource, removeRessource } = useProjet();
  const { confirm, ConfirmDialog } = useConfirm();
  const { notifySuccess, notifyError, NotificationToast } = useNotification();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo(() => wbs.find(w => w.id_wbs === selectedNodeId) || null, [wbs, selectedNodeId]);
  // Activités racines du lot (les sous-activités sont rendues sous leur parente).
  const rootActivitesDuNoeud = useMemo(
    () => (selectedNode ? activites.filter(a => a.id_wbs === selectedNode.id_wbs && !a.id_activite_parent) : []),
    [activites, selectedNode]
  );
  const anyActiviteDuNoeud = useMemo(
    () => (selectedNode ? activites.some(a => a.id_wbs === selectedNode.id_wbs) : false),
    [activites, selectedNode]
  );

  const activiteEnfants = (parentId: string) => activites.filter(a => a.id_activite_parent === parentId);
  // #21 : le montant d'une activité mère cumule ses ressources et celles de ses sous-activités.
  const montantActiviteRollup = (activite: typeof activites[number]): number => {
    const propres = ressources
      .filter(r => r.id_activites === activite.id_activites)
      .reduce((s, r) => s + montantRessource(r), 0);
    const enfants = activiteEnfants(activite.id_activites)
      .reduce((s, c) => s + montantActiviteRollup(c), 0);
    return propres + enfants;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<{ id?: string; id_activites: string } & typeof emptyDraft>({ ...emptyDraft, id_activites: '' });

  const openAdd = (activiteId: string) => {
    setDraft({ ...emptyDraft, id_activites: activiteId });
    setIsOpen(true);
  };

  const openEdit = (ressource: QuantiteDisponible) => {
    setDraft({
      id: ressource.id_ressource,
      id_activites: ressource.id_activites || '',
      nom_ressource: ressource.nom_ressource,
      role: ressource.role || '',
      type_ressource: ressource.type_ressource || (TYPES_RESSOURCE[0] as string),
      quantite: String(ressource.quantite ?? 1),
      cout_unitaire: String(ressource.cout_unitaire ?? ''),
      unite_mesure: ressource.unite_mesure || 'jour'
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    const nom = draft.nom_ressource.trim();
    if (!nom || !draft.id_activites) return;

    setIsSaving(true);
    try {
      await upsertRessource({
        id_ressource: draft.id || `res-${Date.now()}`,
        nom_ressource: nom,
        role: draft.role.trim(),
        type_ressource: draft.type_ressource,
        quantite: draft.quantite ? Number(draft.quantite) : 1,
        cout_unitaire: draft.cout_unitaire ? Number(draft.cout_unitaire) : 0,
        unite_mesure: draft.unite_mesure,
        id_activites: draft.id_activites
      });
      setIsOpen(false);
      notifySuccess('Ressource enregistrée.');
    } catch (err) {
      notifyError(formatApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (ressource: QuantiteDisponible) => {
    const ok = await confirm({ message: `Supprimer la ressource "${ressource.nom_ressource}" ? Cette action est irréversible.` });
    if (!ok) return;
    removeRessource(ressource.id_ressource);
  };

  const countLabel = (nodeId: string) => {
    const activiteIds = new Set(activites.filter(a => a.id_wbs === nodeId).map(a => a.id_activites));
    const count = ressources.filter(r => r.id_activites && activiteIds.has(r.id_activites)).length;
    return count > 0 ? `${count} ressource${count > 1 ? 's' : ''}` : null;
  };

  // Bloc d'une activité (récursif : porte ses sous-activités et cumule leur montant).
  const renderActiviteBloc = (activite: typeof activites[number], depth = 0) => {
    const ressourcesActivite = ressources.filter(r => r.id_activites === activite.id_activites);
    const enfants = activiteEnfants(activite.id_activites);
    const isSub = depth > 0;
    return (
      <div key={activite.id_activites} className={isSub ? 'ml-4 border-l-2 border-blue-200 pl-3' : ''}>
        <div className={`flex items-center justify-between gap-2 mb-2 rounded-md px-2 py-1.5 ${isSub ? 'border border-slate-200 bg-slate-100/70' : 'border border-blue-100 bg-blue-50'}`}>
          <span className="flex items-center gap-1.5 min-w-0">
            {isSub
              ? <span className="shrink-0 font-mono text-slate-400">↳</span>
              : <Icon name="folder" size="xs" className="shrink-0 text-blue-600" />}
            <span className={`truncate ${isSub ? 'text-xs font-medium text-slate-600' : 'text-sm font-semibold text-blue-900'}`}>
              <span className="font-mono">{activite.code_activite}</span> — {activite.nom_activite}
            </span>
            {isSub && <Badge size="sm" variant="secondary">sous-activité</Badge>}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {enfants.length > 0 && (
              <span title="Total de l'activité, sous-activités incluses">
                <Badge size="sm" variant="info">
                  Total {montantActiviteRollup(activite).toLocaleString('fr-FR')} XOF
                </Badge>
              </span>
            )}
            <Button size="sm" onClick={() => openAdd(activite.id_activites)}>
              <Icon name="plus" size="xs" />
              Ajouter
            </Button>
          </div>
        </div>
        {ressourcesActivite.length === 0 ? (
          <p className="mb-2 pl-2 text-xs italic text-gray-400">Aucune ressource pour cette {isSub ? 'sous-activité' : 'activité'}.</p>
        ) : (
          <div className="mb-2 space-y-1.5">
            {ressourcesActivite.map((r) => (
              <div key={r.id_ressource} className="flex justify-between items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-blue-900 truncate">{r.nom_ressource}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge size="sm" variant="secondary">{r.type_ressource}</Badge>
                    <span className="text-xs text-gray-600">{r.quantite ?? 1} {r.unite_mesure} × {r.cout_unitaire.toLocaleString('fr-FR')}</span>
                    <Badge size="sm" variant="info">{montantRessource(r).toLocaleString('fr-FR')} XOF</Badge>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <IconButton variant="secondary" size="sm" icon="edit" tooltip="Modifier" onClick={() => openEdit(r)} />
                  <IconButton variant="danger" size="sm" icon="delete" tooltip="Supprimer" onClick={() => handleDelete(r)} />
                </div>
              </div>
            ))}
          </div>
        )}
        {enfants.length > 0 && (
          <div className="mt-3 space-y-4">
            {enfants.map((c) => renderActiviteBloc(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 text-sm">
      {NotificationToast}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-0 overflow-y-auto lg:overflow-hidden">
          <div className="overflow-y-auto p-4">
            <WbsTreeNav selectedNodeId={selectedNodeId} onSelect={setSelectedNodeId} countLabel={countLabel} />
          </div>

          <div className="border-t lg:border-l lg:border-t-0 border-gray-200 bg-white flex flex-col overflow-y-auto">
            {selectedNode ? (
              <>
                <div className="p-3 border-b border-gray-100 shrink-0">
                  <div className="text-sm font-medium text-blue-900">{selectedNode.code_wbs} — {selectedNode.nom_travail}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Ressources des activités de ce lot</div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {!anyActiviteDuNoeud ? (
                    <p className="text-sm text-gray-500">
                      Ajoutez d'abord une activité à ce lot dans WBS &amp; Activités avant d'y rattacher une ressource.
                    </p>
                  ) : (
                    rootActivitesDuNoeud.map((activite) => renderActiviteBloc(activite))
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-center px-4">
                Sélectionnez un élément dans l'arbre WBS
              </div>
            )}
          </div>
        </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={draft.id ? 'Modifier la ressource' : 'Ajouter une ressource'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <InputText label="Nom / désignation" value={draft.nom_ressource} onChange={(e) => setDraft(d => ({ ...d, nom_ressource: e.target.value }))} />
          <InputSelect
            label="Type"
            value={draft.type_ressource}
            onChange={(e) => setDraft(d => ({ ...d, type_ressource: e.target.value }))}
            options={TYPES_RESSOURCE.map((type) => ({ value: type, label: type }))}
          />
          <InputText label="Quantité" type="number" value={draft.quantite} onChange={(e) => setDraft(d => ({ ...d, quantite: e.target.value }))} />
          <InputText label="Unité de mesure" placeholder="jour, heure, m³, u..." value={draft.unite_mesure} onChange={(e) => setDraft(d => ({ ...d, unite_mesure: e.target.value }))} />
          <InputText label="Coût unitaire (XOF)" type="number" value={draft.cout_unitaire} onChange={(e) => setDraft(d => ({ ...d, cout_unitaire: e.target.value }))} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Montant</label>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              {((draft.quantite ? Number(draft.quantite) : 0) * (draft.cout_unitaire ? Number(draft.cout_unitaire) : 0)).toLocaleString('fr-FR')} XOF
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleSave} loading={isSaving}>Enregistrer</Button>
        </ModalFooter>
      </Modal>

      {ConfirmDialog}
    </div>
  );
}
