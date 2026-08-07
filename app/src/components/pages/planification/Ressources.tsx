import { useMemo, useState } from 'react';
import { useProjet } from '../../../context/ProjetContext';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../hooks/useNotification';
import { formatApiError } from '../../../lib/api';
import { Badge, Button, Icon, IconButton, InputText, Modal, ModalFooter } from '../../';
import { InputSelect } from '../../InputSelect';
import { WbsTreeNav } from './WbsTreeNav';
import type { QuantiteDisponible } from '../../../types';

const TYPES_RESSOURCE = ['Humaine', 'Matériel', 'Équipement'];

const emptyDraft = { nom_ressource: '', role: '', type_ressource: 'Humaine', cout_unitaire: '', unite_mesure: 'jour' };

export default function Ressources() {
  const { ressources, activites, wbs, upsertRessource, removeRessource } = useProjet();
  const { confirm, ConfirmDialog } = useConfirm();
  const { notifySuccess, notifyError, NotificationToast } = useNotification();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo(() => wbs.find(w => w.id_wbs === selectedNodeId) || null, [wbs, selectedNodeId]);
  const activitesDuNoeud = useMemo(
    () => (selectedNode ? activites.filter(a => a.id_wbs === selectedNode.id_wbs) : []),
    [activites, selectedNode]
  );

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
      type_ressource: ressource.type_ressource || 'Humaine',
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

  return (
    <div className="flex h-full flex-col bg-gray-50 text-sm">
      {NotificationToast}

      <div className="flex-1 grid grid-cols-[1fr_380px] min-h-0">
          <div className="overflow-y-auto p-4">
            <WbsTreeNav selectedNodeId={selectedNodeId} onSelect={setSelectedNodeId} countLabel={countLabel} />
          </div>

          <div className="border-l border-gray-200 bg-white flex flex-col overflow-y-auto">
            {selectedNode ? (
              <>
                <div className="p-3 border-b border-gray-100 shrink-0">
                  <div className="text-sm font-medium text-blue-900">{selectedNode.code_wbs} — {selectedNode.nom_travail}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Ressources des activités de ce lot</div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {activitesDuNoeud.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Ajoutez d'abord une activité à ce lot dans WBS &amp; Activités avant d'y rattacher une ressource.
                    </p>
                  ) : (
                    activitesDuNoeud.map((activite) => {
                      const ressourcesActivite = ressources.filter(r => r.id_activites === activite.id_activites);
                      return (
                        <div key={activite.id_activites}>
                          <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-100">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                              {activite.code_activite} — {activite.nom_activite}
                            </span>
                            <Button size="sm" onClick={() => openAdd(activite.id_activites)}>
                              <Icon name="plus" size="xs" />
                              Ajouter
                            </Button>
                          </div>
                          {ressourcesActivite.length === 0 ? (
                            <p className="text-xs text-gray-500">Aucune ressource pour cette activité.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {ressourcesActivite.map((r) => (
                                <div key={r.id_ressource} className="flex justify-between items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-blue-900 truncate">{r.nom_ressource}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-600">{r.role} · {r.type_ressource}</span>
                                      <Badge size="sm" variant="info">{r.cout_unitaire.toLocaleString('fr-FR')} XOF / {r.unite_mesure}</Badge>
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
                        </div>
                      );
                    })
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
          <InputText label="Nom" value={draft.nom_ressource} onChange={(e) => setDraft(d => ({ ...d, nom_ressource: e.target.value }))} />
          <InputText label="Rôle" value={draft.role} onChange={(e) => setDraft(d => ({ ...d, role: e.target.value }))} />
          <InputSelect
            label="Type"
            value={draft.type_ressource}
            onChange={(e) => setDraft(d => ({ ...d, type_ressource: e.target.value }))}
            options={TYPES_RESSOURCE.map((type) => ({ value: type, label: type }))}
          />
          <InputText label="Coût unitaire (XOF)" type="number" value={draft.cout_unitaire} onChange={(e) => setDraft(d => ({ ...d, cout_unitaire: e.target.value }))} />
          <InputText label="Unité de mesure" placeholder="jour, heure, m³..." value={draft.unite_mesure} onChange={(e) => setDraft(d => ({ ...d, unite_mesure: e.target.value }))} />
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
