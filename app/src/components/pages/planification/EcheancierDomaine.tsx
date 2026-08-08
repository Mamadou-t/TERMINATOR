import { useMemo, useState, type ReactNode } from 'react';
import { Button, Icon, IconButton, InputText, Modal, ModalFooter } from '../../index';
import { useProjet } from '../../../context/ProjetContext';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../hooks/useNotification';
import { formatApiError } from '../../../lib/api';
import { buildWbsTree, getNextWbsCode } from '../../../types/helpers';
import type { Activite, Wbs as WbsEntity } from '../../../types';

type Mode = 'wbs' | 'activites' | 'sequencer' | 'durees' | 'gantt';

// Le processus actif détermine l'outil affiché.
const modeFromProcessus = (p?: string): Mode => {
  const s = (p || '').toLowerCase();
  if (s.includes('définir les activités')) return 'activites';
  if (s.includes('séquencer')) return 'sequencer';
  if (s.includes('estimer la durée')) return 'durees';
  if (s.includes('élaborer') || s.includes('maîtriser')) return 'gantt';
  return 'wbs';
};

// Types de relation entre activités (le prédécesseur est le 1er point).
const RELATION_TYPES = [
  { value: 'FD', label: 'Fin → Début (FD)' },
  { value: 'DD', label: 'Début → Début (DD)' },
  { value: 'DF', label: 'Début → Fin (DF)' },
  { value: 'FF', label: 'Fin → Fin (FF)' }
];

interface Lien { id: string; type: string; delai: number }

// Les liens sont stockés « id:type:delai » séparés par des virgules
// (rétrocompatible : « id » seul => FD, délai 0 ; « id:type » => délai 0).
const parseLiens = (raw?: string): Lien[] =>
  (raw || '').split(',').map(s => s.trim()).filter(Boolean).map(s => {
    const [id, type, delai] = s.split(':');
    return { id, type: type || 'FD', delai: Number(delai) || 0 };
  });

const serializeLiens = (liens: Lien[]): string => liens.map(l => `${l.id}:${l.type}:${l.delai}`).join(',');

export default function EcheancierDomaine({ processus }: { processus?: string }) {
  const mode = modeFromProcessus(processus);
  const showActivites = mode !== 'wbs';

  const { wbs, activites, projet, upsertWbs, removeWbs, upsertActivite, removeActivite } = useProjet();
  const { confirm, ConfirmDialog } = useConfirm();
  const { notifySuccess, notifyError, NotificationToast } = useNotification();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedActiviteId, setSelectedActiviteId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const rootNodes = useMemo(() => buildWbsTree(wbs), [wbs]);
  const selectedNode = useMemo(() => wbs.find(w => w.id_wbs === selectedNodeId) || null, [wbs, selectedNodeId]);
  const selectedActivite = useMemo(() => activites.find(a => a.id_activites === selectedActiviteId) || null, [activites, selectedActiviteId]);
  const activitesDuNoeud = useMemo(
    () => (selectedNode ? activites.filter(a => a.id_wbs === selectedNode.id_wbs) : []),
    [activites, selectedNode]
  );

  // ===== WBS =====
  const [wbsModal, setWbsModal] = useState<{ open: boolean; mode: 'add' | 'edit'; parentId: string | null; id?: string; nom: string; description: string; code: string }>(
    { open: false, mode: 'add', parentId: null, nom: '', description: '', code: '' }
  );
  const [savingWbs, setSavingWbs] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openAddRoot = () => setWbsModal({ open: true, mode: 'add', parentId: null, nom: '', description: '', code: String(rootNodes.length + 1) });

  const openAddChild = (parentId?: string) => {
    const pid = parentId ?? selectedNode?.id_wbs;
    const parent = wbs.find(w => w.id_wbs === pid);
    if (!pid || !parent) return;
    setWbsModal({ open: true, mode: 'add', parentId: pid, nom: '', description: '', code: getNextWbsCode(parent, wbs) });
  };

  const openEditWbs = (node: WbsEntity) => setWbsModal({ open: true, mode: 'edit', parentId: node.id_wbs_1 || null, id: node.id_wbs, nom: node.nom_travail, description: node.description_travail || '', code: node.code_wbs });

  const saveWbs = async () => {
    const nom = wbsModal.nom.trim();
    if (!nom) return;
    setSavingWbs(true);
    try {
      if (wbsModal.mode === 'edit' && wbsModal.id) {
        const existing = wbs.find(w => w.id_wbs === wbsModal.id);
        if (!existing) return;
        await upsertWbs({ ...existing, nom_travail: nom, description_travail: wbsModal.description.trim() });
      } else {
        const parent = wbsModal.parentId ? wbs.find(w => w.id_wbs === wbsModal.parentId) : null;
        const code = parent ? getNextWbsCode(parent, wbs) : String(rootNodes.length + 1);
        const saved = await upsertWbs({
          id_wbs: `wbs-${Date.now()}`,
          code_wbs: code,
          nom_travail: nom,
          description_travail: wbsModal.description.trim(),
          niveau_hierarchie: parent ? parent.niveau_hierarchie + 1 : 0,
          id_wbs_1: wbsModal.parentId || undefined,
          id_projet: projet.id_projet
        });
        if (wbsModal.parentId) setExpandedNodes(prev => new Set(prev).add(wbsModal.parentId!));
        setSelectedNodeId(saved.id_wbs);
      }
      setWbsModal(m => ({ ...m, open: false }));
      notifySuccess('Lot WBS enregistré.');
    } catch (err) {
      notifyError(formatApiError(err));
    } finally {
      setSavingWbs(false);
    }
  };

  const handleDeleteNode = async (node: WbsEntity) => {
    const ok = await confirm({ message: `Supprimer "${node.code_wbs} — ${node.nom_travail}" ainsi que tous ses sous-éléments et activités ? Cette action est irréversible.` });
    if (!ok) return;
    removeWbs(node.id_wbs);
    setSelectedNodeId(null);
  };

  // ===== ACTIVITES (définir) =====
  const [actModal, setActModal] = useState<{ open: boolean; id?: string; nom: string; description: string; wbsId: string }>(
    { open: false, nom: '', description: '', wbsId: '' }
  );

  const nextActiviteCode = (node: WbsEntity) => {
    const prefix = `${node.code_wbs}.`;
    const maxSuffix = activites
      .filter(a => a.id_wbs === node.id_wbs)
      .reduce((max, a) => {
        const n = a.code_activite.startsWith(prefix) ? parseInt(a.code_activite.slice(prefix.length), 10) : NaN;
        return Number.isNaN(n) ? max : Math.max(max, n);
      }, 0);
    return `${node.code_wbs}.${maxSuffix + 1}`;
  };

  const openAddActivite = (node: WbsEntity) => setActModal({ open: true, nom: '', description: '', wbsId: node.id_wbs });
  const openEditActivite = (a: Activite) => setActModal({ open: true, id: a.id_activites, nom: a.nom_activite, description: a.description_activite || '', wbsId: a.id_wbs });

  const saveActivite = async () => {
    const nom = actModal.nom.trim();
    const node = wbs.find(w => w.id_wbs === actModal.wbsId);
    if (!nom || !node) return;
    try {
      const existing = actModal.id ? activites.find(a => a.id_activites === actModal.id) : undefined;
      await upsertActivite(existing
        ? { ...existing, nom_activite: nom, description_activite: actModal.description.trim(), id_wbs: actModal.wbsId }
        : {
            id_activites: `act-${Date.now()}`,
            code_activite: nextActiviteCode(node),
            nom_activite: nom,
            description_activite: actModal.description.trim(),
            progression: 0,
            statut_activite: 'À faire',
            id_wbs: actModal.wbsId
          });
      setActModal(m => ({ ...m, open: false }));
      notifySuccess('Activité enregistrée.');
    } catch (err) {
      notifyError(formatApiError(err));
    }
  };

  const handleDeleteActivite = async (a: Activite) => {
    const ok = await confirm({ message: `Supprimer l'activité "${a.nom_activite}" ? Ses coûts et ressources associés seront aussi supprimés.` });
    if (!ok) return;
    removeActivite(a.id_activites);
    if (selectedActiviteId === a.id_activites) setSelectedActiviteId(null);
  };

  // ===== ESTIMER LA DURÉE (modal) =====
  const [dureeModal, setDureeModal] = useState<{ open: boolean; act: Activite | null; duree: string; debut: string; fin: string }>(
    { open: false, act: null, duree: '', debut: '', fin: '' }
  );
  const openDureeModal = (a: Activite) => setDureeModal({ open: true, act: a, duree: a.duree_estimee?.toString() || '', debut: a.date_debut_prevue || '', fin: a.date_fin_prevue || '' });
  const saveDuree = async () => {
    if (!dureeModal.act) return;
    // Alerte si une date dépasse la date de fin prévue du projet.
    const finProjet = projet.date_fin_prevue;
    const depasse = !!finProjet && ((!!dureeModal.debut && dureeModal.debut > finProjet) || (!!dureeModal.fin && dureeModal.fin > finProjet));
    if (depasse) {
      const ok = await confirm({ message: `La date saisie dépasse la date de fin prévue du projet (${fmtDate(finProjet)}). Voulez-vous continuer ?` });
      if (!ok) return;
    }
    try {
      await upsertActivite({
        ...dureeModal.act,
        duree_estimee: dureeModal.duree ? Number(dureeModal.duree) : undefined,
        date_debut_prevue: dureeModal.debut,
        date_fin_prevue: dureeModal.fin
      });
      setDureeModal(m => ({ ...m, open: false }));
      notifySuccess('Durée enregistrée.');
    } catch (err) { notifyError(formatApiError(err)); }
  };

  // ===== SEQUENCER (prédécesseurs / successeurs typés) =====
  const setLiens = (act: Activite, liens: Lien[]) => upsertActivite({ ...act, predecesseurs: serializeLiens(liens) });

  const addPredecesseur = (predId: string, type = 'FD') => {
    if (!selectedActivite || !predId) return;
    const cur = parseLiens(selectedActivite.predecesseurs);
    if (!cur.some(l => l.id === predId)) void setLiens(selectedActivite, [...cur, { id: predId, type, delai: 0 }]);
  };
  const setPredecesseurType = (predId: string, type: string) => {
    if (!selectedActivite) return;
    void setLiens(selectedActivite, parseLiens(selectedActivite.predecesseurs).map(l => l.id === predId ? { ...l, type } : l));
  };
  const setPredecesseurDelai = (predId: string, delai: number) => {
    if (!selectedActivite) return;
    void setLiens(selectedActivite, parseLiens(selectedActivite.predecesseurs).map(l => l.id === predId ? { ...l, delai } : l));
  };
  const removePredecesseur = (predId: string) => {
    if (!selectedActivite) return;
    void setLiens(selectedActivite, parseLiens(selectedActivite.predecesseurs).filter(l => l.id !== predId));
  };
  // Ajouter un successeur = déclarer l'activité courante comme prédécesseur de la cible.
  const addSuccesseur = (succId: string, type = 'FD') => {
    const succ = activites.find(a => a.id_activites === succId);
    if (!succ || !selectedActivite) return;
    const cur = parseLiens(succ.predecesseurs);
    if (!cur.some(l => l.id === selectedActivite.id_activites)) void setLiens(succ, [...cur, { id: selectedActivite.id_activites, type, delai: 0 }]);
  };
  const setSuccesseurType = (succId: string, type: string) => {
    const succ = activites.find(a => a.id_activites === succId);
    if (!succ || !selectedActivite) return;
    void setLiens(succ, parseLiens(succ.predecesseurs).map(l => l.id === selectedActivite.id_activites ? { ...l, type } : l));
  };
  const setSuccesseurDelai = (succId: string, delai: number) => {
    const succ = activites.find(a => a.id_activites === succId);
    if (!succ || !selectedActivite) return;
    void setLiens(succ, parseLiens(succ.predecesseurs).map(l => l.id === selectedActivite.id_activites ? { ...l, delai } : l));
  };
  const removeSuccesseur = (succId: string) => {
    const succ = activites.find(a => a.id_activites === succId);
    if (!succ || !selectedActivite) return;
    void setLiens(succ, parseLiens(succ.predecesseurs).filter(l => l.id !== selectedActivite.id_activites));
  };

  // Successeurs de A = activités dont A est prédécesseur (type + délai du lien).
  const successeursDe = (a: Activite): Lien[] =>
    activites
      .map(x => ({ x, lien: parseLiens(x.predecesseurs).find(l => l.id === a.id_activites) }))
      .filter(o => o.lien)
      .map(o => ({ id: o.x.id_activites, type: o.lien!.type, delai: o.lien!.delai }));
  const activiteLabel = (id: string) => {
    const a = activites.find(x => x.id_activites === id);
    return a ? `${a.nom_activite}` : id;
  };


  // ===== Rendu de l'arbre =====
  const NodeComponent = ({ node, level = 0 }: { node: WbsEntity; level?: number }) => {
    const children = buildWbsTree(wbs, node.id_wbs);
    const nodeActivites = showActivites ? activites.filter(a => a.id_wbs === node.id_wbs) : [];
    const isExpanded = expandedNodes.has(node.id_wbs);
    const isSelected = selectedNodeId === node.id_wbs && !selectedActiviteId;
    const hasContent = children.length > 0 || nodeActivites.length > 0;

    return (
      <div className="mb-0.5">
        <div
          className={`flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer border border-transparent transition-colors ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
          onClick={() => { setSelectedNodeId(node.id_wbs); setSelectedActiviteId(null); }}
        >
          <div
            className="w-4 h-4 rounded border border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer text-xs font-medium text-blue-900 shrink-0"
            onClick={(e) => { e.stopPropagation(); if (hasContent) toggleExpanded(node.id_wbs); }}
          >
            {hasContent ? (isExpanded ? '−' : '+') : '·'}
          </div>
          <Icon name="folder" size="xs" className="text-blue-700 shrink-0" />
          <span className="px-1 py-0.5 rounded text-xs font-medium font-mono bg-blue-100 text-blue-800 shrink-0">{node.code_wbs}</span>
          <span className="flex-1 truncate min-w-0 font-semibold text-blue-900 text-sm">{node.nom_travail}</span>
          <div className="flex items-center gap-1 shrink-0">
            {showActivites && nodeActivites.length > 0 && (
              <span className="text-xs text-gray-500">{nodeActivites.length} act.</span>
            )}
            {mode === 'wbs' && isSelected && (
              <div className="flex gap-0.5">
                <IconButton variant="secondary" size="sm" icon="edit" tooltip="Modifier" onClick={(e) => { e.stopPropagation(); openEditWbs(node); }} />
                <IconButton variant="secondary" size="sm" icon="plus" tooltip="Ajouter une sous-tâche" onClick={(e) => { e.stopPropagation(); openAddChild(node.id_wbs); }} />
                <IconButton variant="danger" size="sm" icon="delete" tooltip="Supprimer" onClick={(e) => { e.stopPropagation(); handleDeleteNode(node); }} />
              </div>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="ml-5 border-l border-dashed border-gray-300 pl-2">
            {children.map(child => <NodeComponent key={child.id_wbs} node={child} level={level + 1} />)}
            {nodeActivites.map(a => {
              const actSelected = selectedActiviteId === a.id_activites;
              return (
                <div
                  key={a.id_activites}
                  className={`flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer border transition-colors ${actSelected ? 'bg-blue-50 border-blue-300' : 'border-transparent hover:bg-gray-50'}`}
                  onClick={() => { setSelectedActiviteId(a.id_activites); setSelectedNodeId(a.id_wbs); }}
                >
                  <span className="h-2 w-2 rounded-full bg-[#1e3a5f] shrink-0 ml-1" />
                  <span className="flex-1 truncate min-w-0 text-sm text-gray-700">{a.nom_activite}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const treePanel = (
    <div className="overflow-y-auto p-4">
      {rootNodes.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          Aucun lot WBS. {mode === 'wbs' ? 'Commencez par ajouter un lot racine.' : 'Définissez d\'abord le WBS dans « Planifier le management de l\'échéancier ».'}
        </div>
      ) : (
        <div className="text-sm">{rootNodes.map(node => <NodeComponent key={node.id_wbs} node={node} />)}</div>
      )}
    </div>
  );

  // ===== Panneau de détail =====
  const detailPanel = () => {
    if (mode === 'wbs') {
      if (!selectedNode) return <EmptyDetail text="Sélectionnez un lot WBS." />;
      return (
        <DetailWrap
          title={`${selectedNode.code_wbs} — ${selectedNode.nom_travail}`}
          subtitle="Lot de travaux"
          actions={
            <>
              <Button size="sm" variant="secondary" onClick={() => openEditWbs(selectedNode)}>Modifier</Button>
              <Button size="sm" variant="danger" onClick={() => handleDeleteNode(selectedNode)}>Supprimer</Button>
            </>
          }
        >
          <Section title="Description"><p className="text-sm text-blue-900">{selectedNode.description_travail || 'Aucune description'}</p></Section>
        </DetailWrap>
      );
    }

    if (mode === 'activites') {
      if (!selectedNode) return <EmptyDetail text="Sélectionnez un lot WBS pour gérer ses activités." />;
      return (
        <DetailWrap
          title={`${selectedNode.code_wbs} — ${selectedNode.nom_travail}`}
          subtitle="Activités du lot"
          actions={<Button size="sm" variant="primary" icon="plus" onClick={() => openAddActivite(selectedNode)}>Ajouter une activité</Button>}
        >
          <Section title="Description"><p className="text-sm text-blue-900">{selectedNode.description_travail || 'Aucune description'}</p></Section>
          <div>
            <div className="mb-2 pb-1 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Activités</span>
            </div>
            {activitesDuNoeud.length === 0 ? (
              <p className="text-xs text-gray-500">Aucune activité pour ce lot.</p>
            ) : (
              <div className="space-y-1.5">
                {activitesDuNoeud.map(a => (
                  <div key={a.id_activites} className="flex justify-between items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1e3a5f] truncate">{a.nom_activite}</p>
                      {a.description_activite && <p className="text-xs text-gray-500 truncate">{a.description_activite}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <IconButton variant="secondary" size="sm" icon="edit" tooltip="Modifier" onClick={() => openEditActivite(a)} />
                      <IconButton variant="danger" size="sm" icon="delete" tooltip="Supprimer" onClick={() => handleDeleteActivite(a)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DetailWrap>
      );
    }

    if (mode === 'sequencer') {
      if (!selectedActivite) return <EmptyDetail text="Sélectionnez une activité dans l'arbre pour définir ses liens." />;
      const preds = parseLiens(selectedActivite.predecesseurs);
      const succs = successeursDe(selectedActivite);
      const predIds = preds.map(l => l.id);
      const succIds = succs.map(l => l.id);
      // Candidats : autres activités non déjà liées (évite les cycles directs).
      const predCandidats = activites.filter(a => a.id_activites !== selectedActivite.id_activites && !predIds.includes(a.id_activites) && !succIds.includes(a.id_activites));
      const succCandidats = activites.filter(a => a.id_activites !== selectedActivite.id_activites && !succIds.includes(a.id_activites) && !predIds.includes(a.id_activites));
      return (
        <DetailWrap title={`${selectedActivite.nom_activite}`} subtitle="Séquencement">
          <Section title="Prédécesseurs">
            <LiensEditor
              candidats={predCandidats}
              liens={preds}
              onAdd={addPredecesseur}
              onSetType={setPredecesseurType}
              onSetDelai={setPredecesseurDelai}
              onRemove={removePredecesseur}
              label={activiteLabel}
              placeholder="Ajouter un prédécesseur…"
            />
          </Section>
          <Section title="Successeurs">
            <LiensEditor
              candidats={succCandidats}
              liens={succs}
              onAdd={addSuccesseur}
              onSetType={setSuccesseurType}
              onSetDelai={setSuccesseurDelai}
              onRemove={removeSuccesseur}
              label={activiteLabel}
              placeholder="Ajouter un successeur…"
            />
          </Section>
        </DetailWrap>
      );
    }

    return null;
  };

  // ===== Rendu principal =====
  return (
    <div className="flex h-full flex-col bg-gray-50 text-sm">
      {mode === 'wbs' && (
        <div className="bg-white border-b border-gray-200 p-2 flex items-center justify-end gap-1.5 shrink-0">
          <Button variant="primary" size="sm" icon="plus" onClick={openAddRoot}>Ajouter un WBS</Button>
        </div>
      )}

      {NotificationToast}

      {mode === 'gantt' ? (
        <div className="flex-1 min-h-0 border-t border-gray-200 bg-white flex flex-col">
          <GanttGrid wbs={wbs} activites={activites} rootNodes={rootNodes} expandedNodes={expandedNodes} onToggle={toggleExpanded} selectedActiviteId={selectedActiviteId} onSelectActivite={setSelectedActiviteId} />
        </div>
      ) : mode === 'durees' ? (
        <div className="flex-1 min-h-0 border-t border-gray-200 bg-white flex flex-col">
          <DureesGrid wbs={wbs} activites={activites} rootNodes={rootNodes} expandedNodes={expandedNodes} onToggle={toggleExpanded} selectedActiviteId={selectedActiviteId} onSelectActivite={setSelectedActiviteId} onEdit={openDureeModal} />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] min-h-0 overflow-y-auto lg:overflow-hidden border-t border-gray-200">
          {treePanel}
          <div className="border-t lg:border-l lg:border-t-0 border-gray-200 bg-white flex flex-col overflow-y-auto">{detailPanel()}</div>
        </div>
      )}

      {/* Modal WBS (Planifier) : code / intitulé / description */}
      <Modal isOpen={wbsModal.open} onClose={() => setWbsModal(m => ({ ...m, open: false }))} title={wbsModal.mode === 'edit' ? "Modifier le lot WBS" : (wbsModal.parentId ? 'Ajouter une sous-tâche' : 'Ajouter un lot racine')} size="md">
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-700">Code WBS {wbsModal.mode === 'add' ? '(généré automatiquement)' : ''}</p>
          <p className="mt-1 font-mono text-lg font-semibold text-blue-900">{wbsModal.code}</p>
        </div>
        <div className="space-y-4">
          <InputText label="Intitulé" value={wbsModal.nom} onChange={(e) => setWbsModal(m => ({ ...m, nom: e.target.value }))} />
          <InputText label="Description" type="textarea" value={wbsModal.description} onChange={(e) => setWbsModal(m => ({ ...m, description: e.target.value }))} />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setWbsModal(m => ({ ...m, open: false }))}>Annuler</Button>
          <Button variant="primary" onClick={saveWbs} loading={savingWbs}>{wbsModal.mode === 'edit' ? 'Enregistrer' : 'Ajouter'}</Button>
        </ModalFooter>
      </Modal>

      {/* Modal Activité (Définir) : code / intitulé / description */}
      <Modal isOpen={actModal.open} onClose={() => setActModal(m => ({ ...m, open: false }))} title={actModal.id ? "Modifier l'activité" : 'Ajouter une activité'} size="md">
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-700">Code activité {actModal.id ? '' : '(généré automatiquement)'}</p>
          <p className="mt-1 font-mono text-lg font-semibold text-blue-900">
            {actModal.id
              ? activites.find(a => a.id_activites === actModal.id)?.code_activite
              : (() => { const n = wbs.find(w => w.id_wbs === actModal.wbsId); return n ? nextActiviteCode(n) : '--'; })()}
          </p>
        </div>
        <div className="space-y-4">
          <InputText label="Intitulé" value={actModal.nom} onChange={(e) => setActModal(m => ({ ...m, nom: e.target.value }))} />
          <InputText label="Description" type="textarea" value={actModal.description} onChange={(e) => setActModal(m => ({ ...m, description: e.target.value }))} />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setActModal(m => ({ ...m, open: false }))}>Annuler</Button>
          <Button variant="primary" onClick={saveActivite}>{actModal.id ? 'Enregistrer' : 'Ajouter'}</Button>
        </ModalFooter>
      </Modal>

      {/* Modal Estimation de la durée */}
      <Modal isOpen={dureeModal.open} onClose={() => setDureeModal(m => ({ ...m, open: false }))} title={`Estimer la durée${dureeModal.act ? ` — ${dureeModal.act.nom_activite}` : ''}`} size="md">
        <div className="grid grid-cols-2 gap-4">
          <InputText label="Date de début prévue" type="date" value={dureeModal.debut} onChange={(e) => setDureeModal(m => ({ ...m, debut: e.target.value }))} />
          <InputText label="Date de fin prévue" type="date" value={dureeModal.fin} onChange={(e) => setDureeModal(m => ({ ...m, fin: e.target.value }))} />
          <InputText label="Durée estimée (jours)" type="number" value={dureeModal.duree} onChange={(e) => setDureeModal(m => ({ ...m, duree: e.target.value }))} />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDureeModal(m => ({ ...m, open: false }))}>Annuler</Button>
          <Button variant="primary" onClick={saveDuree}>Enregistrer</Button>
        </ModalFooter>
      </Modal>

      {ConfirmDialog}
    </div>
  );
}

// ===== Sous-composants =====

function EmptyDetail({ text }: { text: string }) {
  return <div className="flex-1 flex items-center justify-center text-gray-500 text-center px-4">{text}</div>;
}

function DetailWrap({ title, subtitle, actions, children }: { title: string; subtitle: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2 p-3 border-b border-gray-100 shrink-0">
        <div className="min-w-0">
          <div className="text-sm font-medium text-blue-900 truncate">{title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">{children}</div>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">{title}</div>
      {children}
    </div>
  );
}

// Éditeur de liens typés (prédécesseurs / successeurs) : ajout par menu
// déroulant + une ligne par lien avec son type de relation (FD/DD/DF/FF).
function LiensEditor({ candidats, liens, onAdd, onSetType, onSetDelai, onRemove, label, placeholder }: {
  candidats: Activite[];
  liens: Lien[];
  onAdd: (id: string) => void;
  onSetType: (id: string, type: string) => void;
  onSetDelai: (id: string, delai: number) => void;
  onRemove: (id: string) => void;
  label: (id: string) => string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <select
        value=""
        disabled={candidats.length === 0}
        onChange={(e) => { if (e.target.value) onAdd(e.target.value); }}
        className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#1e3a5f] disabled:bg-gray-50 disabled:text-gray-400"
      >
        <option value="">{candidats.length === 0 ? 'Aucune activité disponible' : placeholder}</option>
        {candidats.map(a => <option key={a.id_activites} value={a.id_activites}>{a.nom_activite}</option>)}
      </select>
      {liens.length === 0 ? (
        <p className="text-xs text-gray-500">Aucun.</p>
      ) : (
        <div className="space-y-2">
          {liens.map(l => (
            <div key={l.id} className="rounded-lg border border-gray-200 bg-white p-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{label(l.id)}</span>
                <button type="button" onClick={() => onRemove(l.id)} className="shrink-0 text-gray-400 hover:text-red-600" title="Retirer cette relation">
                  <Icon name="x" size="xs" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-[1fr_auto] items-end gap-2">
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-400">Type de relation</label>
                  <select
                    value={l.type}
                    onChange={(e) => onSetType(l.id, e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  >
                    {RELATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-400">Délai</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={l.delai}
                      onChange={(e) => onSetDelai(l.id, Number(e.target.value) || 0)}
                      className="w-14 rounded-md border border-gray-300 bg-white px-2 py-1 text-right text-xs text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                    <span className="text-xs text-gray-500">jours</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Arborescence à plat (WBS + activités) =====

type FlatRow =
  | { kind: 'wbs'; node: WbsEntity; level: number }
  | { kind: 'act'; act: Activite; level: number };

// Aplatit l'arbre en respectant l'état d'expansion (arbre dynamique).
const buildFlatRows = (rootNodes: WbsEntity[], wbs: WbsEntity[], activites: Activite[], expanded: Set<string>, includeActivites = true): FlatRow[] => {
  const out: FlatRow[] = [];
  const walk = (node: WbsEntity, level: number) => {
    out.push({ kind: 'wbs', node, level });
    if (expanded.has(node.id_wbs)) {
      buildWbsTree(wbs, node.id_wbs).forEach(c => walk(c, level + 1));
      if (includeActivites) activites.filter(a => a.id_wbs === node.id_wbs).forEach(a => out.push({ kind: 'act', act: a, level: level + 1 }));
    }
  };
  rootNodes.forEach(n => walk(n, 0));
  return out;
};

const wbsHasContent = (node: WbsEntity, wbs: WbsEntity[], activites: Activite[], includeActivites = true) =>
  buildWbsTree(wbs, node.id_wbs).length > 0 || (includeActivites && activites.some(a => a.id_wbs === node.id_wbs));

// Bouton de pli/dépli (même style que l'arbre principal).
function ToggleBtn({ node, wbs, activites, expanded, onToggle, includeActivites = true }: {
  node: WbsEntity; wbs: WbsEntity[]; activites: Activite[]; expanded: Set<string>; onToggle: (id: string) => void; includeActivites?: boolean;
}) {
  const has = wbsHasContent(node, wbs, activites, includeActivites);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); if (has) onToggle(node.id_wbs); }}
      className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-gray-100 align-middle text-xs font-medium text-blue-900"
    >
      {has ? (expanded.has(node.id_wbs) ? '−' : '+') : '·'}
    </button>
  );
}

const fmtDate = (s?: string) => {
  if (!s) return '—';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
};


// Contenu d'une cellule d'arborescence, au même visuel que l'arbre principal
// (dépliage + icône dossier + code pour les lots, point pour les activités).
function ArboCell({ row, wbs, activites, expandedNodes, onToggle }: {
  row: FlatRow; wbs: WbsEntity[]; activites: Activite[]; expandedNodes: Set<string>; onToggle: (id: string) => void;
}) {
  if (row.kind === 'wbs') {
    return (
      <div className="flex items-center gap-1.5" style={{ paddingLeft: row.level * 18 }}>
        <ToggleBtn node={row.node} wbs={wbs} activites={activites} expanded={expandedNodes} onToggle={onToggle} />
        <Icon name="folder" size="xs" className="text-blue-700 shrink-0" />
        <span className="rounded bg-blue-100 px-1 font-mono text-xs text-blue-800 shrink-0">{row.node.code_wbs}</span>
        <span className="truncate font-semibold text-blue-900">{row.node.nom_travail}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5" style={{ paddingLeft: row.level * 18 + 20 }}>
      <span className="h-2 w-2 rounded-full bg-[#1e3a5f] shrink-0" />
      <span className="truncate text-gray-700">{row.act.nom_activite}</span>
    </div>
  );
}

// ===== Constantes & colonnes partagées (durée) =====

const MS_PER_DAY = 86_400_000;
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const parseDate = (s?: string): Date | null => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : startOfDay(d);
};

const ROW_H = 30;
const DAY_W = 20;
const MONTH_H = 18;
const WEEK_H = 16;
const DAY_H = 22;
const AXIS_H = MONTH_H + WEEK_H + DAY_H;
const TREE_W = 240;
const DUR_W = 60;
const DATE_W = 96;
const ACT_W = 48;

const JOUR_INITIALES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// Cumul des dates d'un lot WBS : début le plus tôt et fin la plus tardive de
// toutes ses activités (y compris celles de ses sous-lots).
const wbsRange = (nodeId: string, wbs: WbsEntity[], activites: Activite[]): { debut?: string; fin?: string } => {
  const debuts: string[] = [];
  const fins: string[] = [];
  const collect = (id: string) => {
    activites.filter(a => a.id_wbs === id).forEach(a => {
      if (a.date_debut_prevue) debuts.push(a.date_debut_prevue);
      if (a.date_fin_prevue) fins.push(a.date_fin_prevue);
    });
    buildWbsTree(wbs, id).forEach(c => collect(c.id_wbs));
  };
  collect(nodeId);
  return {
    debut: debuts.length ? debuts.slice().sort()[0] : undefined,
    fin: fins.length ? fins.slice().sort()[fins.length - 1] : undefined
  };
};

const dureeJours = (debut?: string, fin?: string): number | undefined => {
  const d = parseDate(debut);
  const f = parseDate(fin);
  return d && f ? daysBetween(d, f) + 1 : undefined;
};

// Entêtes des colonnes (le tableau visible commence ici) : Début · Fin · Durée.
function DurHeader({ showAction }: { showAction?: boolean }) {
  const cls = 'flex h-full items-center border-l border-gray-200 px-2';
  return (
    <>
      <div className={cls} style={{ width: DATE_W }}>Début</div>
      <div className={cls} style={{ width: DATE_W }}>Fin</div>
      <div className={`${cls} justify-end`} style={{ width: DUR_W }}>Durée (j)</div>
      {showAction && <div className={`${cls} justify-center`} style={{ width: ACT_W }}>Action</div>}
    </>
  );
}

// Cellules de durée d'une ligne. Pour un lot WBS : cumul des dates de ses activités.
function DurCells({ row, wbs, activites, onEdit }: { row: FlatRow; wbs: WbsEntity[]; activites: Activite[]; onEdit?: (a: Activite) => void }) {
  const cls = 'flex h-full items-center border-l border-gray-100 px-2';
  if (row.kind === 'wbs') {
    const { debut, fin } = wbsRange(row.node.id_wbs, wbs, activites);
    const d = dureeJours(debut, fin);
    return (
      <>
        <div className={`${cls} text-gray-500`} style={{ width: DATE_W }}>{fmtDate(debut)}</div>
        <div className={`${cls} text-gray-500`} style={{ width: DATE_W }}>{fmtDate(fin)}</div>
        <div className={`${cls} justify-end text-gray-500`} style={{ width: DUR_W }}>{d ?? '—'}</div>
        {onEdit && <div className="h-full border-l border-gray-100" style={{ width: ACT_W }} />}
      </>
    );
  }
  return (
    <>
      <div className={`${cls} text-gray-700`} style={{ width: DATE_W }}>{fmtDate(row.act.date_debut_prevue)}</div>
      <div className={`${cls} text-gray-700`} style={{ width: DATE_W }}>{fmtDate(row.act.date_fin_prevue)}</div>
      <div className={`${cls} justify-end text-gray-700`} style={{ width: DUR_W }}>{row.act.duree_estimee ?? '—'}</div>
      {onEdit && (
        <div className="flex h-full items-center justify-center border-l border-gray-100" style={{ width: ACT_W }}>
          <IconButton variant="secondary" size="sm" icon="edit" tooltip="Estimer la durée" onClick={(e) => { e.stopPropagation(); onEdit(row.act); }} />
        </div>
      )}
    </>
  );
}

// ===== Grille « Estimer la durée » : arbre (gauche, sans entête) + colonnes durée =====

function DureesGrid({ wbs, activites, rootNodes, expandedNodes, onToggle, selectedActiviteId, onSelectActivite, onEdit }: {
  wbs: WbsEntity[]; activites: Activite[]; rootNodes: WbsEntity[];
  expandedNodes: Set<string>; onToggle: (id: string) => void;
  selectedActiviteId: string | null; onSelectActivite: (id: string) => void; onEdit: (a: Activite) => void;
}) {
  const rows = buildFlatRows(rootNodes, wbs, activites, expandedNodes);
  if (rootNodes.length === 0) {
    return <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-gray-500">Définissez d'abord le WBS et les activités.</div>;
  }
  return (
    <div className="flex-1 overflow-auto">
      <div className="w-full text-sm">
        {/* Entête : rien au-dessus de l'arbre, colonnes dès « Durée » */}
        <div className="flex w-full border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500" style={{ height: 34 }}>
          <div className="flex-1" />
          <DurHeader showAction />
        </div>
        {rows.map(r => {
          const sel = r.kind === 'act' && r.act.id_activites === selectedActiviteId;
          return (
            <div
              key={r.kind === 'wbs' ? `w${r.node.id_wbs}` : `a${r.act.id_activites}`}
              className={`flex w-full items-center border-b border-gray-100 ${sel ? 'bg-blue-50' : r.kind === 'wbs' ? 'bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}`}
              style={{ height: ROW_H }}
              onClick={() => r.kind === 'act' && onSelectActivite(r.act.id_activites)}
            >
              <div className="min-w-0 flex-1 truncate px-3">
                <ArboCell row={r} wbs={wbs} activites={activites} expandedNodes={expandedNodes} onToggle={onToggle} />
              </div>
              <DurCells row={r} wbs={wbs} activites={activites} onEdit={onEdit} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Élaboration : arbre + colonnes durée (figés) + diagramme de Gantt =====

function GanttGrid({ wbs, activites, rootNodes, expandedNodes, onToggle, selectedActiviteId, onSelectActivite }: {
  wbs: WbsEntity[]; activites: Activite[]; rootNodes: WbsEntity[];
  expandedNodes: Set<string>; onToggle: (id: string) => void;
  selectedActiviteId: string | null; onSelectActivite: (id: string) => void;
}) {
  const rows = buildFlatRows(rootNodes, wbs, activites, expandedNodes);
  const dated = activites
    .map(a => ({ a, d: parseDate(a.date_debut_prevue), f: parseDate(a.date_fin_prevue) }))
    .filter(x => x.d && x.f) as { a: Activite; d: Date; f: Date }[];

  if (dated.length === 0) {
    return <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-gray-500">Renseignez les dates des activités (« Estimer la durée ») pour afficher le diagramme de Gantt.</div>;
  }

  const min = startOfDay(new Date(Math.min(...dated.map(x => x.d.getTime()))));
  const max = startOfDay(new Date(Math.max(...dated.map(x => x.f.getTime()))));
  const totalDays = daysBetween(min, max) + 1;
  const days: Date[] = Array.from({ length: totalDays }, (_, i) => { const d = new Date(min); d.setDate(d.getDate() + i); return d; });

  const months: { label: string; days: number }[] = [];
  const weeks: { label: string; days: number }[] = [];
  days.forEach((d, i) => {
    if (i === 0 || d.getDate() === 1) months.push({ label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }), days: 0 });
    months[months.length - 1].days++;
    if (i === 0 || d.getDay() === 1) weeks.push({ label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), days: 0 });
    weeks[weeks.length - 1].days++;
  });

  const selected = dated.find(x => x.a.id_activites === selectedActiviteId);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {selected && (
        <div className="shrink-0 border-b border-gray-200 bg-blue-50 px-4 py-2 text-xs text-blue-900">
          <span className="font-semibold">{selected.a.nom_activite}</span> — du {fmtDate(selected.a.date_debut_prevue)} au {fmtDate(selected.a.date_fin_prevue)}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <div className="inline-flex min-w-full">
          {/* Panneau gauche figé : arbre + colonnes durée */}
          <div className="sticky left-0 z-20 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.05)]" style={{ width: TREE_W + 2 * DATE_W + DUR_W }}>
            <div className="flex items-center border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500" style={{ height: AXIS_H }}>
              <div style={{ width: TREE_W }} />
              <DurHeader />
            </div>
            {rows.map(r => {
              const sel = r.kind === 'act' && r.act.id_activites === selectedActiviteId;
              return (
                <div
                  key={r.kind === 'wbs' ? `w${r.node.id_wbs}` : `a${r.act.id_activites}`}
                  className={`flex items-center border-b border-gray-100 ${sel ? 'bg-blue-50' : r.kind === 'wbs' ? 'bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}`}
                  style={{ height: ROW_H }}
                  onClick={() => r.kind === 'act' && onSelectActivite(r.act.id_activites)}
                >
                  <div className="truncate px-3 text-xs" style={{ width: TREE_W }}>
                    <ArboCell row={r} wbs={wbs} activites={activites} expandedNodes={expandedNodes} onToggle={onToggle} />
                  </div>
                  <DurCells row={r} wbs={wbs} activites={activites} />
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div style={{ width: totalDays * DAY_W }}>
            {/* Axe : mois / semaines / jours (initiale + numéro) */}
            <div className="bg-gray-50" style={{ height: AXIS_H }}>
              <div className="flex" style={{ height: MONTH_H }}>
                {months.map((m, i) => <div key={i} className="flex items-center justify-center truncate border-l border-gray-300 px-1 text-[10px] font-semibold text-gray-700" style={{ width: m.days * DAY_W }}>{m.label}</div>)}
              </div>
              <div className="flex" style={{ height: WEEK_H }}>
                {weeks.map((w, i) => <div key={i} className="flex items-center justify-center truncate border-l border-gray-200 px-1 text-[9px] text-gray-500" style={{ width: w.days * DAY_W }}>sem. {w.label}</div>)}
              </div>
              <div className="flex" style={{ height: DAY_H }}>
                {days.map((d, i) => {
                  const we = d.getDay() === 0 || d.getDay() === 6;
                  const border = d.getDate() === 1 ? 'border-gray-300' : d.getDay() === 1 ? 'border-gray-200' : 'border-gray-100';
                  return (
                    <div key={i} className={`flex flex-col items-center justify-center border-l leading-none ${border} ${we ? 'bg-gray-100 text-gray-400' : 'text-gray-500'}`} style={{ width: DAY_W }}>
                      <span className="text-[8px] uppercase text-gray-400">{JOUR_INITIALES[d.getDay()]}</span>
                      <span className="text-[9px]">{d.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lignes */}
            {rows.map(r => {
              const sel = r.kind === 'act' && r.act.id_activites === selectedActiviteId;
              const d = r.kind === 'act' ? parseDate(r.act.date_debut_prevue) : null;
              const f = r.kind === 'act' ? parseDate(r.act.date_fin_prevue) : null;
              return (
                <div
                  key={r.kind === 'wbs' ? `w${r.node.id_wbs}` : `a${r.act.id_activites}`}
                  className={`relative border-b border-gray-100 ${sel ? 'bg-blue-50' : r.kind === 'act' ? 'cursor-pointer' : ''}`}
                  style={{ height: ROW_H }}
                  onClick={() => r.kind === 'act' && onSelectActivite(r.act.id_activites)}
                >
                  {days.map((day, i) => {
                    const we = day.getDay() === 0 || day.getDay() === 6;
                    const border = day.getDate() === 1 ? 'border-gray-300' : day.getDay() === 1 ? 'border-gray-200' : 'border-gray-100';
                    return <div key={i} className={`absolute top-0 bottom-0 border-l ${border} ${we ? 'bg-gray-50' : ''}`} style={{ left: i * DAY_W, width: DAY_W }} />;
                  })}
                  {r.kind === 'act' && d && f && (
                    <div
                      className={`absolute rounded ${sel ? 'ring-2 ring-blue-500' : ''}`}
                      style={{ left: daysBetween(min, d) * DAY_W, width: Math.max(daysBetween(d, f) + 1, 1) * DAY_W, top: (ROW_H - 10) / 2, height: 10, backgroundColor: '#1e3a5f' }}
                      title={`${fmtDate(r.act.date_debut_prevue)} → ${fmtDate(r.act.date_fin_prevue)}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
