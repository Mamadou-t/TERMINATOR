import { useState } from 'react';
import { Badge, InputText, Icon, Button } from '../../index';

interface WBSNode {
  id: string;
  code: string;
  name: string;
  status: 'Terminé' | 'En cours' | 'À faire';
  statusColor: string;
  assignee?: string;
  children?: WBSNode[];
  isExpanded?: boolean;
  isSelected?: boolean;
  description?: string;
  acceptanceCriteria?: string[];
  estimatedDuration?: number;
  estimatedCost?: number;
  inScope?: string;
  outOfScope?: string;
}

export default function WBS() {
  const [selectedNode, setSelectedNode] = useState<WBSNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '1.1', '1.2']));

  const [wbsData] = useState<WBSNode>({
    id: '1',
    code: '1',
    name: 'Refonte SI Ressources Humaines',
    status: 'En cours',
    statusColor: 'b-navy',
    children: [
      {
        id: '1.1',
        code: '1.1',
        name: 'Initialisation & cadrage',
        status: 'Terminé',
        statusColor: 'b-green',
        isExpanded: true,
        children: [
          {
            id: '1.1.1',
            code: '1.1.1',
            name: 'Charte du projet',
            status: 'Terminé',
            statusColor: 'b-green',
            assignee: 'AK',
            description: 'Document formalisant les objectifs, périmètre et contraintes du projet.',
            acceptanceCriteria: ['Approuvé par le sponsor', 'Signé par toutes les parties'],
            estimatedDuration: 5,
            estimatedCost: 50000,
            inScope: 'Définition objectifs, périmètre, contraintes',
            outOfScope: 'Exécution technique'
          },
          {
            id: '1.1.2',
            code: '1.1.2',
            name: 'Registre parties prenantes',
            status: 'Terminé',
            statusColor: 'b-green',
            assignee: 'AK',
            description: 'Identification et analyse des parties prenantes du projet.',
            acceptanceCriteria: ['Toutes parties identifiées', 'Stratégies définies'],
            estimatedDuration: 3,
            estimatedCost: 25000,
            inScope: 'Identification, analyse influence/intérêt',
            outOfScope: 'Gestion opérationnelle'
          },
          {
            id: '1.1.3',
            code: '1.1.3',
            name: 'Étude de faisabilité',
            status: 'Terminé',
            statusColor: 'b-green',
            assignee: 'OS',
            description: 'Analyse technique et économique de la faisabilité du projet.',
            acceptanceCriteria: ['ROI calculé', 'Risques identifiés'],
            estimatedDuration: 10,
            estimatedCost: 150000,
            inScope: 'Analyse technique, économique',
            outOfScope: 'Développement'
          }
        ]
      },
      {
        id: '1.2',
        code: '1.2',
        name: 'Conception & architecture SIRH',
        status: 'En cours',
        statusColor: 'b-amber',
        isExpanded: true,
        children: [
          {
            id: '1.2.1',
            code: '1.2.1',
            name: 'Architecture technique cible',
            status: 'En cours',
            statusColor: 'b-amber',
            assignee: 'OS',
            isSelected: true,
            description: 'Définir l\'architecture technique du SIRH : choix de la plateforme, infrastructure cloud, sécurité des données et intégrations API avec les systèmes existants.',
            acceptanceCriteria: ['Document d\'architecture validé par DSI', 'Choix technologiques justifiés', 'Validation sécurité RSSI', 'Schéma d\'intégration API approuvé'],
            estimatedDuration: 15,
            estimatedCost: 2500000,
            inScope: 'Architecture cloud, choix SGBD, schéma intégrations, plan de sécurité',
            outOfScope: 'Migration données historiques (traitée en 1.3.2)'
          },
          {
            id: '1.2.2',
            code: '1.2.2',
            name: 'Modélisation des processus RH',
            status: 'En cours',
            statusColor: 'b-amber',
            assignee: 'FT',
            description: 'Modélisation des processus métier RH à automatiser.',
            acceptanceCriteria: ['Processus cartographiés', 'Validation métier'],
            estimatedDuration: 12,
            estimatedCost: 1800000,
            inScope: 'Cartographie processus, optimisation',
            outOfScope: 'Développement logiciel'
          },
          {
            id: '1.2.3',
            code: '1.2.3',
            name: 'Spécifications fonctionnelles',
            status: 'À faire',
            statusColor: 'b-gray',
            description: 'Rédaction des spécifications fonctionnelles détaillées.',
            acceptanceCriteria: ['Spécs validées', 'Cahier des charges complet'],
            estimatedDuration: 20,
            estimatedCost: 3000000,
            inScope: 'Spécifications détaillées',
            outOfScope: 'Développement'
          }
        ]
      },
      {
        id: '1.3',
        code: '1.3',
        name: 'Développement & intégration',
        status: 'À faire',
        statusColor: 'b-gray',
        children: []
      },
      {
        id: '1.4',
        code: '1.4',
        name: 'Formation & déploiement',
        status: 'À faire',
        statusColor: 'b-gray',
        children: []
      },
      {
        id: '1.5',
        code: '1.5',
        name: 'Clôture & bilan',
        status: 'À faire',
        statusColor: 'b-gray',
        children: []
      }
    ]
  });

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const selectNode = (node: WBSNode) => {
    setSelectedNode(node);
  };

  const NodeComponent = ({ node, level = 0 }: { node: WBSNode; level?: number }) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="mb-0.5">
        <div
          className={`flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer border border-transparent transition-colors ${
            isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
          }`}
          onClick={() => selectNode(node)}
        >
          <div
            className="w-4 h-4 rounded border border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer text-xs font-medium text-blue-900"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpanded(node.id);
            }}
          >
            {hasChildren ? (isExpanded ? '−' : '+') : '·'}
          </div>
          <span className={`px-1 py-0.5 rounded text-xs font-medium font-mono ${
            node.code.includes('.') ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-800'
          }`}>
            {node.code}
          </span>
          <span className={`flex-1 text-sm font-medium truncate min-w-0 ${
            level === 0 ? 'text-blue-900 text-base' : 'text-blue-900'
          }`}>
            {node.name}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={node.statusColor as any}>{node.status}</Badge>
            {node.assignee && (
              <span className="text-xs text-gray-500 ml-1">{node.assignee}</span>
            )}
            {isSelected && (
              <div className="flex gap-0.5 opacity-100">
                <button className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50">
                  <Icon name="edit" size="xs" />
                </button>
                <button className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50">
                  <Icon name="plus" size="xs" />
                </button>
              </div>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-5 border-l border-dashed border-gray-300 pl-2">
            {node.children!.map((child) => (
              <NodeComponent key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const getKPIs = () => {
    const nodes = flattenNodes(wbsData);
    const deliverables = nodes.filter(n => n.code.split('.').length === 2).length;
    const lots = nodes.filter(n => n.code.split('.').length === 3).length;
    const tasks = nodes.filter(n => n.code.split('.').length > 3).length;
    const unassigned = nodes.filter(n => !n.assignee).length;

    return { deliverables, lots, tasks, unassigned };
  };

  const flattenNodes = (node: WBSNode): WBSNode[] => {
    const result = [node];
    if (node.children) {
      node.children.forEach(child => {
        result.push(...flattenNodes(child));
      });
    }
    return result;
  };

  const kpis = getKPIs();

  return (
    <div className="flex min-h-screen bg-gray-100 text-sm">
      {/* Sidebar is handled by Layout */}

      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-2 flex items-center gap-1.5 shrink-0">
          <Button variant="primary" size="sm">
            <Icon name="plus" size="sm" />
            Ajouter livrable
          </Button>
          <Button size="sm">
            <Icon name="plus" size="sm" />
            Ajouter sous-tâche
          </Button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          <Button variant="danger" size="sm">
            <Icon name="delete" size="sm" />
            Supprimer
          </Button>
          <div className="ml-auto border border-gray-300 rounded flex overflow-hidden">
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-900 text-white">Calculs de structures</button>
            {/* <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">Tableau</button> */}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-[1fr_300px] min-h-0">
          {/* WBS Panel */}
          <div className="overflow-y-auto p-4">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-2 mb-3.5">
              <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                <div className="w-0.75 h-7 bg-blue-600 rounded"></div>
                <div>
                  <div className="text-xl font-medium text-blue-900">{kpis.deliverables}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Livrables majeurs</div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                <div className="w-0.75 h-7 bg-green-600 rounded"></div>
                <div>
                  <div className="text-xl font-medium text-blue-900">{kpis.lots}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Lots de travaux</div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                <div className="w-0.75 h-7 bg-amber-600 rounded"></div>
                <div>
                  <div className="text-xl font-medium text-blue-900">{kpis.tasks}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Tâches / activités</div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                <div className="w-0.75 h-7 bg-red-600 rounded"></div>
                <div>
                  <div className="text-xl font-medium text-red-600">{kpis.unassigned}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Non assignés</div>
                </div>
              </div>
            </div>

            {/* Scope Bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3.5 flex items-center gap-4">
              <span className="text-xs font-medium text-blue-900">Règle 100%</span>
              <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-blue-600 rounded" style={{ width: '72%' }}></div>
              </div>
              <span className="text-sm font-medium text-blue-800">72% couvert</span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                <Icon name="warning" size="xs" />
                28% périmètre manquant
              </span>
            </div>

            {/* Tree */}
            <div className="text-sm">
              <NodeComponent node={wbsData} />
            </div>
          </div>

          {/* Detail Panel */}
          <div className="border-l border-gray-200 bg-white flex flex-col overflow-y-auto">
            {selectedNode ? (
              <>
                <div className="p-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div>
                    <div className="text-sm font-medium text-blue-900">{selectedNode.code} — {selectedNode.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Lot de travaux sélectionné</div>
                  </div>
                  <Badge variant={selectedNode.statusColor as any}>{selectedNode.status}</Badge>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">
                      Identité du lot
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">Intitulé</label>
                      <InputText value={selectedNode.name} className="w-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Code WBS</label>
                        <InputText value={selectedNode.code} className="w-full font-mono bg-gray-50" readOnly />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Responsable</label>
                        <div className="flex items-center gap-1.5 h-8 border border-gray-300 rounded px-2 bg-white">
                          <div className="w-4.5 h-4.5 rounded-full bg-green-600 flex items-center justify-center text-xs font-medium text-white">
                            {selectedNode.assignee?.[0] || '?'}
                          </div>
                          <span className="text-sm text-blue-900">{selectedNode.assignee || 'Non assigné'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">
                      Description & critères d'acceptation
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-blue-900 bg-white min-h-13 resize-none"
                        value={selectedNode.description || ''}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">Critères d'acceptation</label>
                      <div className="flex flex-col gap-1">
                        {selectedNode.acceptanceCriteria?.map((criteria, index) => (
                          <div key={index} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded text-sm text-blue-900">
                            <div className="w-3.5 h-3.5 rounded flex items-center justify-center">
                              <Icon name="check" size="xs" className="text-green-600" />
                            </div>
                            {criteria}
                          </div>
                        ))}
                      </div>
                      <Button size="sm" className="mt-1.5 text-xs">
                        <Icon name="plus" size="xs" />
                        Ajouter un critère
                      </Button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">
                      Estimation & périmètre
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Durée estimée</label>
                        <div className="flex gap-1">
                          <InputText value={selectedNode.estimatedDuration?.toString() || ''} className="w-12 text-center" />
                          <select className="h-8 border border-gray-300 rounded px-1.5 text-sm text-blue-900 bg-white">
                            <option>jours</option>
                            <option>semaines</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Coût estimé (XOF)</label>
                        <InputText value={selectedNode.estimatedCost?.toLocaleString() || ''} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">Dans le périmètre (inclus)</label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-blue-900 bg-white min-h-10.5 resize-none"
                        value={selectedNode.inScope || ''}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">Hors périmètre (exclus)</label>
                      <textarea
                        className="w-full border border-red-300 rounded px-2 py-1.5 text-sm text-blue-900 bg-white min-h-10.5 resize-none"
                        value={selectedNode.outOfScope || ''}
                        readOnly
                      />
                    </div>
                    <div className="bg-blue-50 border border-blue-300 rounded p-2 text-xs text-blue-800">
                      La règle 100% exige que chaque livrable soit couvert sans chevauchement. Vérifiez l'exclusivité avec les lots connexes.
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-gray-100 flex gap-1.5">
                  <Button className="flex-1 justify-center">Annuler</Button>
                  <Button variant="primary" className="flex-1 justify-center">
                    <Icon name="check" size="sm" />
                    Enregistrer
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Sélectionnez un élément dans l'arbre WBS
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}