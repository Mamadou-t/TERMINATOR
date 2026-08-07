import { useEffect, useMemo, useState } from 'react';
import { InputText } from '../../InputText';
import { InputSelect } from '../../InputSelect';
import { Badge } from '../../Badge';
import { Button } from '../../Button';
import { Alert } from '../../Alert';
import Icon from '../../Icon';
import { IconButton } from '../../IconButton';
import { Modal, ModalFooter } from '../../Modal';
import { useProjet } from '../../../context/ProjetContext';
import { useConfirm } from '../../../hooks/useConfirm';
import { parseExigences, splitNomEntite } from '../../../types/helpers';

const formatMontant = (value: number) => `${(value || 0).toLocaleString('fr-FR')} XOF`;

const TYPES_LIVRABLE = ['Produit', 'Service', 'Document', 'Infrastructure', 'Autre'];

const emptyLigne = { designation: '', prix_unitaire: '', quantite: '1' };
const emptyPhase = { phase: '', duree: '', date_debut: '', date_fin: '', activites_cles: '' };
const emptyLivrable = { nom_livrable: '', description_livrable: '', type_livrable: 'Produit', date_livraison_prevue: '' };

export default function CharteProjet() {
  const {
    projet, charte, livrables, partiesPrenantes, lignesBudgetaires, lignesCalendrier,
    updateProjet, updateCharte,
    upsertLivrable, removeLivrable,
    upsertLigneBudgetaire, removeLigneBudgetaire,
    upsertLigneCalendrier, removeLigneCalendrier
  } = useProjet();

  const { confirm, ConfirmDialog } = useConfirm();

  const [ligneModal, setLigneModal] = useState<{ open: boolean; draft: { id?: string } & typeof emptyLigne }>({ open: false, draft: { ...emptyLigne } });
  const [phaseModal, setPhaseModal] = useState<{ open: boolean; draft: { id?: string } & typeof emptyPhase }>({ open: false, draft: { ...emptyPhase } });
  const [livrableModal, setLivrableModal] = useState<{ open: boolean; draft: { id?: string } & typeof emptyLivrable }>({ open: false, draft: { ...emptyLivrable } });

  const [approbations, setApprobations] = useState({
    sponsor: { approuve: false, date: '' },
    chef: { approuve: false, date: '' }
  });

  // Envoi de la charte à une partie prenante (approbation ou information)
  const [envoiPpId, setEnvoiPpId] = useState('');
  const [envoiObjet, setEnvoiObjet] = useState<'approbation' | 'information'>('approbation');
  const [canaux, setCanaux] = useState<{ email: boolean; whatsapp: boolean }>({ email: true, whatsapp: false });

  const toggleCanal = (canal: 'email' | 'whatsapp') =>
    setCanaux((c) => ({ ...c, [canal]: !c[canal] }));

  const envoiPp = useMemo(
    () => partiesPrenantes.find(p => p.id_partie_prenante === envoiPpId),
    [partiesPrenantes, envoiPpId]
  );

  const buildEnvoiMessage = () => {
    const contact = envoiPp ? splitNomEntite(envoiPp.nom_entite).nom : '';
    const intro = contact ? `Bonjour ${contact},` : 'Bonjour,';
    const finalite = envoiObjet === 'approbation'
      ? "nous vous invitons à approuver la charte du projet"
      : "nous vous transmettons pour information la charte du projet";
    return `${intro}\n\n${finalite} « ${projet.nom_projet} ».\n\nMerci de votre retour.`;
  };

  const envoyer = () => {
    if (!envoiPp) return;
    const { email, telephone } = parseExigences(envoiPp.exigences);
    const message = buildEnvoiMessage();

    if (canaux.email && email) {
      const sujet = `Charte du projet « ${projet.nom_projet} » — ${envoiObjet === 'approbation' ? 'pour approbation' : 'pour information'}`;
      window.open(`mailto:${email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(message)}`, '_blank');
    }
    if (canaux.whatsapp && telephone) {
      const numero = telephone.replace(/\D/g, '');
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const sponsor = useMemo(() => partiesPrenantes.find(p => p.role === 'Sponsor'), [partiesPrenantes]);
  const chefProjet = useMemo(() => partiesPrenantes.find(p => p.role === 'Chef projet'), [partiesPrenantes]);

  // Durée estimative calculée à partir des dates de démarrage et de clôture.
  const dureeEstimative = useMemo(() => {
    const { date_debut_prevue: d1, date_fin_prevue: d2 } = projet;
    if (!d1 || !d2) return '—';
    const diffDays = Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / 86_400_000);
    if (Number.isNaN(diffDays) || diffDays < 0) return '—';
    const mois = Math.floor(diffDays / 30);
    return mois > 0 ? `${diffDays} jours (~${mois} mois)` : `${diffDays} jours`;
  }, [projet.date_debut_prevue, projet.date_fin_prevue]);

  const budgetTotal = useMemo(
    () => lignesBudgetaires.reduce((sum, l) => sum + (l.prix_unitaire || 0) * (l.quantite || 0), 0),
    [lignesBudgetaires]
  );

  useEffect(() => {
    const bothApproved = !!sponsor && !!chefProjet && approbations.sponsor.approuve && approbations.chef.approuve;
    const nextStatut = bothApproved ? 'Approuvé' : 'En attente d\'approbation';
    if (charte.statut_charte === nextStatut) return;

    const dates = [approbations.sponsor.date, approbations.chef.date].filter(Boolean).sort();

    updateCharte({
      statut_charte: nextStatut,
      date_approbation: bothApproved ? dates[dates.length - 1] : undefined,
      commentaires_approbation: bothApproved
        ? `Sponsor (${sponsor!.nom_entite}) approuve le ${approbations.sponsor.date} ; Chef de projet (${chefProjet!.nom_entite}) approuve le ${approbations.chef.date}.`
        : ''
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sponsor, chefProjet, approbations.sponsor.approuve, approbations.sponsor.date, approbations.chef.approuve, approbations.chef.date, charte.statut_charte]);

  // ===== LIVRABLES =====
  const openAddLivrable = () => setLivrableModal({ open: true, draft: { ...emptyLivrable } });
  const openEditLivrable = (l: typeof livrables[number]) => setLivrableModal({
    open: true,
    draft: {
      id: l.id_livrable,
      nom_livrable: l.nom_livrable,
      description_livrable: l.description_livrable || '',
      type_livrable: l.type_livrable || 'Produit',
      date_livraison_prevue: l.date_livraison_prevue || ''
    }
  });
  const saveLivrable = () => {
    const d = livrableModal.draft;
    if (!d.nom_livrable.trim()) return;
    const existing = d.id ? livrables.find(x => x.id_livrable === d.id) : undefined;
    upsertLivrable({
      id_livrable: d.id || `liv-${Date.now()}`,
      nom_livrable: d.nom_livrable.trim(),
      description_livrable: d.description_livrable.trim(),
      type_livrable: d.type_livrable || 'Produit',
      date_livraison_prevue: d.date_livraison_prevue || '',
      statut_livrable: existing?.statut_livrable || 'Planifié',
      id_projet: projet.id_projet
    });
    setLivrableModal({ open: false, draft: { ...emptyLivrable } });
  };

  const handleRemoveLivrable = async (id: string, nom: string) => {
    const ok = await confirm({ message: `Supprimer le livrable "${nom}" ? Cette action est irréversible.` });
    if (ok) removeLivrable(id);
  };

  // ===== LIGNES BUDGETAIRES =====
  const openAddLigne = () => setLigneModal({ open: true, draft: { ...emptyLigne } });
  const openEditLigne = (l: typeof lignesBudgetaires[number]) => setLigneModal({
    open: true,
    draft: { id: l.id_ligne, designation: l.designation, prix_unitaire: String(l.prix_unitaire ?? ''), quantite: String(l.quantite ?? '') }
  });
  const saveLigne = () => {
    const d = ligneModal.draft;
    if (!d.designation.trim()) return;
    const existing = d.id ? lignesBudgetaires.find(x => x.id_ligne === d.id) : undefined;
    upsertLigneBudgetaire({
      id_ligne: d.id || `ligne-${Date.now()}`,
      designation: d.designation.trim(),
      prix_unitaire: d.prix_unitaire ? parseFloat(d.prix_unitaire) : 0,
      quantite: d.quantite ? parseFloat(d.quantite) : 0,
      ordre: existing?.ordre ?? lignesBudgetaires.length,
      id_charte: charte.id_charte
    });
    setLigneModal({ open: false, draft: { ...emptyLigne } });
  };

  const handleRemoveLigne = async (id: string, designation: string) => {
    const ok = await confirm({ message: `Supprimer la ligne budgétaire "${designation}" ?` });
    if (ok) removeLigneBudgetaire(id);
  };

  // ===== CALENDRIER PREVISIONNEL =====
  const openAddPhase = () => setPhaseModal({ open: true, draft: { ...emptyPhase } });
  const openEditPhase = (l: typeof lignesCalendrier[number]) => setPhaseModal({
    open: true,
    draft: {
      id: l.id_ligne,
      phase: l.phase,
      duree: l.duree || '',
      date_debut: l.date_debut || '',
      date_fin: l.date_fin || '',
      activites_cles: l.activites_cles || ''
    }
  });
  const savePhase = () => {
    const d = phaseModal.draft;
    if (!d.phase.trim()) return;
    const existing = d.id ? lignesCalendrier.find(x => x.id_ligne === d.id) : undefined;
    upsertLigneCalendrier({
      id_ligne: d.id || `cal-${Date.now()}`,
      phase: d.phase.trim(),
      duree: d.duree.trim(),
      date_debut: d.date_debut || undefined,
      date_fin: d.date_fin || undefined,
      activites_cles: d.activites_cles.trim(),
      ordre: existing?.ordre ?? lignesCalendrier.length,
      id_charte: charte.id_charte
    });
    setPhaseModal({ open: false, draft: { ...emptyPhase } });
  };

  const handleRemovePhase = async (id: string, phase: string) => {
    const ok = await confirm({ message: `Supprimer la phase "${phase}" du calendrier ?` });
    if (ok) removeLigneCalendrier(id);
  };

  const formatDateCourt = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* 1. INFORMATIONS DU PROJET */}
      <section className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
          <h2 className="text-lg font-semibold text-slate-900">Informations du Projet</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputText label="Nom du projet" value={projet.nom_projet} onChange={(e) => updateProjet({ nom_projet: e.target.value })} />
          <InputText label="Localisation" placeholder="Ex. Abidjan, Cocody" value={charte.localisation || ''} onChange={(e) => updateCharte({ localisation: e.target.value })} />
          <InputText label="Type de projet" placeholder="Ex. Construction, Réhabilitation" value={charte.type_projet || ''} onChange={(e) => updateCharte({ type_projet: e.target.value })} />
          <InputText label="Sponsor ou Maître d'Ouvrage" value={charte.sponsor_ouvrage || ''} onChange={(e) => updateCharte({ sponsor_ouvrage: e.target.value })} />
          <InputText label="Chef de Projet" value={charte.chef_projet || ''} onChange={(e) => updateCharte({ chef_projet: e.target.value })} />
          <InputText label="Date de démarrage prévisionnelle" type="date" value={projet.date_debut_prevue || ''} onChange={(e) => updateProjet({ date_debut_prevue: e.target.value })} />
          <InputText label="Date de clôture prévisionnelle" type="date" value={projet.date_fin_prevue || ''} onChange={(e) => updateProjet({ date_fin_prevue: e.target.value })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Durée estimative</label>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{dureeEstimative}</div>
          </div>
        </div>
        <InputText label="Description du projet" type="textarea" value={projet.description_projet} onChange={(e) => updateProjet({ description_projet: e.target.value })} />
      </section>

      {/* 2. CALENDRIER PRÉVISIONNEL */}
      <section className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
            <h2 className="text-lg font-semibold text-slate-900">Calendrier prévisionnel</h2>
          </div>
          <Button size="sm" icon="plus" onClick={openAddPhase}>Ajouter une phase</Button>
        </div>

        {/* Tableau des phases */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2">Phase</th>
                <th className="px-4 py-2">Durée</th>
                <th className="px-4 py-2">Dates</th>
                <th className="px-4 py-2">Activités clés</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lignesCalendrier.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">Aucune phase. Cliquez sur « Ajouter une phase ».</td>
                </tr>
              ) : (
                lignesCalendrier.map((l) => (
                  <tr key={l.id_ligne} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-2 font-medium text-slate-900">{l.phase}</td>
                    <td className="px-4 py-2 text-slate-700">{l.duree || '—'}</td>
                    <td className="px-4 py-2 text-slate-700 whitespace-nowrap">{formatDateCourt(l.date_debut)} → {formatDateCourt(l.date_fin)}</td>
                    <td className="px-4 py-2 text-slate-700">{l.activites_cles || '—'}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <IconButton variant="secondary" size="sm" icon="edit" tooltip="Modifier" onClick={() => openEditPhase(l)} />
                        <IconButton variant="danger" size="sm" icon="delete" tooltip="Supprimer" onClick={() => handleRemovePhase(l.id_ligne, l.phase)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. BUDGET PRÉVISIONNEL */}
      <section className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
            <h2 className="text-lg font-semibold text-slate-900">Budget prévisionnel du Projet</h2>
          </div>
          <Button size="sm" icon="plus" onClick={openAddLigne}>Ajouter une ligne</Button>
        </div>

        {/* Tableau des lignes */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2">Désignation</th>
                <th className="px-4 py-2 text-right">Prix unitaire</th>
                <th className="px-4 py-2 text-right">Quantité</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lignesBudgetaires.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">Aucune ligne budgétaire. Cliquez sur « Ajouter une ligne ».</td>
                </tr>
              ) : (
                lignesBudgetaires.map((l) => (
                  <tr key={l.id_ligne} className="border-b border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-900">{l.designation}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{formatMontant(l.prix_unitaire)}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{l.quantite}</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900">{formatMontant((l.prix_unitaire || 0) * (l.quantite || 0))}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <IconButton variant="secondary" size="sm" icon="edit" tooltip="Modifier" onClick={() => openEditLigne(l)} />
                        <IconButton variant="danger" size="sm" icon="delete" tooltip="Supprimer" onClick={() => handleRemoveLigne(l.id_ligne, l.designation)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-amber-50">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Budget prévisionnel total</td>
                <td className="px-4 py-3 text-right text-base font-bold text-amber-700">{formatMontant(budgetTotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 3. CONTEXTE ET JUSTIFICATION */}
      <section className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">4</span>
          <h2 className="text-lg font-semibold text-slate-900">Contexte et Justification</h2>
        </div>
        <InputText
          label="Contexte et justification du projet"
          type="textarea"
          placeholder="Décrivez le contexte, le problème ou l'opportunité, et la justification du projet"
          value={charte.justification_projet || ''}
          onChange={(e) => updateCharte({ justification_projet: e.target.value })}
        />
      </section>

      {/* 4. OBJECTIFS */}
      <section className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">5</span>
          <h2 className="text-lg font-semibold text-slate-900">Objectifs du Projet</h2>
        </div>
        <InputText
          label="Objectif général"
          type="textarea"
          placeholder="L'objectif global du projet"
          value={charte.objectif_general || ''}
          onChange={(e) => updateCharte({ objectif_general: e.target.value })}
        />
        <InputText
          label="Objectifs spécifiques"
          type="textarea"
          placeholder="Listez les objectifs spécifiques (un par ligne)"
          value={charte.objectifs_specifiques || ''}
          onChange={(e) => updateCharte({ objectifs_specifiques: e.target.value })}
        />
      </section>

      {/* 5. LIVRABLES */}
      <section className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">6</span>
            <h2 className="text-lg font-semibold text-slate-900">Livrables du Projet</h2>
          </div>
          <Button size="sm" icon="plus" onClick={openAddLivrable}>Ajouter un livrable</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Date prévue</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {livrables.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">Aucun livrable. Cliquez sur « Ajouter un livrable ».</td>
                </tr>
              ) : (
                livrables.map((l) => (
                  <tr key={l.id_livrable} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-2">
                      <p className="font-medium text-slate-900">{l.nom_livrable}</p>
                      {l.description_livrable && <p className="text-xs text-slate-500">{l.description_livrable}</p>}
                    </td>
                    <td className="px-4 py-2"><Badge variant="info">{l.type_livrable}</Badge></td>
                    <td className="px-4 py-2 whitespace-nowrap text-slate-700">{formatDateCourt(l.date_livraison_prevue)}</td>
                    <td className="px-4 py-2"><Badge variant="secondary">{l.statut_livrable}</Badge></td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <IconButton variant="secondary" size="sm" icon="edit" tooltip="Modifier" onClick={() => openEditLivrable(l)} />
                        <IconButton variant="danger" size="sm" icon="delete" tooltip="Supprimer" onClick={() => handleRemoveLivrable(l.id_livrable, l.nom_livrable)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. APPROBATION & SIGNATURE */}
      <section className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">7</span>
          <h2 className="text-lg font-semibold text-slate-900">Approbation & Validation du Projet</h2>
        </div>

        {partiesPrenantes.length === 0 ? (
          <Alert
            variant="warning"
            title="Parties prenantes requises"
            message="Ajoutez d'abord au moins une partie prenante (avec le rôle Sponsor et le rôle Chef projet) dans le domaine Parties prenantes avant de renseigner l'approbation."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Sponsor */}
              <div className="rounded-lg border border-slate-300 p-4">
                <div className="mb-3 flex items-center gap-2">
                  {approbations.sponsor.approuve ? <Badge variant="success">Approuvé</Badge> : <Badge variant="secondary">En attente</Badge>}
                </div>
                {sponsor ? (
                  <>
                    <p className="font-semibold text-slate-900">{sponsor.nom_entite}</p>
                    <p className="mb-2 text-sm text-slate-600">Sponsor du projet</p>
                    <InputText label="Date d'approbation" type="date" value={approbations.sponsor.date} onChange={(e) => setApprobations({ ...approbations, sponsor: { date: e.target.value, approuve: !!e.target.value } })} />
                  </>
                ) : (
                  <p className="text-sm text-slate-600">Aucune partie prenante avec le rôle "Sponsor" pour le moment.</p>
                )}
              </div>

              {/* Chef de Projet */}
              <div className="rounded-lg border border-slate-300 p-4">
                <div className="mb-3 flex items-center gap-2">
                  {approbations.chef.approuve ? <Badge variant="success">Approuvé</Badge> : <Badge variant="secondary">En attente</Badge>}
                </div>
                {chefProjet ? (
                  <>
                    <p className="font-semibold text-slate-900">{chefProjet.nom_entite}</p>
                    <p className="mb-2 text-sm text-slate-600">Chef de projet</p>
                    <InputText label="Date d'approbation" type="date" value={approbations.chef.date} onChange={(e) => setApprobations({ ...approbations, chef: { date: e.target.value, approuve: !!e.target.value } })} />
                  </>
                ) : (
                  <p className="text-sm text-slate-600">Aucune partie prenante avec le rôle "Chef projet" pour le moment.</p>
                )}
              </div>
            </div>

            {/* Signatures des approbateurs (importées sur les parties prenantes) */}
            <div className="rounded-lg border border-slate-300 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Signatures</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { libelle: 'Sponsor', pp: sponsor, date: approbations.sponsor.date, approuve: approbations.sponsor.approuve },
                  { libelle: 'Chef de projet', pp: chefProjet, date: approbations.chef.date, approuve: approbations.chef.approuve }
                ].map(({ libelle, pp, date, approuve }) => (
                  <div key={libelle} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{libelle}</p>
                    <p className="mt-0.5 font-medium text-slate-900">{pp?.nom_entite || '—'}</p>
                    <div className="mt-2 flex h-24 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50">
                      {pp?.signature_image
                        ? <img src={pp.signature_image} alt={`Signature ${libelle}`} className="h-full w-auto object-contain" />
                        : <span className="text-xs text-slate-400">Signature non fournie</span>}
                    </div>
                    {approuve && date && <p className="mt-1 text-xs text-slate-500">Approuvé le {date}</p>}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Les signatures proviennent des parties prenantes (importées lors de leur création).</p>
            </div>

            {/* Envoi à une partie prenante */}
            <div className="rounded-lg border border-slate-300 p-4">
              <h3 className="mb-1 text-sm font-semibold text-slate-900">Envoyer à une partie prenante</h3>
              <p className="mb-3 text-xs text-slate-500">Transmettez la charte pour approbation ou information, sur un ou plusieurs canaux à la fois.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputSelect
                  label="Partie prenante"
                  value={envoiPpId}
                  onChange={(e) => setEnvoiPpId(e.target.value)}
                  options={partiesPrenantes.map(pp => ({ value: pp.id_partie_prenante, label: pp.nom_entite }))}
                />
                <InputSelect
                  label="Objet"
                  value={envoiObjet}
                  onChange={(e) => setEnvoiObjet(e.target.value as 'approbation' | 'information')}
                  options={[{ value: 'approbation', label: 'Pour approbation' }, { value: 'information', label: 'Pour information' }]}
                />
              </div>
              {envoiPp && (() => {
                const { email, telephone } = parseExigences(envoiPp.exigences);
                const rienSelectionne = !canaux.email && !canaux.whatsapp;
                return (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Moyens d'envoi</label>
                      <div className="flex flex-wrap gap-2">
                        <label className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${email ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-100 opacity-50 cursor-not-allowed'}`}>
                          <input type="checkbox" checked={canaux.email && !!email} disabled={!email} onChange={() => toggleCanal('email')} className="h-4 w-4 accent-[#1e3a5f]" />
                          <Icon name="mail" size="sm" /> E-mail
                        </label>
                        <label className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${telephone ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-100 opacity-50 cursor-not-allowed'}`}>
                          <input type="checkbox" checked={canaux.whatsapp && !!telephone} disabled={!telephone} onChange={() => toggleCanal('whatsapp')} className="h-4 w-4 accent-[#1e3a5f]" />
                          <Icon name="message" size="sm" /> WhatsApp
                        </label>
                      </div>
                      {!email && <p className="mt-1 text-xs text-amber-600">E-mail non renseigné pour cette partie prenante.</p>}
                      {!telephone && <p className="mt-1 text-xs text-amber-600">Téléphone non renseigné pour WhatsApp.</p>}
                    </div>
                    <Button variant="primary" size="sm" disabled={rienSelectionne} onClick={envoyer}>
                      <Icon name="upload" size="sm" />
                      Envoyer
                    </Button>
                  </div>
                );
              })()}
            </div>

            {/* Statut global */}
            <div className="rounded-lg border border-gray-200 bg-gray-50  border-dashed border-2 p-4">
              <p className="mb-2 text-sm text-emerald-700">Statut global de la charte</p>
              <div className="flex items-center gap-2">
                {sponsor && chefProjet && approbations.sponsor.approuve && approbations.chef.approuve ? (
                  <>
                    <Badge variant="success" className="px-4 py-2 text-lg">APPROUVÉ</Badge>
                    <p className="text-sm text-emerald-700">La charte est officiellement approuvée et le projet peut démarrer.</p>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary" className="px-4 py-2 text-lg">En attente d'approbation</Badge>
                    <p className="text-sm text-slate-600">
                      {(!sponsor || !approbations.sponsor.approuve) && 'Sponsor requis '}
                      {(!chefProjet || !approbations.chef.approuve) && '• Chef de Projet requis'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Modal ligne budgétaire */}
      <Modal isOpen={ligneModal.open} onClose={() => setLigneModal({ open: false, draft: { ...emptyLigne } })} title={ligneModal.draft.id ? 'Modifier la ligne budgétaire' : 'Ajouter une ligne budgétaire'} size="md">
        <div className="space-y-4">
          <InputText label="Désignation" placeholder="Ex. Coffrage" value={ligneModal.draft.designation} onChange={(e) => setLigneModal(m => ({ ...m, draft: { ...m.draft, designation: e.target.value } }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputText label="Prix unitaire (XOF)" type="number" value={ligneModal.draft.prix_unitaire} onChange={(e) => setLigneModal(m => ({ ...m, draft: { ...m.draft, prix_unitaire: e.target.value } }))} />
            <InputText label="Quantité" type="number" value={ligneModal.draft.quantite} onChange={(e) => setLigneModal(m => ({ ...m, draft: { ...m.draft, quantite: e.target.value } }))} />
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setLigneModal({ open: false, draft: { ...emptyLigne } })}>Annuler</Button>
          <Button variant="primary" onClick={saveLigne}>{ligneModal.draft.id ? 'Enregistrer' : 'Ajouter'}</Button>
        </ModalFooter>
      </Modal>

      {/* Modal phase calendrier */}
      <Modal isOpen={phaseModal.open} onClose={() => setPhaseModal({ open: false, draft: { ...emptyPhase } })} title={phaseModal.draft.id ? 'Modifier la phase' : 'Ajouter une phase'} size="lg">
        <div className="space-y-4">
          <InputText label="Phase" placeholder="Ex. Études et préparation" value={phaseModal.draft.phase} onChange={(e) => setPhaseModal(m => ({ ...m, draft: { ...m.draft, phase: e.target.value } }))} />
          <div className="grid gap-4 sm:grid-cols-3">
            <InputText label="Durée" placeholder="Ex. 2 s" value={phaseModal.draft.duree} onChange={(e) => setPhaseModal(m => ({ ...m, draft: { ...m.draft, duree: e.target.value } }))} />
            <InputText label="Début" type="date" value={phaseModal.draft.date_debut} onChange={(e) => setPhaseModal(m => ({ ...m, draft: { ...m.draft, date_debut: e.target.value } }))} />
            <InputText label="Fin" type="date" value={phaseModal.draft.date_fin} onChange={(e) => setPhaseModal(m => ({ ...m, draft: { ...m.draft, date_fin: e.target.value } }))} />
          </div>
          <InputText label="Activités clés" type="textarea" placeholder="Principales activités de la phase" value={phaseModal.draft.activites_cles} onChange={(e) => setPhaseModal(m => ({ ...m, draft: { ...m.draft, activites_cles: e.target.value } }))} />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setPhaseModal({ open: false, draft: { ...emptyPhase } })}>Annuler</Button>
          <Button variant="primary" onClick={savePhase}>{phaseModal.draft.id ? 'Enregistrer' : 'Ajouter'}</Button>
        </ModalFooter>
      </Modal>

      {/* Modal livrable */}
      <Modal isOpen={livrableModal.open} onClose={() => setLivrableModal({ open: false, draft: { ...emptyLivrable } })} title={livrableModal.draft.id ? 'Modifier le livrable' : 'Ajouter un livrable'} size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputText label="Nom" placeholder="Ex. Fondations" value={livrableModal.draft.nom_livrable} onChange={(e) => setLivrableModal(m => ({ ...m, draft: { ...m.draft, nom_livrable: e.target.value } }))} />
            <InputSelect
              label="Type"
              value={livrableModal.draft.type_livrable}
              onChange={(e) => setLivrableModal(m => ({ ...m, draft: { ...m.draft, type_livrable: e.target.value } }))}
              options={TYPES_LIVRABLE.map((t) => ({ value: t, label: t }))}
            />
          </div>
          <InputText label="Date de livraison prévue" type="date" value={livrableModal.draft.date_livraison_prevue} onChange={(e) => setLivrableModal(m => ({ ...m, draft: { ...m.draft, date_livraison_prevue: e.target.value } }))} />
          <InputText label="Description" type="textarea" placeholder="Décrivez le livrable" value={livrableModal.draft.description_livrable} onChange={(e) => setLivrableModal(m => ({ ...m, draft: { ...m.draft, description_livrable: e.target.value } }))} />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setLivrableModal({ open: false, draft: { ...emptyLivrable } })}>Annuler</Button>
          <Button variant="primary" onClick={saveLivrable}>{livrableModal.draft.id ? 'Enregistrer' : 'Ajouter'}</Button>
        </ModalFooter>
      </Modal>

      {ConfirmDialog}
    </div>
  );
}
