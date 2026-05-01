import { useState } from 'react';
import { Icon, Badge } from '../index';

export default function PartiesPrenantes() {
  const [selectedStakeholder, setSelectedStakeholder] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('registre');

  const stakeholders = [
    {
      id: 1,
      initials: 'MB',
      name: 'Marc Bédié',
      org: 'DRH — Sponsor',
      role: 'Sponsor',
      roleBadge: 'b-blue',
      influence: 5,
      interest: 5,
      strategy: 'Gérer de près',
      strategyBadge: 'b-green',
      status: 'Favorable',
      statusBadge: 'b-green',
      bgColor: '#1E3A5F',
      email: 'm.bedie@organisation.ci',
      phone: '+225 07 00 00 01',
      strategyText: 'Impliquer dans toutes les décisions majeures. Points hebdomadaires. Présenter les bénéfices RH en priorité.',
      expectations: ['Réduction coûts paie', 'Reporting RH amélioré', 'Conformité réglementaire']
    },
    {
      id: 2,
      initials: 'AK',
      name: 'Aya Koné',
      org: 'DSI — Chef projet',
      role: 'Chef projet',
      roleBadge: 'b-purple',
      influence: 4,
      interest: 5,
      strategy: 'Gérer de près',
      strategyBadge: 'b-green',
      status: 'Favorable',
      statusBadge: 'b-green',
      bgColor: '#2E6B8A',
      email: 'a.kone@organisation.ci',
      phone: '+225 07 00 00 02',
      strategyText: 'Implication quotidienne. Accès à tous les documents. Support technique continu.',
      expectations: ['Maîtrise du planning', 'Qualité de livrable', 'Respect du budget']
    },
    {
      id: 3,
      initials: 'KD',
      name: 'Kofi Diabaté',
      org: 'Directeur Général',
      role: 'Décideur',
      roleBadge: 'b-gray',
      influence: 5,
      interest: 3,
      strategy: 'Maintenir satisfait',
      strategyBadge: 'b-amber',
      status: 'Neutre',
      statusBadge: 'b-amber',
      bgColor: '#5C3A8A',
      email: 'k.diabate@organisation.ci',
      phone: '+225 07 00 00 03',
      strategyText: 'Rapports de synthèse mensuels. Présentation des ROI trimestriels.',
      expectations: ['ROI positif', 'Réduction des délais', 'Conformité']
    },
    {
      id: 4,
      initials: 'FT',
      name: 'Fatou Touré',
      org: 'Responsable Paie',
      role: 'Utilisatrice clé',
      roleBadge: 'b-gray',
      influence: 2,
      interest: 5,
      strategy: 'Informer',
      strategyBadge: 'b-blue',
      status: 'Résistante',
      statusBadge: 'b-red',
      bgColor: '#8A3A3A',
      email: 'f.toure@organisation.ci',
      phone: '+225 07 00 00 04',
      strategyText: 'Formation personnalisée. Écoute de préoccupations. Implication progressive.',
      expectations: ['Facilité d\'utilisation', 'Réduction charge travail', 'Formation']
    },
    {
      id: 5,
      initials: 'OS',
      name: 'Oumar Sanogo',
      org: 'DSI — Architecte',
      role: 'Technique',
      roleBadge: 'b-gray',
      influence: 3,
      interest: 4,
      strategy: 'Gérer de près',
      strategyBadge: 'b-green',
      status: 'Favorable',
      statusBadge: 'b-green',
      bgColor: '#2E8A5A',
      email: 'o.sanogo@organisation.ci',
      phone: '+225 07 00 00 05',
      strategyText: 'Participation à l\'architecture. Validation technique continue.',
      expectations: ['Architecture solide', 'Performance', 'Sécurité']
    },
    {
      id: 6,
      initials: 'NC',
      name: 'Nadia Coulibaly',
      org: 'Prestataire SIRH',
      role: 'Fournisseur',
      roleBadge: 'b-gray',
      influence: 2,
      interest: 4,
      strategy: 'Informer',
      strategyBadge: 'b-blue',
      status: 'Favorable',
      statusBadge: 'b-green',
      bgColor: '#8A6A2E',
      email: 'n.coulibaly@sirh.ci',
      phone: '+225 07 00 00 06',
      strategyText: 'Communication régulière. Respect des jalons contractuels.',
      expectations: ['Paiement régulier', 'Clarté des specs', 'Support technique']
    }
  ];

  const badgeColors = {
    'b-blue': 'bg-blue-100 text-blue-900',
    'b-green': 'bg-green-100 text-green-900',
    'b-amber': 'bg-amber-100 text-amber-900',
    'b-red': 'bg-red-100 text-red-900',
    'b-purple': 'bg-purple-100 text-purple-900',
    'b-gray': 'bg-gray-100 text-gray-900'
  };

  const ScoreBar = ({ value }: { value: number }) => {
    const colors = {
      5: '#E24B4A', // rouge
      4: '#E24B4A',
      3: '#BA7517', // amber
      2: '#185FA5', // bleu
      1: '#185FA5'
    };
    return (
      <div className="flex items-center gap-2">
        <div className="w-15 h-1.5 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full rounded"
            style={{ width: `${(value / 5) * 100}%`, backgroundColor: colors[value as keyof typeof colors] }}
          />
        </div>
        <span className="text-xs font-semibold" style={{ color: colors[value as keyof typeof colors] }}>
          {value}/5
        </span>
      </div>
    );
  };

  const filteredStakeholders = stakeholders.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.org.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Projets</span>
          <span className="text-gray-300">/</span>
          <span>Refonte SI RH</span>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">Parties prenantes</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-300 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            <span className="text-xs font-semibold text-blue-900">Phase 1 — Démarrage</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
        {/* Title Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Parties prenantes</h1>
            <p className="text-sm text-gray-600 mt-1">Identifiez et gérez l'ensemble des acteurs du projet.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-900 hover:bg-gray-50">
              <Icon name="filter" size="sm" />
              Filtrer
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-md text-sm font-semibold text-white hover:bg-gray-800">
              <Icon name="plus" size="sm" />
              Ajouter une partie prenante
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
            <div className="w-0.5 h-8 bg-blue-600 rounded"></div>
            <div>
              <div className="text-xl font-semibold text-gray-900">6</div>
              <div className="text-xs text-gray-600">Total parties prenantes</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
            <div className="w-0.5 h-8 bg-red-500 rounded"></div>
            <div>
              <div className="text-xl font-semibold text-red-700">3</div>
              <div className="text-xs text-gray-600">Influence élevée</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
            <div className="w-0.5 h-8 bg-green-600 rounded"></div>
            <div>
              <div className="text-xl font-semibold text-green-700">4</div>
              <div className="text-xs text-gray-600">Engagées activement</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
            <div className="w-0.5 h-8 bg-amber-600 rounded"></div>
            <div>
              <div className="text-xl font-semibold text-amber-800">1</div>
              <div className="text-xs text-gray-600">À risque / résistantes</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('registre')}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === 'registre'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Registre
          </button>
          <button
            onClick={() => setActiveTab('matrice')}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === 'matrice'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Matrice pouvoir / intérêt
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === 'engagement'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Plan d'engagement
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'registre' && (
          <div className="grid grid-cols-4 gap-4">
            {/* Table */}
            <div className="col-span-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{filteredStakeholders.length} parties prenantes identifiées</h3>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-7 px-2.5 text-xs border border-gray-200 rounded outline-none focus:border-gray-400"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Nom / Organisation</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Rôle</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Influence</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Intérêt</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Stratégie</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStakeholders.map((stakeholder, index) => (
                      <tr
                        key={stakeholder.id}
                        onClick={() => setSelectedStakeholder(index)}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                          selectedStakeholder === index ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                              style={{ backgroundColor: stakeholder.bgColor }}
                            >
                              {stakeholder.initials}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{stakeholder.name}</div>
                              <div className="text-gray-600">{stakeholder.org}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeColors[stakeholder.roleBadge as keyof typeof badgeColors]}`}>
                            {stakeholder.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ScoreBar value={stakeholder.influence} />
                        </td>
                        <td className="px-4 py-3">
                          <ScoreBar value={stakeholder.interest} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeColors[stakeholder.strategyBadge as keyof typeof badgeColors]}`}>
                            {stakeholder.strategy}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeColors[stakeholder.statusBadge as keyof typeof badgeColors]}`}>
                            {stakeholder.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Side Panels */}
            <div className="flex flex-col gap-4">
              {/* Detail Panel */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                      style={{ backgroundColor: filteredStakeholders[selectedStakeholder]?.bgColor }}
                    >
                      {filteredStakeholders[selectedStakeholder]?.initials}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{filteredStakeholders[selectedStakeholder]?.name}</span>
                  </div>
                  <button className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-900 hover:bg-gray-50">
                    Modifier
                  </button>
                </div>
                <div className="px-4 py-3 space-y-3 text-xs max-h-64 overflow-y-auto">
                  <div>
                    <div className="text-gray-600 font-semibold mb-1">Organisation & rôle</div>
                    <div className="text-gray-900">{filteredStakeholders[selectedStakeholder]?.org}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-semibold mb-1">Contact</div>
                    <div className="text-blue-600 font-semibold">{filteredStakeholders[selectedStakeholder]?.email}</div>
                    <div className="text-gray-600">{filteredStakeholders[selectedStakeholder]?.phone}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-semibold mb-2">Niveau d'influence</div>
                    <ScoreBar value={filteredStakeholders[selectedStakeholder]?.influence || 0} />
                  </div>
                  <div>
                    <div className="text-gray-600 font-semibold mb-2">Niveau d'intérêt</div>
                    <ScoreBar value={filteredStakeholders[selectedStakeholder]?.interest || 0} />
                  </div>
                  <div>
                    <div className="text-gray-600 font-semibold mb-1">Stratégie d'engagement</div>
                    <div className="bg-blue-50 p-2 rounded text-gray-700 leading-relaxed">
                      {filteredStakeholders[selectedStakeholder]?.strategyText}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-semibold mb-2">Attentes principales</div>
                    <div className="flex flex-wrap gap-1">
                      {filteredStakeholders[selectedStakeholder]?.expectations.map((exp, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-900 rounded text-xs font-semibold">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Matrix Panel */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-sm">Matrice pouvoir / intérêt</h3>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-green-100 rounded p-2">
                      <div className="font-semibold text-green-900 mb-1">Maintenir satisfait</div>
                      <div className="flex gap-1 flex-wrap">
                        <div className="w-5 h-5 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold" title="KD">KD</div>
                      </div>
                    </div>
                    <div className="bg-red-100 rounded p-2">
                      <div className="font-semibold text-red-900 mb-1">Gérer de près</div>
                      <div className="flex gap-1 flex-wrap">
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#1E3A5F' }}>
                          <span className="text-white text-xs font-bold flex items-center justify-center h-full">MB</span>
                        </div>
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#2E6B8A' }}>
                          <span className="text-white text-xs font-bold flex items-center justify-center h-full">AK</span>
                        </div>
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#2E8A5A' }}>
                          <span className="text-white text-xs font-bold flex items-center justify-center h-full">OS</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded p-2">
                      <div className="font-semibold text-gray-900 mb-1">Surveiller</div>
                    </div>
                    <div className="bg-amber-100 rounded p-2">
                      <div className="font-semibold text-amber-900 mb-1">Informer</div>
                      <div className="flex gap-1 flex-wrap">
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#8A3A3A' }}>
                          <span className="text-white text-xs font-bold flex items-center justify-center h-full">FT</span>
                        </div>
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#8A6A2E' }}>
                          <span className="text-white text-xs font-bold flex items-center justify-center h-full">NC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-900 hover:bg-gray-50">
                    Voir matrice complète ↗
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matrice' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Matrice Pouvoir / Intérêt — Vue complète</h3>
            <p className="text-gray-600">Vue détaillée de la matrice en développement</p>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Plan d'Engagement</h3>
            <p className="text-gray-600">Plan d'engagement détaillé en développement</p>
          </div>
        )}
      </div>
    </div>
  );
}
