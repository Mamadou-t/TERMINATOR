import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Icon, InputText, Modal, ModalFooter, Card, SignatureImport } from '../../';
import { useProjet } from '../../../context/ProjetContext';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../hooks/useNotification';
import type { PartiePrenante, RaciValeur } from '../../../types';
import { DROITS_ACCES, RACI_OPTIONS } from '../../../types';
import { InputSelect } from '../../InputSelect';

import {
  generateStakeholderColor,
  joinNomEntite,
  niveauToScore,
  parseExigences,
  parseStatut,
  scoreToNiveau,
  splitNomEntite,
  formatExigences
} from '../../../types/helpers';

interface StakeholderView {
  id: string;
  initials: string;
  name: string;
  org: string;
  role: string;
  type: string;
  roleBadge: string;
  influence: number;
  interest: number;
  strategy: string;
  strategyBadge: string;
  status: string;
  statusBadge: string;
  bgColor: string;
  email: string;
  phone: string;
  strategyText: string;
  expectations: string[];
}

const toStakeholderView = (pp: PartiePrenante): StakeholderView => {
  const { nom, organisation } = splitNomEntite(pp.nom_entite);
  const { email, telephone } = parseExigences(pp.exigences);
  const status = parseStatut(pp.exigences);
  const expectations = pp.attentes.split(',').map(s => s.trim()).filter(Boolean);
  const influence = niveauToScore(pp.pouvoir);
  const interest = niveauToScore(pp.interet);
  const strategy = pp.strategie_engagement;

  const roleBadge =
    pp.role === 'Sponsor' ? 'b-blue' :
    pp.role === 'Chef projet' ? 'b-purple' :
    pp.role === 'Technique' ? 'b-green' : 'b-gray';
  const strategyBadge =
    strategy.toLowerCase().includes('près') ? 'b-green' :
    strategy.toLowerCase().includes('satisfait') ? 'b-amber' : 'b-blue';
  const statusBadge =
    status === 'Favorable' ? 'b-green' :
    status === 'Neutre' ? 'b-amber' : 'b-red';
  const typeBadge =
    pp.type === 'Equipe projet' ? 'b-green' :
    pp.type === 'Parties prénantes' ? 'b-amber-50' : 'b-blue';

  const initials = nom.split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

  return {
    id: pp.id_partie_prenante,
    initials,
    name: nom,
    org: organisation,
    role: pp.role,
    type: pp.type || 'Parties prénantes',
    roleBadge,
    influence,
    interest,
    strategy,
    strategyBadge,
    status,
    statusBadge,
    bgColor: generateStakeholderColor(pp),
    email,
    phone: telephone,
    strategyText: pp.attentes,
    expectations
  };
};

export default function PartiesPrenantes() {
  const { partiesPrenantes, impliquer, projet, livrables, upsertPartiePrenante, removePartiePrenante } = useProjet();
  const { confirm, ConfirmDialog } = useConfirm();
  const { notifyError, NotificationToast } = useNotification();
  const [selectedStakeholder, setSelectedStakeholder] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('registre');

  const projetPartiesPrenantes = useMemo(() => {
    const ids = new Set(
      impliquer.filter(i => i.id_projet === projet.id_projet).map(i => i.id_partie_prenante)
    );
    return partiesPrenantes.filter(p => ids.has(p.id_partie_prenante));
  }, [partiesPrenantes, impliquer, projet.id_projet]);

  const stakeholders = useMemo(() => projetPartiesPrenantes.map(toStakeholderView), [projetPartiesPrenantes]);

  const rawById = useMemo(() => {
    const map = new Map<string, PartiePrenante>();
    projetPartiesPrenantes.forEach(p => map.set(p.id_partie_prenante, p));
    return map;
  }, [projetPartiesPrenantes]);

  // Rôle RACI (un seul par cellule) sélectionné via un menu déroulant.
  const raciCell = (pp: PartiePrenante, livrableId: string): RaciValeur | '' =>
    (pp.raci?.[livrableId]?.[0] as RaciValeur | undefined) || '';

  // Nombre de « A » (Approbateur) sur une ligne (livrable) toutes parties prenantes confondues.
  const lineACount = (livrableId: string) =>
    projetPartiesPrenantes.filter(p => raciCell(p, livrableId) === 'A').length;

  // Une ligne (livrable) possède-t-elle au moins un « R » ?
  const lineHasR = (livrableId: string) =>
    projetPartiesPrenantes.some(p => raciCell(p, livrableId) === 'R');

  const setRaciCell = (ppId: string, livrableId: string, valeur: RaciValeur | '') => {
    const pp = rawById.get(ppId);
    if (!pp) return;
    // Règle : au plus un « A » (Approbateur) par ligne.
    if (valeur === 'A') {
      const dejaA = projetPartiesPrenantes.some(p => p.id_partie_prenante !== ppId && raciCell(p, livrableId) === 'A');
      if (dejaA) {
        notifyError("Impossible : un seul « A » (Approbateur) est autorisé par ligne.");
        return;
      }
    }
    const raci = { ...(pp.raci || {}) };
    if (valeur) raci[livrableId] = [valeur];
    else delete raci[livrableId];
    void upsertPartiePrenante({ ...pp, raci });
  };

  // Livrables (lignes) sans aucun « R » : à corriger.
  const livrablesSansR = useMemo(
    () => livrables.filter(l => !lineHasR(l.id_livrable)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [livrables, projetPartiesPrenantes]
  );


  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [draft, setDraft] = useState<{
    id?: string;
    initials: string;
    name: string;
    org: string;
    role: string;
    type: string;
    influence: number;
    interest: number;
    strategy: string;
    status: string;
    email: string;
    phone: string;
    strategyText: string;
    expectationsText: string;
    droits: string[];
    signature: string;
  }>({
    initials: '',
    name: '',
    org: '',
    role: '',
    type: '',
    influence: 3,
    interest: 3,
    strategy: '',
    status: '',
    email: '',
    phone: '',
    strategyText: '',
    expectationsText: '',
    droits: [],
    signature: ''
  });

  const toggleDroit = (slug: string) =>
    setDraft(d => ({
      ...d,
      droits: d.droits.includes(slug) ? d.droits.filter(s => s !== slug) : [...d.droits, slug]
    }));

  const [filters, setFilters] = useState<{
    status: 'Tous' | 'Favorable' | 'Neutre' | 'Résistante';
    role: 'Tous' | 'Sponsor' | 'Chef projet' | 'Décideur' | 'Utilisatrice clé' | 'Technique' | 'Fournisseur';
    type: 'Tous' | 'Equipe projet' | 'Parties prénantes';
  }>({
    status: 'Tous',
    role: 'Tous',
    type: 'Tous'
  });

  const getPreviewInitials = (name: string, initials: string) => {
    const source = (initials || name).trim();
    if (!source) return '?';
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase())
      .join('');
  };

  const draftColor = useMemo(() => generateStakeholderColor({
    nom_entite: joinNomEntite(draft.name, draft.org),
    role: draft.role || 'Autre',
    attentes: draft.expectationsText || draft.strategyText,
    exigences: formatExigences(draft.email, draft.phone, draft.status),
    pouvoir: scoreToNiveau(draft.influence),
    interet: scoreToNiveau(draft.interest),
    strategie_engagement: draft.strategy || 'Informer'
  }), [draft.name, draft.org, draft.role, draft.email, draft.phone, draft.influence, draft.interest, draft.strategy, draft.status, draft.expectationsText, draft.strategyText]);

  const StakeholderColorPreview = ({
    color,
    previewInitials
  }: {
    color: string;
    previewInitials: string;
  }) => (
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">Couleur (générée automatiquement)</label>
      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        >
          {previewInitials}
        </div>
        <div>
          <p className="text-sm text-gray-600">
            Dérivée du nom, de l&apos;organisation, du rôle et des autres informations saisies.
          </p>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{color}</p>
        </div>
      </div>
    </div>
  );

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

  const filteredStakeholders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return stakeholders.filter(s => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.org.toLowerCase().includes(q);
      const matchesStatus = filters.status === 'Tous' ? true : s.status === filters.status;
      const matchesRole = filters.role === 'Tous' ? true : s.role === filters.role;
      const matchesType = filters.type === 'Tous' ? true : s.type === filters.type;
      return matchesSearch && matchesStatus && matchesRole && matchesType;
    });
  }, [filters.role, filters.status, filters.type, searchTerm, stakeholders]);

  useEffect(() => {
    if (selectedStakeholder > Math.max(0, filteredStakeholders.length - 1)) {
      setSelectedStakeholder(0);
    }
  }, [filteredStakeholders.length, selectedStakeholder]);

  const openAdd = (type: string = '') => {
    setDraft({
      initials: '',
      name: '',
      org: '',
      role: '',
      type,
      influence: 3,
      interest: 3,
      strategy: '',
      status: '',
      email: '',
      phone: '',
      strategyText: '',
      expectationsText: '',
      droits: ['consulter'],
      signature: ''
    });
    setIsAddOpen(true);
  };

  const openEdit = () => {
    const current = filteredStakeholders[selectedStakeholder];
    if (!current) return;
    const raw = rawById.get(current.id);
    setDraft({
      id: current.id,
      initials: current.initials || '',
      name: current.name || '',
      org: current.org || '',
      role: current.role || '',
      type: current.type || '',
      influence: current.influence || 3,
      interest: current.interest || 3,
      strategy: current.strategy || '',
      status: current.status || '',
      email: current.email || '',
      phone: current.phone || '',
      strategyText: current.strategyText || '',
      expectationsText: (current.expectations || []).join(', '),
      droits: raw?.droits_acces || [],
      signature: raw?.signature_image || ''
    });
    setIsEditOpen(true);
  };

  const upsertStakeholder = () => {
    const name = draft.name.trim();
    const org = draft.org.trim();
    if (!name || !org) return;

    const role = draft.role.trim() || 'Autre';
    const strategy = draft.strategy.trim() || 'Informer';
    const status = draft.status.trim() || 'Neutre';
    const email = draft.email.trim();
    const phone = draft.phone.trim();
    const expectations = draft.expectationsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const existing = draft.id ? rawById.get(draft.id) : undefined;

    const partiePrenante: PartiePrenante = {
      id_partie_prenante: draft.id ?? `pp-${Date.now()}`,
      nom_entite: joinNomEntite(name, org),
      role,
      type: draft.type.trim(),
      attentes: expectations.join(', ') || draft.strategyText.trim(),
      exigences: formatExigences(email, phone, status),
      pouvoir: scoreToNiveau(draft.influence),
      interet: scoreToNiveau(draft.interest),
      strategie_engagement: strategy,
      droits_acces: draft.droits,
      raci: existing?.raci || {},
      signature_image: draft.signature
    };

    upsertPartiePrenante(partiePrenante);
    setIsAddOpen(false);
    setIsEditOpen(false);
  };

  const removeSelectedStakeholder = async () => {
    const current = filteredStakeholders[selectedStakeholder];
    if (!current) return;
    const ok = await confirm({ message: `Retirer "${current.name}" des parties prenantes de ce projet ? Cette action est irréversible.` });
    if (!ok) return;
    removePartiePrenante(current.id);
    setSelectedStakeholder(0);
  };

  return (
    <div className="w-full flex">

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" icon="filter" onClick={() => setIsFilterOpen(true)}>
            Filtrer
          </Button>
          <Button variant="primary" size="sm" icon="plus" onClick={() => openAdd()}>
            Ajouter une partie prenante
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('registre')}
            className={`pb-3 font-semibold text-sm transition-colors ${activeTab === 'registre'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Registre
          </button>
          <button
            onClick={() => setActiveTab('raci')}
            className={`pb-3 font-semibold text-sm transition-colors ${activeTab === 'raci'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Matrice RACI
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`pb-3 font-semibold text-sm transition-colors ${activeTab === 'engagement'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Plan d'engagement
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'registre' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Table */}
            <Card className="lg:col-span-3">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{filteredStakeholders.length} parties prenantes identifiées</h3>

                <div className="flex items-center gap-3">
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


              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Nom / Organisation</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Rôle</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Influence</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Intérêt</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Mission</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStakeholders.map((stakeholder, index) => (
                      <tr
                        key={stakeholder.id}
                        onClick={() => setSelectedStakeholder(index)}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${selectedStakeholder === index ? 'bg-blue-50' : ''
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
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={openEdit}>
                      Modifier
                    </Button>
                    <Button variant="danger" size="sm" onClick={removeSelectedStakeholder} disabled={!filteredStakeholders[selectedStakeholder]}>
                      Retirer
                    </Button>
                  </div>
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
                    <div className="text-gray-600 font-semibold mb-1">Mission</div>
                    <div className="bg-blue-50 p-2 rounded text-gray-700 leading-relaxed">
                      {filteredStakeholders[selectedStakeholder]?.strategyText}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-semibold mb-2">Droits d'accès</div>
                    {(() => {
                      const current = filteredStakeholders[selectedStakeholder];
                      const raw = current ? rawById.get(current.id) : undefined;
                      const droits = raw?.droits_acces || [];
                      if (droits.length === 0) return <p className="text-gray-500">Aucun droit défini.</p>;
                      return (
                        <div className="flex flex-wrap gap-1">
                          {DROITS_ACCES.filter(d => droits.includes(d.slug)).map(d => (
                            <Badge key={d.slug} variant="secondary" size="sm">{d.label}</Badge>
                          ))}
                        </div>
                      );
                    })()}
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

        {activeTab === 'raci' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">Matrice RACI</h3>
                <p className="text-sm text-gray-600 mt-1">Rôle de chaque partie prenante sur les livrables / activités. Règles : au plus un « A » et au moins un « R » par ligne.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                {RACI_OPTIONS.map(o => (
                  <span key={o.valeur} className="inline-flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: o.color }}>{o.valeur}</span>
                    {o.label}
                  </span>
                ))}
              </div>
            </div>

            {stakeholders.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-600">
                Ajoutez d'abord des parties prenantes.
              </div>
            ) : livrables.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-600">Aucun livrable pour construire la matrice.</p>
                <p className="text-sm text-gray-500 mt-1">Ajoutez des livrables dans le domaine « Gestion de l'intégration » (charte).</p>
              </div>
            ) : (
              <div className="space-y-3">
                {livrablesSansR.length > 0 && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span className="font-semibold">À corriger :</span> chaque ligne doit avoir au moins un « R » (Responsable). Livrables concernés : {livrablesSansR.map(l => l.nom_livrable).join(', ')}.
                  </div>
                )}
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-600 sticky left-0 bg-gray-50 min-w-30">Livrables / Activités liés au projet</th>
                          {projetPartiesPrenantes.map(pp => {
                            const view = toStakeholderView(pp);
                            return (
                              <th key={pp.id_partie_prenante} className="border border-gray-200 px-3 py-3 text-center font-semibold text-gray-600 min-w-24">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white" style={{ backgroundColor: view.bgColor }}>
                                    {view.initials}
                                  </div>
                                  <span className="leading-tight">{view.role}</span>
                                  <span className="leading-tight">{view.name}</span>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {livrables.map(l => {
                          const sansR = !lineHasR(l.id_livrable);
                          return (
                            <tr key={l.id_livrable} className={sansR ? 'bg-red-50' : ''}>
                              <td className={`border border-gray-200 px-4 py-2 font-medium text-gray-800 sticky left-0 ${sansR ? 'bg-red-50' : 'bg-white'}`}>
                                {l.nom_livrable}
                                {sansR && <span className="block text-[10px] font-normal text-red-600">Au moins un « R » requis</span>}
                              </td>
                              {projetPartiesPrenantes.map(pp => {
                                const valeur = raciCell(pp, l.id_livrable);
                                const couleur = RACI_OPTIONS.find(o => o.valeur === valeur)?.color;
                                return (
                                  <td key={pp.id_partie_prenante} className="border border-gray-200 px-2 py-2 text-center">
                                    <select
                                      value={valeur}
                                      onChange={(e) => setRaciCell(pp.id_partie_prenante, l.id_livrable, e.target.value as RaciValeur | '')}
                                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                      style={couleur ? { color: couleur } : undefined}
                                    >
                                      <option value="">—</option>
                                      {RACI_OPTIONS.map(o => (
                                        <option key={o.valeur} value={o.valeur}>{o.valeur}</option>
                                      ))}
                                    </select>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Plan d'Engagement</h3>
            <p className="text-gray-600">Plan d'engagement détaillé en développement</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Ajouter une partie prenante"
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputText label="Nom" value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))} />
          <InputText label="Organisation" value={draft.org} onChange={(e) => setDraft(d => ({ ...d, org: e.target.value }))} />
          <InputText label="Rôle" value={draft.role} onChange={(e) => setDraft(d => ({ ...d, role: e.target.value }))} />
          <InputSelect
            label="Type"
            value={draft.type}
            onChange={(e) => setDraft(d => ({ ...d, type: e.target.value }))}
            options={[{ value: 'Parties prénantes', label: 'Partie prenante' }, { value: 'Equipe projet', label: 'Equipe projet' }]}
          />
          <InputText label="Email" type="email" value={draft.email} onChange={(e) => setDraft(d => ({ ...d, email: e.target.value }))} />
          <InputText label="Téléphone" value={draft.phone} onChange={(e) => setDraft(d => ({ ...d, phone: e.target.value }))} />
          <StakeholderColorPreview
            color={draftColor}
            previewInitials={getPreviewInitials(draft.name, draft.initials)}
          />
          <InputText label="Influence (1–5)" type="number" value={String(draft.influence)} onChange={(e) => setDraft(d => ({ ...d, influence: Number(e.target.value) }))} />
          <InputText label="Intérêt (1–5)" type="number" value={String(draft.interest)} onChange={(e) => setDraft(d => ({ ...d, interest: Number(e.target.value) }))} />
          <InputText label="Mission" value={draft.strategy} onChange={(e) => setDraft(d => ({ ...d, strategy: e.target.value }))} />
          {/* <InputText label="Statut" type value={draft.status} onChange={(e) => setDraft(d => ({ ...d, status: e.target.value }))} /> */}
          <InputSelect label="Statut" value={draft.status} onChange={(e) => setDraft(d => ({ ...d, status: e.target.value }))} options={[{ value: 'Favorable', label: 'Favorable' }, { value: 'Résistante', label: 'Résistante' }, { value: 'Neutre', label: 'Neutre' }]} />

        </div>
        <div className="mt-4 space-y-4">
          <InputText label="Mission (détails)" type="textarea" value={draft.strategyText} onChange={(e) => setDraft(d => ({ ...d, strategyText: e.target.value }))} />
          <InputText
            label="Attentes (séparées par des virgules)"
            type="textarea"
            value={draft.expectationsText}
            onChange={(e) => setDraft(d => ({ ...d, expectationsText: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Droits d'accès</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DROITS_ACCES.map(d => (
                <label key={d.slug} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={draft.droits.includes(d.slug)}
                    onChange={() => toggleDroit(d.slug)}
                    className="h-4 w-4 accent-[#1e3a5f]"
                  />
                  <span className="text-gray-800">{d.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">L'invitation par e-mail et l'application effective des droits seront ajoutées ultérieurement.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Signature (importée une fois)</label>
            <SignatureImport value={draft.signature} onChange={(dataUrl) => setDraft(d => ({ ...d, signature: dataUrl }))} height={130} />
            <p className="mt-1 text-xs text-gray-500">Importez la signature de cette partie prenante ; elle s'affichera en bas des documents qu'elle doit signer.</p>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Annuler</Button>
          <Button variant="primary" onClick={upsertStakeholder}>Enregistrer</Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Modifier la partie prenante"
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputText label="Nom" value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))} />
          <InputText label="Organisation" value={draft.org} onChange={(e) => setDraft(d => ({ ...d, org: e.target.value }))} />
          <InputText label="Rôle" value={draft.role} onChange={(e) => setDraft(d => ({ ...d, role: e.target.value }))} />
          <InputSelect
            label="Type"
            value={draft.type}
            onChange={(e) => setDraft(d => ({ ...d, type: e.target.value }))}
            options={[{ value: 'Parties prénantes', label: 'Partie prenante' }, { value: 'Equipe projet', label: 'Equipe projet' }]}
          />
          <InputText label="Email" type="email" value={draft.email} onChange={(e) => setDraft(d => ({ ...d, email: e.target.value }))} />
          <InputText label="Téléphone" value={draft.phone} onChange={(e) => setDraft(d => ({ ...d, phone: e.target.value }))} />
          <StakeholderColorPreview
            color={draftColor}
            previewInitials={getPreviewInitials(draft.name, draft.initials)}
          />
          <InputText label="Influence (1–5)" type="number" value={String(draft.influence)} onChange={(e) => setDraft(d => ({ ...d, influence: Number(e.target.value) }))} />
          <InputText label="Intérêt (1–5)" type="number" value={String(draft.interest)} onChange={(e) => setDraft(d => ({ ...d, interest: Number(e.target.value) }))} />
          <InputText label="Mission" value={draft.strategy} onChange={(e) => setDraft(d => ({ ...d, strategy: e.target.value }))} />
          {/* <InputText label="Statut" value={draft.status} onChange={(e) => setDraft(d => ({ ...d, status: e.target.value }))} /> */}
          <InputSelect label="Statut" value={draft.status} onChange={(e) => setDraft(d => ({ ...d, status: e.target.value }))} options={[{ value: 'Favorable', label: 'Favorable' }, { value: 'Résistante', label: 'Résistante' }, { value: 'Neutre', label: 'Neutre' }]} />

        </div>
        <div className="mt-4 space-y-4">
          <InputText label="Mission (détails)" type="textarea" value={draft.strategyText} onChange={(e) => setDraft(d => ({ ...d, strategyText: e.target.value }))} />
          <InputText
            label="Attentes (séparées par des virgules)"
            type="textarea"
            value={draft.expectationsText}
            onChange={(e) => setDraft(d => ({ ...d, expectationsText: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Droits d'accès</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DROITS_ACCES.map(d => (
                <label key={d.slug} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={draft.droits.includes(d.slug)}
                    onChange={() => toggleDroit(d.slug)}
                    className="h-4 w-4 accent-[#1e3a5f]"
                  />
                  <span className="text-gray-800">{d.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">L'invitation par e-mail et l'application effective des droits seront ajoutées ultérieurement.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Signature (importée une fois)</label>
            <SignatureImport value={draft.signature} onChange={(dataUrl) => setDraft(d => ({ ...d, signature: dataUrl }))} height={130} />
            <p className="mt-1 text-xs text-gray-500">Importez la signature de cette partie prenante ; elle s'affichera en bas des documents qu'elle doit signer.</p>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Annuler</Button>
          <Button variant="primary" onClick={upsertStakeholder}>Enregistrer</Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtres"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="Tous">Tous</option>
              <option value="Favorable">Favorable</option>
              <option value="Neutre">Neutre</option>
              <option value="Résistante">Résistante</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Rôle</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(f => ({ ...f, role: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="Tous">Tous</option>
              <option value="Sponsor">Sponsor</option>
              <option value="Chef projet">Chef projet</option>
              <option value="Décideur">Décideur</option>
              <option value="Utilisatrice clé">Utilisatrice clé</option>
              <option value="Technique">Technique</option>
              <option value="Fournisseur">Fournisseur</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(f => ({ ...f, type: e.target.value as 'Tous' | 'Equipe projet' | 'Parties prénantes' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="Tous">Tous</option>
              <option value="Equipe projet">Equipe projet</option>
              <option value="Parties prénantes">Parties prénantes</option>
            </select>
          </div>
        </div>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setFilters({ status: 'Tous', role: 'Tous', type: 'Tous' });
              setIsFilterOpen(false);
            }}
          >
            Réinitialiser
          </Button>
          <Button variant="primary" onClick={() => setIsFilterOpen(false)}>Appliquer</Button>
        </ModalFooter>
      </Modal>

      {ConfirmDialog}
      {NotificationToast}
    </div>
  );
}
