import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Icon, InputText, Modal, ModalFooter } from './index';
import { InputSelect } from './InputSelect';
import { useConfirm } from '../hooks/useConfirm';
import { useNotification } from '../hooks/useNotification';
import { formatApiError } from '../lib/api';
import { listerProjets, creerOuMajProjet, supprimerProjet } from '../services/demarrageApi';
import { buildProjetTree } from '../types/helpers';
import type { Projet } from '../types';

const STATUTS = ['En attente', 'En cours', 'Terminé', 'Suspendu'] as const;

const emptyDraft = { nom_projet: '', code_projet: '', description_projet: '', statut_projet: 'En attente' as string };

interface ProjetTreeNavProps {
  activeProjetId?: string;
}

export function ProjetTreeNav({ activeProjetId }: ProjetTreeNavProps) {
  const navigate = useNavigate();
  const { confirm, ConfirmDialog } = useConfirm();
  const { notifyError, NotificationToast } = useNotification();

  const [projets, setProjets] = useState<Projet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ id?: string } & typeof emptyDraft>(emptyDraft);

  useEffect(() => {
    let cancelled = false;
    listerProjets()
      .then((rows) => { if (!cancelled) setProjets(rows); })
      .catch((err) => { if (!cancelled) notifyError(formatApiError(err)); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rootNodes = useMemo(() => buildProjetTree(projets), [projets]);

  const toggleExpanded = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openAddRoot = () => {
    setParentId(null);
    setDraft(emptyDraft);
    setIsModalOpen(true);
  };

  const openAddChild = (parent: Projet) => {
    setParentId(parent.id_projet);
    setDraft(emptyDraft);
    setIsModalOpen(true);
    setExpandedNodes((prev) => new Set(prev).add(parent.id_projet));
  };

  const openEdit = (node: Projet) => {
    setParentId(node.id_projet_1 || null);
    setDraft({
      id: node.id_projet,
      nom_projet: node.nom_projet,
      code_projet: node.code_projet,
      description_projet: node.description_projet || '',
      statut_projet: node.statut_projet
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const nom = draft.nom_projet.trim();
    if (!nom) return;

    setIsSaving(true);
    try {
      const existing = draft.id ? projets.find((p) => p.id_projet === draft.id) : undefined;
      const aujourdhui = new Date();
      const finPrevue = new Date(aujourdhui);
      finPrevue.setDate(finPrevue.getDate() + 90);
      const toIso = (date: Date) => date.toISOString().slice(0, 10);

      const payload: Projet = existing
        ? { ...existing, nom_projet: nom, code_projet: draft.code_projet.trim() || existing.code_projet, description_projet: draft.description_projet.trim(), statut_projet: draft.statut_projet, id_projet_1: parentId || undefined }
        : {
            id_projet: '',
            nom_projet: nom,
            code_projet: draft.code_projet.trim() || `PRJ-${Date.now().toString().slice(-6)}`,
            description_projet: draft.description_projet.trim(),
            date_creation: toIso(aujourdhui),
            date_debut_prevue: toIso(aujourdhui),
            date_fin_prevue: toIso(finPrevue),
            statut_projet: draft.statut_projet,
            budget_total: 0,
            id_projet_1: parentId || undefined
          };

      const saved = await creerOuMajProjet(payload);
      setProjets((prev) => {
        const exists = prev.some((p) => p.id_projet === saved.id_projet);
        return exists ? prev.map((p) => (p.id_projet === saved.id_projet ? saved : p)) : [...prev, saved];
      });
      setIsModalOpen(false);
    } catch (err) {
      notifyError(formatApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (node: Projet) => {
    const hasChildren = projets.some((p) => p.id_projet_1 === node.id_projet);
    const ok = await confirm({
      message: hasChildren
        ? `Supprimer "${node.nom_projet}" ? Ses sous-projets ne seront pas supprimés : ils deviendront des projets racine.`
        : `Supprimer "${node.nom_projet}" ? Cette action est irréversible.`
    });
    if (!ok) return;

    try {
      await supprimerProjet(node.id_projet);
      setProjets((prev) =>
        prev
          .filter((p) => p.id_projet !== node.id_projet)
          .map((p) => (p.id_projet_1 === node.id_projet ? { ...p, id_projet_1: undefined } : p))
      );
    } catch (err) {
      notifyError(formatApiError(err));
    }
  };

  const Node = ({ node, level = 0 }: { node: Projet; level?: number }) => {
    const children = buildProjetTree(projets, node.id_projet);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(node.id_projet);
    const isActive = activeProjetId === node.id_projet;

    return (
      <div className="mb-0.5">
        <div
          className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
            isActive ? 'bg-[#ffffff20] text-white' : 'text-[#ffffffcc] hover:bg-[#ffffff10] hover:text-white'
          }`}
          onClick={() => navigate(`/projet/${node.id_projet}/Dashboard`)}
        >
          <div
            className="w-4 h-4 shrink-0 flex items-center justify-center text-xs font-medium text-[#ffffffa0]"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpanded(node.id_projet);
            }}
          >
            {hasChildren ? (isExpanded ? '−' : '+') : '·'}
          </div>
          <span className="flex-1 text-xs truncate min-w-0" title={node.nom_projet}>
            {node.nom_projet}
          </span>
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
            <button
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#ffffff20]"
              onClick={(e) => { e.stopPropagation(); openEdit(node); }}
              title="Modifier"
            >
              <Icon name="edit" size="xs" className="text-[#ffffffcc]" />
            </button>
            <button
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#ffffff20]"
              onClick={(e) => { e.stopPropagation(); openAddChild(node); }}
              title="Ajouter un sous-projet"
            >
              <Icon name="plus" size="xs" className="text-[#ffffffcc]" />
            </button>
            <button
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#ffffff20]"
              onClick={(e) => { e.stopPropagation(); handleDelete(node); }}
              title="Supprimer"
            >
              <Icon name="delete" size="xs" className="text-red-300" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-3 border-l border-dashed border-[#ffffff25] pl-2">
            {children.map((child) => (
              <Node key={child.id_projet} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pl-3 pt-5 overflow-y-auto flex-1">
      <div className="pb-2 flex items-center justify-between pr-3">
        <p className="text-[2vh] text-[#ffffff61]">PROJETS</p>
        <button
          type="button"
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#ffffff15]"
          onClick={openAddRoot}
          title="Ajouter un projet"
        >
          <Icon name="plus" size="xs" className="text-[#ffffffcc]" />
        </button>
      </div>

      <div className="space-y-0.5 pr-2">
        {isLoading ? (
          <p className="text-xs text-[#ffffff61] px-2">Chargement...</p>
        ) : rootNodes.length === 0 ? (
          <p className="text-xs text-[#ffffff61] px-2">Aucun projet. Cliquez sur + pour en créer un.</p>
        ) : (
          rootNodes.map((node) => <Node key={node.id_projet} node={node} />)
        )}
      </div>

      {NotificationToast}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={draft.id ? 'Modifier le projet' : parentId ? 'Ajouter un sous-projet' : 'Créer un projet'} size="md">
        <div className="space-y-4">
          <InputText
            label="Nom du projet"
            placeholder="Ex. Déploiement ERP"
            value={draft.nom_projet}
            onChange={(e) => setDraft((d) => ({ ...d, nom_projet: e.target.value }))}
            required
          />
          <InputText
            label="Code du projet"
            placeholder="Ex. ERP-2026"
            value={draft.code_projet}
            onChange={(e) => setDraft((d) => ({ ...d, code_projet: e.target.value }))}
          />
          <InputText
            label="Description"
            type="textarea"
            value={draft.description_projet}
            onChange={(e) => setDraft((d) => ({ ...d, description_projet: e.target.value }))}
          />
          <InputSelect
            label="Statut"
            value={draft.statut_projet}
            onChange={(e) => setDraft((d) => ({ ...d, statut_projet: e.target.value }))}
            options={STATUTS.map((statut) => ({ label: statut, value: statut }))}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleSave} loading={isSaving}>{draft.id ? 'Enregistrer' : 'Créer'}</Button>
        </ModalFooter>
      </Modal>

      {ConfirmDialog}
    </div>
  );
}
