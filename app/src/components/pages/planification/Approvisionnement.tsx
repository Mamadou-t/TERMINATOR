import { useMemo, useState } from 'react';
import { useProjet } from '../../../context/ProjetContext';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../hooks/useNotification';
import { formatApiError } from '../../../lib/api';
import { Badge, Button, Icon, IconButton, InputText, Modal, ModalFooter } from '../../';
import { InputSelect } from '../../InputSelect';
import { WbsTreeNav } from './WbsTreeNav';
import type { Approvisionnement } from '../../../types';

const STATUTS = ['Planifié', 'Commandé', 'Livré', 'Annulé'];

const emptyDraft = {
  type_materiel: '', quantite: '', unite_mesure: '', fournisseur: '',
  date_commande: '', date_livraison_prevue: '', date_livraison_relle: '', montant: '', statut_appro: 'Planifié'
};

export default function ApprovisionnementPage() {
  const { approvisionnements, activites, wbs, upsertApprovisionnement, removeApprovisionnement } = useProjet();
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
  const [draft, setDraft] = useState<{ id?: string; id_activite: string } & typeof emptyDraft>({ ...emptyDraft, id_activite: '' });

  const openAdd = (activiteId: string) => {
    setDraft({ ...emptyDraft, id_activite: activiteId });
    setIsOpen(true);
  };

  const openEdit = (item: Approvisionnement) => {
    setDraft({
      id: item.id_approvisionnement,
      id_activite: item.id_activite || '',
      type_materiel: item.type_materiel,
      quantite: String(item.quantite ?? ''),
      unite_mesure: item.unite_mesure || '',
      fournisseur: item.fournisseur || '',
      date_commande: item.date_commande || '',
      date_livraison_prevue: item.date_livraison_prevue || '',
      date_livraison_relle: item.date_livraison_relle || '',
      montant: String(item.montant ?? ''),
      statut_appro: item.statut_appro || 'Planifié'
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    const type = draft.type_materiel.trim();
    if (!type || !draft.id_activite) return;

    setIsSaving(true);
    try {
      await upsertApprovisionnement({
        id_approvisionnement: draft.id || `app-${Date.now()}`,
        type_materiel: type,
        quantite: draft.quantite ? Number(draft.quantite) : 0,
        unite_mesure: draft.unite_mesure.trim(),
        fournisseur: draft.fournisseur.trim(),
        date_commande: draft.date_commande || undefined,
        date_livraison_prevue: draft.date_livraison_prevue || undefined,
        date_livraison_relle: draft.date_livraison_relle || undefined,
        montant: draft.montant ? Number(draft.montant) : 0,
        statut_appro: draft.statut_appro,
        id_activite: draft.id_activite
      });
      setIsOpen(false);
      notifySuccess('Approvisionnement enregistré.');
    } catch (err) {
      notifyError(formatApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: Approvisionnement) => {
    const ok = await confirm({ message: `Supprimer l'approvisionnement "${item.type_materiel}" ? Cette action est irréversible.` });
    if (!ok) return;
    removeApprovisionnement(item.id_approvisionnement);
  };

  const countLabel = (nodeId: string) => {
    const activiteIds = new Set(activites.filter(a => a.id_wbs === nodeId).map(a => a.id_activites));
    const count = approvisionnements.filter(a => a.id_activite && activiteIds.has(a.id_activite)).length;
    return count > 0 ? `${count} approvisionnement${count > 1 ? 's' : ''}` : null;
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
                  <div className="text-xs text-gray-500 mt-0.5">Approvisionnements des activités de ce lot</div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {activitesDuNoeud.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Ajoutez d'abord une activité à ce lot dans WBS &amp; Activités avant d'y rattacher un approvisionnement.
                    </p>
                  ) : (
                    activitesDuNoeud.map((activite) => {
                      const itemsActivite = approvisionnements.filter(a => a.id_activite === activite.id_activites);
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
                          {itemsActivite.length === 0 ? (
                            <p className="text-xs text-gray-500">Aucun approvisionnement pour cette activité.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {itemsActivite.map((a) => (
                                <div key={a.id_approvisionnement} className="flex justify-between items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-blue-900 truncate">{a.type_materiel}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-600">{a.fournisseur} · {a.quantite} {a.unite_mesure}</span>
                                      <Badge size="sm" variant="info">{a.statut_appro}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{a.montant.toLocaleString('fr-FR')} XOF</p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <IconButton variant="secondary" size="sm" icon="edit" tooltip="Modifier" onClick={() => openEdit(a)} />
                                    <IconButton variant="danger" size="sm" icon="delete" tooltip="Supprimer" onClick={() => handleDelete(a)} />
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={draft.id ? "Modifier l'approvisionnement" : 'Ajouter un approvisionnement'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <InputText label="Type de matériel" value={draft.type_materiel} onChange={(e) => setDraft(d => ({ ...d, type_materiel: e.target.value }))} />
          <InputText label="Fournisseur" value={draft.fournisseur} onChange={(e) => setDraft(d => ({ ...d, fournisseur: e.target.value }))} />
          <InputText label="Quantité" type="number" value={draft.quantite} onChange={(e) => setDraft(d => ({ ...d, quantite: e.target.value }))} />
          <InputText label="Unité de mesure" value={draft.unite_mesure} onChange={(e) => setDraft(d => ({ ...d, unite_mesure: e.target.value }))} />
          <InputText label="Montant (XOF)" type="number" value={draft.montant} onChange={(e) => setDraft(d => ({ ...d, montant: e.target.value }))} />
          <InputSelect label="Statut" value={draft.statut_appro} onChange={(e) => setDraft(d => ({ ...d, statut_appro: e.target.value }))} options={STATUTS.map(s => ({ value: s, label: s }))} />
          <InputText label="Date de commande" type="date" value={draft.date_commande} onChange={(e) => setDraft(d => ({ ...d, date_commande: e.target.value }))} />
          <InputText label="Date de livraison prévue" type="date" value={draft.date_livraison_prevue} onChange={(e) => setDraft(d => ({ ...d, date_livraison_prevue: e.target.value }))} />
          <InputText label="Date de livraison réelle" type="date" value={draft.date_livraison_relle} onChange={(e) => setDraft(d => ({ ...d, date_livraison_relle: e.target.value }))} />
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
