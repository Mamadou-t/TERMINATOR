import { useState } from 'react';
import { Icon, Badge, Button, InputText, Card, CardHeader, CardContent } from '../../';

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
    <div className="w-full flex">

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
        {/* Title Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Parties prenantes</h1>
            <p className="text-sm text-gray-600 mt-1">Identifiez et gérez l'ensemble des acteurs du projet.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" icon="filter">
              Filtrer
            </Button>
            <Button variant="primary" size="sm" icon="plus">
              Ajouter une partie prenante
            </Button>
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
            <Card className="col-span-3">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{filteredStakeholders.length} parties prenantes identifiées</h3>
                <InputText
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="sm"
                  icon="search"
                  className="w-48"
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
                          <Badge variant={stakeholder.roleBadge === 'b-blue' ? 'info' : stakeholder.roleBadge === 'b-green' ? 'success' : stakeholder.roleBadge === 'b-purple' ? 'primary' : 'gray'} size="sm">
                            {stakeholder.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <ScoreBar value={stakeholder.influence} />
                        </td>
                        <td className="px-4 py-3">
                          <ScoreBar value={stakeholder.interest} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={stakeholder.strategyBadge === 'b-green' ? 'success' : stakeholder.strategyBadge === 'b-amber' ? 'warning' : 'info'} size="sm">
                            {stakeholder.strategy}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={stakeholder.statusBadge === 'b-green' ? 'success' : stakeholder.statusBadge === 'b-amber' ? 'warning' : 'danger'} size="sm">
                            {stakeholder.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Side Panels */}
            <div className="flex flex-col gap-4">
              {/* Detail Panel */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden ">
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
                  <Button variant="secondary" size="sm">
                    Modifier
                  </Button>
                </div>
                <div className="px-4 py-3 space-y-3 text-xs  ">
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
                        <Badge key={i} variant="info" size="sm">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>
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
