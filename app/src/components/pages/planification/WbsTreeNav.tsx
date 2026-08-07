import { useState } from 'react';
import { useProjet } from '../../../context/ProjetContext';
import { buildWbsTree } from '../../../types/helpers';
import type { Wbs } from '../../../types';

export interface WbsTreeNavProps {
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
  countLabel?: (nodeId: string) => string | null;
  emptyMessage?: string;
}

/**
 * Navigation en arborescence WBS, lecture seule (pas d'ajout/edition/
 * suppression de noeud - ca reste le role de la page WBS & Activites).
 * Reutilisee par Couts, Ressources, Risques et Approvisionnements pour
 * naviguer jusqu'au lot de travaux concerne.
 */
export function WbsTreeNav({ selectedNodeId, onSelect, countLabel, emptyMessage }: WbsTreeNavProps) {
  const { wbs } = useProjet();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const rootNodes = buildWbsTree(wbs);

  const toggleExpanded = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const Node = ({ node, level = 0 }: { node: Wbs; level?: number }) => {
    const children = buildWbsTree(wbs, node.id_wbs);
    const isExpanded = expandedNodes.has(node.id_wbs);
    const isSelected = selectedNodeId === node.id_wbs;
    const hasChildren = children.length > 0;
    const label = countLabel?.(node.id_wbs);

    return (
      <div className="mb-0.5">
        <div
          className={`flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer border border-transparent transition-colors ${
            isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(node.id_wbs)}
        >
          <div
            className="w-4 h-4 rounded border border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer text-xs font-medium text-blue-900"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpanded(node.id_wbs);
            }}
          >
            {hasChildren ? (isExpanded ? '−' : '+') : '·'}
          </div>
          <span className={`px-1 py-0.5 rounded text-xs font-medium font-mono ${
            node.code_wbs.includes('.') ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-800'
          }`}>
            {node.code_wbs}
          </span>
          <span className={`flex-1 text-sm font-medium truncate min-w-0 ${level === 0 ? 'text-blue-900 text-base' : 'text-blue-900'}`}>
            {node.nom_travail}
          </span>
          {label && (
            <span className="text-xs text-gray-500 shrink-0">{label}</span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-5 border-l border-dashed border-gray-300 pl-2">
            {children.map((child) => (
              <Node key={child.id_wbs} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (rootNodes.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16 px-4 text-sm">
        {emptyMessage || 'Aucun élément WBS pour ce projet. Créez la structure WBS avant de continuer.'}
      </div>
    );
  }

  return (
    <div className="text-sm">
      {rootNodes.map((node) => (
        <Node key={node.id_wbs} node={node} />
      ))}
    </div>
  );
}
