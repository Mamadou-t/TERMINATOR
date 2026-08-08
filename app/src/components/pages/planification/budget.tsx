import { useMemo, useState } from 'react';
import { Badge, Button, Icon, IconButton, InputText, Modal, ModalFooter } from '../../index';
import { InputSelect } from '../../InputSelect';
import { useProjet } from '../../../context/ProjetContext';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../hooks/useNotification';
import { formatApiError } from '../../../lib/api';
import { WbsTreeNav } from './WbsTreeNav';
import type { Cout } from '../../../types';

const TYPES_COUT = ["Main d'œuvre", 'Matériaux', 'Sous-traitance', 'Frais généraux', 'Logiciel', 'Infrastructure', 'Général'];

const emptyDraft = { poste_budgetaire: '', montant_estime: '', montant_reel: '', devise: 'XOF', type_cout: 'Général' };

export default function Budget() {
  const { couts, activites, wbs, upsertCout, removeCout } = useProjet();
  const { confirm, ConfirmDialog } = useConfirm();
  const { notifySuccess, notifyError, NotificationToast } = useNotification();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo(() => wbs.find(w => w.id_wbs === selectedNodeId) || null, [wbs, selectedNodeId]);
  const activitesDuNoeud = useMemo(
    () => (selectedNode ? activites.filter(a => a.id_wbs === selectedNode.id_wbs) : []),
    [activites, selectedNode]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<{ id?: string; id_activite: string } & typeof emptyDraft>({ ...emptyDraft, id_activite: '' });
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = (activiteId: string) => {
    setDraft({ ...emptyDraft, id_activite: activiteId });
    setIsOpen(true);
  };

  const openEdit = (cout: Cout) => {
    setDraft({
      id: cout.id_cout,
      id_activite: cout.id_activite || '',
      poste_budgetaire: cout.poste_budgetaire,
      montant_estime: String(cout.montant_estime ?? ''),
      montant_reel: cout.montant_reel != null ? String(cout.montant_reel) : '',
      devise: cout.devise || 'XOF',
      type_cout: cout.type_cout || 'Général'
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    const poste = draft.poste_budgetaire.trim();
    if (!poste) return;

    setIsSaving(true);
    try {
      await upsertCout({
        id_cout: draft.id || `cout-${Date.now()}`,
        poste_budgetaire: poste,
        montant_estime: draft.montant_estime ? Number(draft.montant_estime) : 0,
        montant_reel: draft.montant_reel ? Number(draft.montant_reel) : undefined,
        devise: draft.devise,
        type_cout: draft.type_cout,
        id_activite: draft.id_activite || undefined
      });
      setIsOpen(false);
      notifySuccess('Ligne de coût enregistrée.');
    } catch (err) {
      notifyError(formatApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cout: Cout) => {
    const ok = await confirm({ message: `Supprimer la ligne de coût "${cout.poste_budgetaire}" ? Cette action est irréversible.` });
    if (!ok) return;
    removeCout(cout.id_cout);
  };

  const countLabel = (nodeId: string) => {
    const activiteIds = new Set(activites.filter(a => a.id_wbs === nodeId).map(a => a.id_activites));
    const count = couts.filter(c => c.id_activite && activiteIds.has(c.id_activite)).length;
    return count > 0 ? `${count} coût${count > 1 ? 's' : ''}` : null;
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
                <div className="text-xs text-gray-500 mt-0.5">Coûts des activités de ce lot</div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {activitesDuNoeud.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Ajoutez d'abord une activité à ce lot dans WBS &amp; Activités avant d'y rattacher un coût.
                  </p>
                ) : (
                  activitesDuNoeud.map((activite) => {
                    const coutsActivite = couts.filter(c => c.id_activite === activite.id_activites);
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
                        {coutsActivite.length === 0 ? (
                          <p className="text-xs text-gray-500">Aucun coût pour cette activité.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {coutsActivite.map((cout) => (
                              <div key={cout.id_cout} className="flex justify-between items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-blue-900 truncate">{cout.poste_budgetaire}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge size="sm" variant="info">{cout.type_cout}</Badge>
                                    <span className="text-xs text-gray-600">
                                      {(cout.montant_estime || 0).toLocaleString('fr-FR')} {cout.devise}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <IconButton variant="secondary" size="sm" icon="edit" tooltip="Modifier" onClick={() => openEdit(cout)} />
                                  <IconButton variant="danger" size="sm" icon="delete" tooltip="Supprimer" onClick={() => handleDelete(cout)} />
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={draft.id ? 'Modifier la ligne de coût' : 'Ajouter une ligne de coût'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <InputText label="Poste budgétaire" value={draft.poste_budgetaire} onChange={(e) => setDraft(d => ({ ...d, poste_budgetaire: e.target.value }))} />
          <InputSelect
            label="Type"
            value={draft.type_cout}
            onChange={(e) => setDraft(d => ({ ...d, type_cout: e.target.value }))}
            options={TYPES_COUT.map((type) => ({ value: type, label: type }))}
          />
          <InputText label="Montant estimé (XOF)" type="number" value={draft.montant_estime} onChange={(e) => setDraft(d => ({ ...d, montant_estime: e.target.value }))} />
          <InputText label="Montant réel (XOF)" type="number" value={draft.montant_reel} onChange={(e) => setDraft(d => ({ ...d, montant_reel: e.target.value }))} />
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
