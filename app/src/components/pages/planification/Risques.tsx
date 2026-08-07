import { useMemo, useState } from 'react';
import { useProjet } from '../../../context/ProjetContext';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../hooks/useNotification';
import { formatApiError } from '../../../lib/api';
import { Badge, Button, Icon, IconButton, InputText, Modal, ModalFooter } from '../../';
import { InputSelect } from '../../InputSelect';
import { WbsTreeNav } from './WbsTreeNav';
import { niveauRisqueToScore } from '../../../types/helpers';
import type { Risque } from '../../../types';

const NIVEAUX = ['Très Faible', 'Faible', 'Moyen', 'Élevé', 'Très Élevé'];
const CATEGORIES = ['Technique', 'Financier', 'Planning', 'Fournisseur', 'Organisationnel', 'Général'];
const STATUTS = ['Ouvert', 'En cours de traitement', 'Clôturé'];

const emptyDraft = {
  description_risque: '', probabilite: 'Moyen', impact: 'Moyen', description_mitigation: '',
  responsable_mitigation: '', categorie_risque: 'Général', statut_risque: 'Ouvert'
};

export default function RisquesPlanification() {
  const { risques, wbs, upsertRisque, removeRisque } = useProjet();
  const { confirm, ConfirmDialog } = useConfirm();
  const { notifySuccess, notifyError, NotificationToast } = useNotification();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo(() => wbs.find(w => w.id_wbs === selectedNodeId) || null, [wbs, selectedNodeId]);
  const risquesDuNoeud = useMemo(
    () => (selectedNode ? risques.filter(r => r.id_wbs === selectedNode.id_wbs) : []),
    [risques, selectedNode]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<{ id?: string } & typeof emptyDraft>(emptyDraft);

  const openAdd = () => {
    setDraft(emptyDraft);
    setIsOpen(true);
  };

  const openEdit = (risque: Risque) => {
    setDraft({
      id: risque.id_risque,
      description_risque: risque.description_risque,
      probabilite: risque.probabilite,
      impact: risque.impact,
      description_mitigation: risque.description_mitigation || '',
      responsable_mitigation: risque.responsable_mitigation || '',
      categorie_risque: risque.categorie_risque || 'Général',
      statut_risque: risque.statut_risque || 'Ouvert'
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    const description = draft.description_risque.trim();
    if (!description || !selectedNode) return;

    setIsSaving(true);
    try {
      await upsertRisque({
        id_risque: draft.id || `ris-${Date.now()}`,
        description_risque: description,
        probabilite: draft.probabilite,
        impact: draft.impact,
        score_risque: niveauRisqueToScore(draft.probabilite) * niveauRisqueToScore(draft.impact),
        description_mitigation: draft.description_mitigation.trim(),
        responsable_mitigation: draft.responsable_mitigation.trim(),
        categorie_risque: draft.categorie_risque,
        date_identification: new Date().toISOString().slice(0, 10),
        statut_risque: draft.statut_risque,
        id_wbs: selectedNode.id_wbs
      });
      setIsOpen(false);
      notifySuccess('Risque enregistré.');
    } catch (err) {
      notifyError(formatApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (risque: Risque) => {
    const ok = await confirm({ message: 'Supprimer ce risque ? Cette action est irréversible.' });
    if (!ok) return;
    removeRisque(risque.id_risque);
  };

  const countLabel = (nodeId: string) => {
    const count = risques.filter(r => r.id_wbs === nodeId).length;
    return count > 0 ? `${count} risque${count > 1 ? 's' : ''}` : null;
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
                <div className="p-3 border-b border-gray-100 shrink-0 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-900">{selectedNode.code_wbs} — {selectedNode.nom_travail}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Risques rattachés à ce lot</div>
                  </div>
                  <Button size="sm" onClick={openAdd}>
                    <Icon name="plus" size="xs" />
                    Ajouter
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {risquesDuNoeud.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun risque pour ce lot.</p>
                  ) : (
                    risquesDuNoeud.map((r) => (
                      <div key={r.id_risque} className="p-3 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start gap-3">
                          <p className="font-semibold text-slate-900 text-sm">{r.description_risque}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={r.statut_risque === 'Ouvert' ? 'warning' : 'success'} size="sm">{r.statut_risque}</Badge>
                            <IconButton variant="secondary" size="sm" icon="edit" tooltip="Modifier" onClick={() => openEdit(r)} />
                            <IconButton variant="danger" size="sm" icon="delete" tooltip="Supprimer" onClick={() => handleDelete(r)} />
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">
                          Score {r.score_risque} · Probabilité {r.probabilite} · Impact {r.impact}
                        </p>
                        {r.description_mitigation && (
                          <p className="text-xs text-slate-500 mt-1">Mitigation : {r.description_mitigation}</p>
                        )}
                      </div>
                    ))
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={draft.id ? 'Modifier le risque' : 'Ajouter un risque'} size="lg">
        <div className="space-y-4">
          {selectedNode && (
            <p className="text-xs text-blue-700 bg-blue-50 rounded-md px-3 py-2">
              Lot WBS : {selectedNode.code_wbs} — {selectedNode.nom_travail}
            </p>
          )}
          <InputText label="Description du risque" type="textarea" value={draft.description_risque} onChange={(e) => setDraft(d => ({ ...d, description_risque: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <InputSelect label="Probabilité" value={draft.probabilite} onChange={(e) => setDraft(d => ({ ...d, probabilite: e.target.value }))} options={NIVEAUX.map(n => ({ value: n, label: n }))} />
            <InputSelect label="Impact" value={draft.impact} onChange={(e) => setDraft(d => ({ ...d, impact: e.target.value }))} options={NIVEAUX.map(n => ({ value: n, label: n }))} />
            <InputSelect label="Catégorie" value={draft.categorie_risque} onChange={(e) => setDraft(d => ({ ...d, categorie_risque: e.target.value }))} options={CATEGORIES.map(c => ({ value: c, label: c }))} />
            <InputSelect label="Statut" value={draft.statut_risque} onChange={(e) => setDraft(d => ({ ...d, statut_risque: e.target.value }))} options={STATUTS.map(s => ({ value: s, label: s }))} />
            <InputText label="Responsable mitigation" value={draft.responsable_mitigation} onChange={(e) => setDraft(d => ({ ...d, responsable_mitigation: e.target.value }))} />
          </div>
          <InputText label="Stratégie de mitigation" type="textarea" value={draft.description_mitigation} onChange={(e) => setDraft(d => ({ ...d, description_mitigation: e.target.value }))} />
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
